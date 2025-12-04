import React, { useState, useEffect } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonSelect, IonSelectOption, IonButton, IonIcon, IonButtons, IonBackButton, IonToast, IonAlert, IonMenuButton } from '@ionic/react';
import { trashOutline } from 'ionicons/icons';
import { adminService } from '../../services/adminService';

const ManageUsers: React.FC = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [userToDelete, setUserToDelete] = useState<number | null>(null);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const data = await adminService.getUsers();
            setUsers(data);
        } catch (error) {
            console.error(error);
            setToastMessage('Error al cargar usuarios');
            setShowToast(true);
        }
    };

    const handleRoleChange = async (userId: number, newRoleId: number) => {
        try {
            await adminService.updateUserRole(userId, newRoleId);
            setToastMessage('Rol actualizado correctamente');
            setShowToast(true);
            loadUsers();
        } catch (error) {
            setToastMessage('Error al actualizar rol');
            setShowToast(true);
        }
    };

    const handleDeleteUser = async () => {
        if (userToDelete) {
            try {
                await adminService.deleteUser(userToDelete);
                setToastMessage('Usuario eliminado');
                setShowToast(true);
                loadUsers();
            } catch (error) {
                setToastMessage('Error al eliminar usuario');
                setShowToast(true);
            }
            setUserToDelete(null);
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
                    <IonTitle>Gestionar Usuarios</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                <IonList>
                    {users.map(user => (
                        <IonItem key={user.id}>
                            <IonLabel>
                                <h2>{user.username}</h2>
                                <p>{user.email}</p>
                            </IonLabel>
                            <IonSelect
                                value={user.role_id}
                                interface="popover"
                                onIonChange={e => handleRoleChange(user.id, parseInt(e.detail.value))}
                            >
                                <IonSelectOption value={1}>Admin</IonSelectOption>
                                <IonSelectOption value={2}>Usuario</IonSelectOption>
                            </IonSelect>
                            <IonButton fill="clear" color="danger" onClick={() => setUserToDelete(user.id)}>
                                <IonIcon icon={trashOutline} />
                            </IonButton>
                        </IonItem>
                    ))}
                </IonList>

                <IonToast
                    isOpen={showToast}
                    onDidDismiss={() => setShowToast(false)}
                    message={toastMessage}
                    duration={2000}
                />

                <IonAlert
                    isOpen={!!userToDelete}
                    onDidDismiss={() => setUserToDelete(null)}
                    header={'Confirmar eliminación'}
                    message={'¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.'}
                    buttons={[
                        {
                            text: 'Cancelar',
                            role: 'cancel',
                            handler: () => setUserToDelete(null)
                        },
                        {
                            text: 'Eliminar',
                            handler: handleDeleteUser
                        }
                    ]}
                />
            </IonContent>
        </IonPage>
    );
};

export default ManageUsers;
