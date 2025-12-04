import React, { useState, useEffect } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonButton, IonIcon, IonButtons, IonBackButton, IonToast, IonAlert, IonInput, IonMenuButton } from '@ionic/react';
import { trashOutline, createOutline, addOutline } from 'ionicons/icons';
import { adminService } from '../../services/adminService';

const ManageGenres: React.FC = () => {
    const [genres, setGenres] = useState<any[]>([]);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [showAddAlert, setShowAddAlert] = useState(false);
    const [showEditAlert, setShowEditAlert] = useState(false);
    const [selectedGenre, setSelectedGenre] = useState<any>(null);

    useEffect(() => {
        loadGenres();
    }, []);

    const loadGenres = async () => {
        try {
            const data = await adminService.getGenres();
            setGenres(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleAddGenre = async (name: string) => {
        try {
            await adminService.createGenre(name);
            setToastMessage('Género creado');
            setShowToast(true);
            loadGenres();
        } catch (error) {
            setToastMessage('Error al crear género');
            setShowToast(true);
        }
    };

    const handleUpdateGenre = async (name: string) => {
        if (!selectedGenre) return;
        try {
            await adminService.updateGenre(selectedGenre.id, name);
            setToastMessage('Género actualizado');
            setShowToast(true);
            loadGenres();
        } catch (error) {
            setToastMessage('Error al actualizar género');
            setShowToast(true);
        }
    };

    const handleDeleteGenre = async (id: number) => {
        try {
            await adminService.deleteGenre(id);
            setToastMessage('Género eliminado');
            setShowToast(true);
            loadGenres();
        } catch (error) {
            setToastMessage('Error al eliminar género');
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
                    <IonTitle>Gestionar Géneros</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={() => setShowAddAlert(true)}>
                            <IonIcon icon={addOutline} />
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                <IonList>
                    {genres.map(genre => (
                        <IonItem key={genre.id}>
                            <IonLabel>{genre.name}</IonLabel>
                            <IonButton fill="clear" onClick={() => { setSelectedGenre(genre); setShowEditAlert(true); }}>
                                <IonIcon icon={createOutline} />
                            </IonButton>
                            <IonButton fill="clear" color="danger" onClick={() => handleDeleteGenre(genre.id)}>
                                <IonIcon icon={trashOutline} />
                            </IonButton>
                        </IonItem>
                    ))}
                </IonList>

                <IonToast isOpen={showToast} onDidDismiss={() => setShowToast(false)} message={toastMessage} duration={2000} />

                <IonAlert
                    isOpen={showAddAlert}
                    onDidDismiss={() => setShowAddAlert(false)}
                    header={'Nuevo Género'}
                    inputs={[{ name: 'name', type: 'text', placeholder: 'Nombre del género' }]}
                    buttons={[
                        { text: 'Cancelar', role: 'cancel' },
                        { text: 'Crear', handler: (data) => handleAddGenre(data.name) }
                    ]}
                />

                <IonAlert
                    isOpen={showEditAlert}
                    onDidDismiss={() => setShowEditAlert(false)}
                    header={'Editar Género'}
                    inputs={[{ name: 'name', type: 'text', value: selectedGenre?.name, placeholder: 'Nombre del género' }]}
                    buttons={[
                        { text: 'Cancelar', role: 'cancel' },
                        { text: 'Guardar', handler: (data) => handleUpdateGenre(data.name) }
                    ]}
                />
            </IonContent>
        </IonPage>
    );
};

export default ManageGenres;
