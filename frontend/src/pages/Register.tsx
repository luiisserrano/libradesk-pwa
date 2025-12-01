import React, { useState } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonInput, IonButton, IonItem, IonLabel, IonSelect, IonSelectOption, IonToast } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { register } from '../services/authService';

const Register: React.FC = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [roleId, setRoleId] = useState('2'); // Default to User (ID 2)
    const [file, setFile] = useState<File | null>(null);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const history = useHistory();

    const handleRegister = async () => {
        try {
            const formData = new FormData();
            formData.append('username', username);
            formData.append('email', email);
            formData.append('password', password);
            formData.append('role_id', roleId);
            if (file) {
                formData.append('profile_picture', file);
            }

            const data = await register(formData);
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            window.location.href = '/my-library';
        } catch (error: any) {
            let message = 'Registration failed';
            if (error.response && error.response.data && error.response.data.message) {
                message = error.response.data.message;
                if (error.response.data.errors) {
                    const errors = Object.values(error.response.data.errors).flat();
                    if (errors.length > 0) {
                        message = errors[0] as string;
                    }
                }
            }
            setToastMessage(message);
            setShowToast(true);
        }
    };

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
            setFile(resized);
        }
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Register</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                <IonItem>
                    <IonLabel position="floating">Username</IonLabel>
                    <IonInput value={username} onIonChange={e => setUsername(e.detail.value!)} />
                </IonItem>
                <IonItem>
                    <IonLabel position="floating">Email</IonLabel>
                    <IonInput value={email} onIonChange={e => setEmail(e.detail.value!)} />
                </IonItem>
                <IonItem>
                    <IonLabel position="floating">Password</IonLabel>
                    <IonInput type="password" value={password} onIonChange={e => setPassword(e.detail.value!)} />
                </IonItem>
                <IonItem>
                    <IonLabel>Role</IonLabel>
                    <IonSelect value={roleId} onIonChange={e => setRoleId(e.detail.value)}>
                        <IonSelectOption value="2">User</IonSelectOption>
                        <IonSelectOption value="1">Admin</IonSelectOption>
                    </IonSelect>
                </IonItem>
                <IonItem>
                    <IonLabel>Profile Picture</IonLabel>
                    <input type="file" accept="image/*" onChange={handleFileChange} />
                </IonItem>
                <IonButton expand="block" onClick={handleRegister} className="ion-margin-top">
                    Register
                </IonButton>
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

export default Register;
