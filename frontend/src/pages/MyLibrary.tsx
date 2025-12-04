import React, { useEffect, useState } from 'react';
import {
    IonContent,
    IonHeader,
    IonPage,
    IonTitle,
    IonToolbar,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonButton,
    IonButtons,
    IonMenuButton,
    IonGrid,
    IonRow,
    IonCol,
    IonImg,
    IonBadge,
    useIonViewWillEnter,
    IonIcon,
    IonToast,
    IonSpinner
} from '@ionic/react';
import { trash, cloudDownload, checkmarkCircle } from 'ionicons/icons';
import { getUserLibrary, removeBookFromLibrary } from '../services/bookService';
import { offlineBookService } from '../services/offlineBookService';
import api from '../services/api';
import BookCover from '../components/BookCover';
import { useHistory } from 'react-router-dom';

const MyLibrary: React.FC = () => {
    const [library, setLibrary] = useState<any[]>([]);
    const [downloadedBooks, setDownloadedBooks] = useState<Set<number>>(new Set());
    const [downloading, setDownloading] = useState<number | null>(null);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const history = useHistory();

    useIonViewWillEnter(() => {
        fetchLibrary();
    });

    const fetchLibrary = async () => {
        try {
            const data = await getUserLibrary();
            setLibrary(data);
            checkDownloadedBooks(data);
        } catch (error) {
            console.error('Error fetching library:', error);
            // Fallback to offline books
            const offlineBooks = await offlineBookService.getOfflineBooks();
            setLibrary(offlineBooks);
            checkDownloadedBooks(offlineBooks);
        }
    };

    const checkDownloadedBooks = async (books: any[]) => {
        const downloaded = new Set<number>();
        for (const book of books) {
            const isDownloaded = await offlineBookService.isBookDownloaded(book.id);
            if (isDownloaded) {
                downloaded.add(book.id);
            }
        }
        setDownloadedBooks(downloaded);
    };

    const handleRead = (bookId: number) => {
        history.push(`/reader/${bookId}`);
    };

    const handleDownload = async (bookId: number, title: string) => {
        try {
            setDownloading(bookId);
            const response = await api.get(`/books/${bookId}/pdf`, {
                responseType: 'blob'
            });

            const blob = new Blob([response.data], { type: 'application/pdf' });

            // Find book metadata to save
            const bookToSave = library.find(b => b.id === bookId);
            await offlineBookService.saveBook(bookId, blob, bookToSave);

            setDownloadedBooks(prev => new Set(prev).add(bookId));
            setToastMessage(`"${title}" descargado para lectura offline`);
            setShowToast(true);
        } catch (error) {
            console.error('Error downloading book:', error);
            setToastMessage('Error al descargar el libro');
            setShowToast(true);
        } finally {
            setDownloading(null);
        }
    };

    const handleRemoveBook = async (bookId: number, title: string) => {
        if (!window.confirm(`¿Estás seguro de que quieres eliminar "${title}" de tu biblioteca?`)) {
            return;
        }

        try {
            await removeBookFromLibrary(bookId);
            await offlineBookService.removeBook(bookId); // Also remove from offline storage
            setLibrary(library.filter(b => b.id !== bookId));
            setDownloadedBooks(prev => {
                const newSet = new Set(prev);
                newSet.delete(bookId);
                return newSet;
            });
        } catch (error) {
            console.error('Error removing book:', error);
        }
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonMenuButton />
                    </IonButtons>
                    <IonTitle>Mi Biblioteca</IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent className="ion-padding">
                <IonGrid>
                    <IonRow>
                        {library.length === 0 ? (
                            <IonCol size="12">
                                <p style={{ textAlign: 'center', marginTop: '50px' }}>
                                    No tienes libros descargados.
                                    <br />
                                    Cuando tengas conexión, descarga libros para leerlos aquí.
                                </p>
                            </IonCol>
                        ) : (
                            library.map(book => (
                                <IonCol size="12" sizeMd="6" sizeLg="4" key={book.id}>
                                    <IonCard>
                                        <div style={{ position: 'relative' }}>
                                            <BookCover bookId={book.id} title={book.title} />
                                            <IonButton
                                                color="danger"
                                                size="small"
                                                style={{ position: 'absolute', top: '5px', right: '5px', margin: 0 }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRemoveBook(book.id, book.title);
                                                }}
                                            >
                                                <IonIcon icon={trash} slot="icon-only" />
                                            </IonButton>

                                            {downloadedBooks.has(book.id) && (
                                                <IonBadge color="success" style={{ position: 'absolute', top: '5px', left: '5px' }}>
                                                    <IonIcon icon={checkmarkCircle} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                                                    Offline
                                                </IonBadge>
                                            )}
                                        </div>

                                        <IonCardHeader>
                                            <IonCardTitle>{book.title}</IonCardTitle>
                                        </IonCardHeader>
                                        <IonCardContent>
                                            <p><strong>Autor:</strong> {book.author?.name || 'Desconocido'}</p>
                                            <p><strong>Género:</strong> {book.genre?.name || 'Sin género'}</p>

                                            {book.current_page > 0 && (
                                                <IonBadge color="primary" style={{ marginTop: '10px' }}>
                                                    Página {book.current_page}
                                                </IonBadge>
                                            )}

                                            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                                                <IonButton
                                                    expand="block"
                                                    onClick={() => handleRead(book.id)}
                                                    style={{ flex: 1 }}
                                                >
                                                    Leer
                                                </IonButton>

                                                {!downloadedBooks.has(book.id) && (
                                                    <IonButton
                                                        fill="outline"
                                                        onClick={() => handleDownload(book.id, book.title)}
                                                        disabled={downloading === book.id}
                                                        style={{ width: '50px' }}
                                                    >
                                                        {downloading === book.id ? (
                                                            <IonSpinner name="crescent" style={{ width: '20px', height: '20px' }} />
                                                        ) : (
                                                            <IonIcon icon={cloudDownload} slot="icon-only" />
                                                        )}
                                                    </IonButton>
                                                )}
                                            </div>
                                        </IonCardContent>
                                    </IonCard>
                                </IonCol>
                            ))
                        )}
                    </IonRow>
                </IonGrid>
                <IonToast
                    isOpen={showToast}
                    onDidDismiss={() => setShowToast(false)}
                    message={toastMessage}
                    duration={2000}
                />
            </IonContent>
        </IonPage>
    );
};

export default MyLibrary;
