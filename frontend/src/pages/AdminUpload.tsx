import React, { useState, useEffect } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonInput, IonButton, IonItem, IonLabel, IonSelect, IonSelectOption, IonButtons, IonMenuButton, IonSpinner } from '@ionic/react';
import { uploadBook } from '../services/bookService';
import { useHistory } from 'react-router-dom';
import api from '../services/api';
import { resizeImage } from '../utils/imageUtils';

const AdminUpload: React.FC = () => {
    const [title, setTitle] = useState('');
    const [authorId, setAuthorId] = useState('');
    const [genreId, setGenreId] = useState('');
    const [cover, setCover] = useState<File | null>(null);
    const [pdf, setPdf] = useState<File | null>(null);
    const [authors, setAuthors] = useState<any[]>([]);
    const [genres, setGenres] = useState<any[]>([]);
    const history = useHistory();

    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        fetchAuthorsAndGenres();
    }, []);

    const fetchAuthorsAndGenres = async () => {
        try {
            const [authorsRes, genresRes] = await Promise.all([
                api.get('/authors'),
                api.get('/genres')
            ]);
            setAuthors(authorsRes.data);
            setGenres(genresRes.data);
        } catch (error) {
            console.error('Error fetching authors/genres:', error);
        }
    };

    const handleUpload = async () => {
        if (!title || !pdf) {
            alert('Por favor completa el título y selecciona un archivo PDF');
            return;
        }

        setIsUploading(true);

        const formData = new FormData();
        formData.append('title', title);
        if (authorId) formData.append('author_id', authorId);
        if (genreId) formData.append('genre_id', genreId);
        if (cover) formData.append('cover_image', cover);
        formData.append('pdf_file', pdf);

        try {
            await uploadBook(formData);
            alert('Libro subido exitosamente');
            history.push('/home');
        } catch (error) {
            alert('Error al subir el libro');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonMenuButton />
                    </IonButtons>
                    <IonTitle>Subir Libro</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                <IonItem>
                    <IonLabel position="floating">Título *</IonLabel>
                    <IonInput value={title} onIonChange={e => setTitle(e.detail.value!)} />
                </IonItem>

                <IonItem>
                    <IonLabel>Autor</IonLabel>
                    <IonSelect value={authorId} onIonChange={e => setAuthorId(e.detail.value)} placeholder="Sin autor">
                        <IonSelectOption value="">Sin autor</IonSelectOption>
                        {authors.map(author => (
                            <IonSelectOption key={author.id} value={author.id}>
                                {author.name}
                            </IonSelectOption>
                        ))}
                    </IonSelect>
                </IonItem>

                <IonItem>
                    <IonLabel>Género</IonLabel>
                    <IonSelect value={genreId} onIonChange={e => setGenreId(e.detail.value)} placeholder="Sin género">
                        <IonSelectOption value="">Sin género</IonSelectOption>
                        {genres.map(genre => (
                            <IonSelectOption key={genre.id} value={genre.id}>
                                {genre.name}
                            </IonSelectOption>
                        ))}
                    </IonSelect>
                </IonItem>

                <IonItem>
                    <IonLabel>Imagen de Portada</IonLabel>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                            if (e.target.files && e.target.files[0]) {
                                try {
                                    const resized = await resizeImage(e.target.files[0]);
                                    setCover(resized);
                                } catch (error) {
                                    console.error('Error resizing image:', error);
                                    setCover(e.target.files[0]); // Fallback to original
                                }
                            } else {
                                setCover(null);
                            }
                        }}
                        style={{ marginTop: '10px' }}
                    />
                </IonItem>

                <IonItem>
                    <IonLabel>Archivo PDF *</IonLabel>
                    <input
                        type="file"
                        accept="application/pdf"
                        onChange={e => setPdf(e.target.files ? e.target.files[0] : null)}
                        style={{ marginTop: '10px' }}
                    />
                </IonItem>

                <IonButton
                    expand="block"
                    onClick={handleUpload}
                    className="ion-margin-top"
                    disabled={isUploading}
                >
                    {isUploading ? (
                        <>
                            <IonSpinner name="crescent" style={{ marginRight: '10px' }} />
                            Subiendo...
                        </>
                    ) : 'Subir Libro'}
                </IonButton>
            </IonContent>
        </IonPage>
    );
};

export default AdminUpload;
