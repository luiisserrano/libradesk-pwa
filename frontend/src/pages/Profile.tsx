import React, { useState } from 'react';
import {
    IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonCard,
    IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonButtons,
    IonMenuButton, IonInput, IonItem, IonLabel, IonToast
} from '@ionic/react';
import UserAvatar from '../components/UserAvatar';
import { updateProfile } from '../services/userService';
import { biometricService } from '../services/biometricService';

const Profile: React.FC = () => {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('user');
        return saved ? JSON.parse(saved) : null;
    });

    const [isEditing, setIsEditing] = useState(false);
    const [username, setUsername] = useState(user?.username || '');
    const [email, setEmail] = useState(user?.email || '');
    const [password, setPassword] = useState('');
    const [profilePicture, setProfilePicture] = useState<File | null>(null);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    const resizeImage = (file: File): Promise<File> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 800;
                    const MAX_HEIGHT = 800;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);

                    canvas.toBlob((blob) => {
                        if (blob) {
                            const resizedFile = new File([blob], file.name, {
                                type: file.type,
                                lastModified: Date.now(),
                            });
                            resolve(resizedFile);
                        }
                    }, file.type);
                };
            };
        });
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const resized = await resizeImage(e.target.files[0]);
            setProfilePicture(resized);
        }
    };

    const [avatarKey, setAvatarKey] = useState(Date.now());

    const handleSave = async () => {
        try {
            const formData = new FormData();

            if (username !== user?.username) {
                formData.append('username', username);
            }
            if (email !== user?.email) {
                formData.append('email', email);
            }
            if (password) {
                formData.append('password', password);
            }
            if (profilePicture) {
                formData.append('profile_picture', profilePicture);
            }

            const data = await updateProfile(formData);

            // Update localStorage with new user data
            localStorage.setItem('user', JSON.stringify(data.user));
            setUser(data.user);
            setAvatarKey(Date.now()); // Force avatar refresh

            setToastMessage('Perfil actualizado exitosamente');
            setShowToast(true);
            setIsEditing(false);
            setPassword('');
            setProfilePicture(null);
        } catch (error: any) {
            let message = 'Error al actualizar el perfil';
            if (error.response && error.response.data && error.response.data.message) {
                message = error.response.data.message;
            }
            setToastMessage(message);
            setShowToast(true);
        }
    };

    const handleCancel = () => {
        setUsername(user?.username || '');
        setEmail(user?.email || '');
        setPassword('');
        setProfilePicture(null);
        setIsEditing(false);
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonMenuButton />
                    </IonButtons>
                    <IonTitle>Mi Perfil</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                <IonCard>
                    <IonCardHeader>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <UserAvatar key={avatarKey} userId={user?.id} name={user?.username} size="large" />
                            <div>
                                <IonCardTitle>{user?.username}</IonCardTitle>
                                <p>{user?.email}</p>
                            </div>
                        </div>
                    </IonCardHeader>
                    <IonCardContent>
                        {!isEditing ? (
                            <>
                                <p><strong>Rol:</strong> {user?.role_id === 1 ? 'Administrador' : 'Usuario'}</p>
                                <IonButton expand="block" className="ion-margin-top" onClick={() => setIsEditing(true)}>
                                    Editar Perfil
                                </IonButton>

                                <div className="ion-margin-top ion-padding-top" style={{ borderTop: '1px solid var(--ion-color-light-shade)' }}>
                                    <IonLabel color="medium"><h3>Seguridad y Acceso Offline</h3></IonLabel>
                                    <IonButton
                                        expand="block"
                                        fill="outline"
                                        className="ion-margin-top"
                                        onClick={async () => {
                                            const result = await biometricService.register();
                                            if (result.success) {
                                                // Save current session data for biometric login
                                                const token = localStorage.getItem('token');
                                                const user = localStorage.getItem('user');
                                                if (token && user) {
                                                    localStorage.setItem('biometric_token', token);
                                                    localStorage.setItem('biometric_user', user);
                                                }

                                                setToastMessage('Acceso biométrico activado y datos guardados correctamente');
                                                setShowToast(true);
                                            } else {
                                                setToastMessage(result.error || 'Error al activar acceso biométrico');
                                                setShowToast(true);
                                            }
                                        }}
                                    >
                                        Activar Acceso con Huella/FaceID
                                    </IonButton>
                                </div>
                            </>
                        ) : (
                            <>
                                <IonItem>
                                    <IonLabel position="floating">Nombre de usuario</IonLabel>
                                    <IonInput
                                        value={username}
                                        onIonChange={e => setUsername(e.detail.value!)}
                                    />
                                </IonItem>
                                <IonItem>
                                    <IonLabel position="floating">Email</IonLabel>
                                    <IonInput
                                        type="email"
                                        value={email}
                                        onIonChange={e => setEmail(e.detail.value!)}
                                    />
                                </IonItem>
                                <IonItem>
                                    <IonLabel position="floating">Nueva Contraseña (opcional)</IonLabel>
                                    <IonInput
                                        type="password"
                                        value={password}
                                        onIonChange={e => setPassword(e.detail.value!)}
                                        placeholder="Dejar en blanco para no cambiar"
                                    />
                                </IonItem>
                                <IonItem>
                                    <IonLabel>Foto de Perfil</IonLabel>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        style={{ marginTop: '10px' }}
                                    />
                                </IonItem>

                                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                                    <IonButton expand="block" onClick={handleSave}>
                                        Guardar
                                    </IonButton>
                                    <IonButton expand="block" color="medium" onClick={handleCancel}>
                                        Cancelar
                                    </IonButton>
                                </div>
                            </>
                        )}
                    </IonCardContent>
                </IonCard>

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

export default Profile;
