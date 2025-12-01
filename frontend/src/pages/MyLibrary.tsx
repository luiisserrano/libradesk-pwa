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
    IonIcon
} from '@ionic/react';
import { trash } from 'ionicons/icons';
import { getUserLibrary, removeBookFromLibrary } from '../services/bookService';
import BookCover from '../components/BookCover';
import { useHistory } from 'react-router-dom';

const MyLibrary: React.FC = () => {
    const [library, setLibrary] = useState<any[]>([]);
    const history = useHistory();

    useIonViewWillEnter(() => {
        fetchLibrary();
    });

    const fetchLibrary = async () => {
        try {
            const data = await getUserLibrary();
            setLibrary(data);
        } catch (error) {
            console.error('Error fetching library:', error);
        }
    };

    const handleRead = (bookId: number) => {
        history.push(`/reader/${bookId}`);
    };

    const handleRemoveBook = async (bookId: number, title: string) => {
        if (!window.confirm(`¿Estás seguro de que quieres eliminar "${title}" de tu biblioteca?`)) {
            return;
        }

        try {
            await removeBookFromLibrary(bookId);
            setLibrary(library.filter(b => b.id !== bookId));
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
                                    No tienes libros en tu biblioteca.
                                    <br />
                                    Ve a "Explorar Libros" para agregar algunos.
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

                                            <IonButton
                                                expand="block"
                                                onClick={() => handleRead(book.id)}
                                                className="ion-margin-top"
                                            >
                                                Leer
                                            </IonButton>
                                        </IonCardContent>
                                    </IonCard>
                                </IonCol>
                            ))
                        )}
                    </IonRow>
                </IonGrid>
            </IonContent>
        </IonPage>
    );
};

export default MyLibrary;
