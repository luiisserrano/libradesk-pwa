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
  IonToast,
  useIonViewWillEnter,
  IonSpinner
} from '@ionic/react';
import { menuController } from '@ionic/core/components';
import { useHistory } from 'react-router-dom';
import { getBooks, addBookToLibrary } from '../services/bookService';
import BookCover from '../components/BookCover';

const Home: React.FC = () => {
  const [books, setBooks] = useState<any[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const history = useHistory();

  const [addingBookId, setAddingBookId] = useState<number | null>(null);

  useIonViewWillEnter(() => {
    // Rehabilitar el menú al volver de otras páginas
    menuController.enable(true);
    fetchBooks();
  });

  const fetchBooks = async () => {
    try {
      const data = await getBooks();
      setBooks(data);
    } catch (error) {
      console.error('Error fetching books:', error);
      setToastMessage('Error al cargar los libros');
      setShowToast(true);
    }
  };

  const handleAddToLibrary = async (bookId: number, bookTitle: string) => {
    setAddingBookId(bookId);
    try {
      await addBookToLibrary(bookId);
      setToastMessage(`"${bookTitle}" agregado a tu biblioteca`);
      setShowToast(true);
      fetchBooks(); // Recargar lista para actualizar estados si es necesario
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Error al agregar el libro';
      setToastMessage(errorMsg);
      setShowToast(true);
    } finally {
      setAddingBookId(null);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>Explorar Libros</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonGrid>
          <IonRow>
            {books.length === 0 ? (
              <IonCol size="12">
                <p style={{ textAlign: 'center', marginTop: '50px' }}>
                  No hay libros disponibles
                </p>
              </IonCol>
            ) : (
              books.map(book => (
                <IonCol size="12" sizeMd="6" sizeLg="4" key={book.id}>
                  <IonCard>
                    <BookCover bookId={book.id} title={book.title} />
                    <IonCardHeader>
                      <IonCardTitle>{book.title}</IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                      <p><strong>Autor:</strong> {book.author?.name || 'Desconocido'}</p>
                      <p><strong>Género:</strong> {book.genre?.name || 'Sin género'}</p>

                      <IonButton
                        expand="block"
                        onClick={() => handleAddToLibrary(book.id, book.title)}
                        className="ion-margin-top"
                        disabled={addingBookId === book.id}
                      >
                        {addingBookId === book.id ? (
                          <>
                            <IonSpinner name="crescent" style={{ width: '20px', height: '20px', marginRight: '8px' }} />
                            Agregando...
                          </>
                        ) : 'Agregar a Mi Biblioteca'}
                      </IonButton>
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
          position="bottom"
        />
      </IonContent>
    </IonPage>
  );
};

export default Home;
