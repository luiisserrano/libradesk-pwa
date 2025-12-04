import React, { useState, useEffect } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonButton, IonIcon, IonButtons, IonBackButton, IonToast, IonAlert, IonMenuButton } from '@ionic/react';
import { trashOutline, createOutline, addOutline } from 'ionicons/icons';
import { adminService } from '../../services/adminService';

const ManageAuthors: React.FC = () => {
    const [authors, setAuthors] = useState<any[]>([]);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [showAddAlert, setShowAddAlert] = useState(false);
    const [showEditAlert, setShowEditAlert] = useState(false);
    const [selectedAuthor, setSelectedAuthor] = useState<any>(null);

    useEffect(() => {
        loadAuthors();
    }, []);

    const loadAuthors = async () => {
        try {
            const data = await adminService.getAuthors();
            setAuthors(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleAddAuthor = async (name: string) => {
        try {
            await adminService.createAuthor(name);
            setToastMessage('Autor creado');
            setShowToast(true);
            loadAuthors();
        } catch (error) {
            setToastMessage('Error al crear autor');
            setShowToast(true);
        }
    };

    const handleUpdateAuthor = async (name: string) => {
        if (!selectedAuthor) return;
        try {
            await adminService.updateAuthor(selectedAuthor.id, name);
            setToastMessage('Autor actualizado');
            setShowToast(true);
            loadAuthors();
        } catch (error) {
            setToastMessage('Error al actualizar autor');
            setShowToast(true);
        }
    };

    const handleDeleteAuthor = async (id: number) => {
        try {
            await adminService.deleteAuthor(id);
            setToastMessage('Autor eliminado');
            setShowToast(true);
            loadAuthors();
        } catch (error) {
            setToastMessage('Error al eliminar autor');
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
                    <IonTitle>Gestionar Autores</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={() => setShowAddAlert(true)}>
                            <IonIcon icon={addOutline} />
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                <IonList>
                    {authors.map(author => (
                        <IonItem key={author.id}>
                            <IonLabel>{author.name}</IonLabel>
                            <IonButton fill="clear" onClick={() => { setSelectedAuthor(author); setShowEditAlert(true); }}>
                                <IonIcon icon={createOutline} />
                            </IonButton>
                            <IonButton fill="clear" color="danger" onClick={() => handleDeleteAuthor(author.id)}>
                                <IonIcon icon={trashOutline} />
                            </IonButton>
                        </IonItem>
                    ))}
                </IonList>

                <IonToast isOpen={showToast} onDidDismiss={() => setShowToast(false)} message={toastMessage} duration={2000} />

                <IonAlert
                    isOpen={showAddAlert}
                    onDidDismiss={() => setShowAddAlert(false)}
                    header={'Nuevo Autor'}
                    inputs={[{ name: 'name', type: 'text', placeholder: 'Nombre del autor' }]}
                    buttons={[
                        { text: 'Cancelar', role: 'cancel' },
                        { text: 'Crear', handler: (data) => handleAddAuthor(data.name) }
                    ]}
                />

                <IonAlert
                    isOpen={showEditAlert}
                    onDidDismiss={() => setShowEditAlert(false)}
                    header={'Editar Autor'}
                    inputs={[{ name: 'name', type: 'text', value: selectedAuthor?.name, placeholder: 'Nombre del autor' }]}
                    buttons={[
                        { text: 'Cancelar', role: 'cancel' },
                        { text: 'Guardar', handler: (data) => handleUpdateAuthor(data.name) }
                    ]}
                />
            </IonContent>
        </IonPage>
    );
};

export default ManageAuthors;
