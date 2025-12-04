import React, { useState, useEffect } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonThumbnail, IonLabel, IonButton, IonIcon, IonButtons, IonBackButton, IonToast, IonAlert, IonModal, IonInput, IonSelect, IonSelectOption, IonMenuButton } from '@ionic/react';
import { trashOutline, createOutline } from 'ionicons/icons';
import { adminService } from '../../services/adminService';
import { getBooks } from '../../services/bookService'; // Reuse existing service for listing

const ManageBooks: React.FC = () => {
    const [books, setBooks] = useState<any[]>([]);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [bookToDelete, setBookToDelete] = useState<number | null>(null);
    const [editingBook, setEditingBook] = useState<any>(null);

    // Edit Form State
    const [editTitle, setEditTitle] = useState('');
    const [editGenre, setEditGenre] = useState<number>(0);
    const [editAuthor, setEditAuthor] = useState<number>(0);
    const [genres, setGenres] = useState<any[]>([]);
    const [authors, setAuthors] = useState<any[]>([]);

    useEffect(() => {
        loadBooks();
        loadMetadata();
    }, []);

    const loadBooks = async () => {
        try {
            const data = await getBooks();
            setBooks(data);
        } catch (error) {
            console.error(error);
        }
    };

    const loadMetadata = async () => {
        try {
            const g = await adminService.getGenres();
            const a = await adminService.getAuthors();
            setGenres(g);
            setAuthors(a);
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteBook = async () => {
        if (bookToDelete) {
            try {
                await adminService.deleteBook(bookToDelete);
                setToastMessage('Libro eliminado');
                setShowToast(true);
                loadBooks();
            } catch (error) {
                setToastMessage('Error al eliminar libro');
                setShowToast(true);
            }
            setBookToDelete(null);
        }
    };

    const openEditModal = (book: any) => {
        setEditingBook(book);
        setEditTitle(book.title);
        setEditGenre(book.genre?.id || 0);
        setEditAuthor(book.author?.id || 0);
    };

    const handleUpdateBook = async () => {
        try {
            const formData = new FormData();
            formData.append('title', editTitle);
            formData.append('genre_id', editGenre.toString());
            formData.append('author_id', editAuthor.toString());

            await adminService.updateBook(editingBook.id, formData);
            setToastMessage('Libro actualizado');
            setShowToast(true);
            setEditingBook(null);
            loadBooks();
        } catch (error) {
            setToastMessage('Error al actualizar libro');
            setShowToast(true);
        }
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="/admin" />
                        <IonMenuButton />
                    </IonButtons>
                    <IonTitle>Gestionar Libros</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                <IonList>
                    {books.map(book => (
                        <IonItem key={book.id}>
                            <IonThumbnail slot="start">
                                <img src={book.cover_url || 'assets/placeholder.png'} alt={book.title} />
                            </IonThumbnail>
                            <IonLabel>
                                <h2>{book.title}</h2>
                                <p>{book.author?.name} | {book.genre?.name}</p>
                            </IonLabel>
                            <IonButton fill="clear" onClick={() => openEditModal(book)}>
                                <IonIcon icon={createOutline} />
                            </IonButton>
                            <IonButton fill="clear" color="danger" onClick={() => setBookToDelete(book.id)}>
                                <IonIcon icon={trashOutline} />
                            </IonButton>
                        </IonItem>
                    ))}
                </IonList>

                {/* Edit Modal */}
                <IonModal isOpen={!!editingBook} onDidDismiss={() => setEditingBook(null)}>
                    <IonHeader>
                        <IonToolbar>
                            <IonTitle>Editar Libro</IonTitle>
                            <IonButtons slot="end">
                                <IonButton onClick={() => setEditingBook(null)}>Cerrar</IonButton>
                            </IonButtons>
                        </IonToolbar>
                    </IonHeader>
                    <IonContent className="ion-padding">
                        <IonItem>
                            <IonLabel position="stacked">Título</IonLabel>
                            <IonInput value={editTitle} onIonChange={e => setEditTitle(e.detail.value!)} />
                        </IonItem>
                        <IonItem>
                            <IonLabel position="stacked">Autor</IonLabel>
                            <IonSelect value={editAuthor} onIonChange={e => setEditAuthor(e.detail.value)}>
                                {authors.map(a => (
                                    <IonSelectOption key={a.id} value={a.id}>{a.name}</IonSelectOption>
                                ))}
                            </IonSelect>
                        </IonItem>
                        <IonItem>
                            <IonLabel position="stacked">Género</IonLabel>
                            <IonSelect value={editGenre} onIonChange={e => setEditGenre(e.detail.value)}>
                                {genres.map(g => (
                                    <IonSelectOption key={g.id} value={g.id}>{g.name}</IonSelectOption>
                                ))}
                            </IonSelect>
                        </IonItem>
                        <IonButton expand="block" className="ion-margin-top" onClick={handleUpdateBook}>
                            Guardar Cambios
                        </IonButton>
                    </IonContent>
                </IonModal>

                <IonToast
                    isOpen={showToast}
                    onDidDismiss={() => setShowToast(false)}
                    message={toastMessage}
                    duration={2000}
                />

                <IonAlert
                    isOpen={!!bookToDelete}
                    onDidDismiss={() => setBookToDelete(null)}
                    header={'Confirmar eliminación'}
                    message={'¿Estás seguro de que deseas eliminar este libro?'}
                    buttons={[
                        { text: 'Cancelar', role: 'cancel' },
                        { text: 'Eliminar', handler: handleDeleteBook }
                    ]}
                />
            </IonContent>
        </IonPage>
    );
};

export default ManageBooks;
