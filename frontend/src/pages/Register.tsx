import React, { useState } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonInput, IonButton, IonItem, IonLabel, IonSelect, IonSelectOption, IonToast, IonText } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { register } from '../services/authService';

import logo from '../img/logo.png';

interface FieldErrors {
    username?: string[];
    email?: string[];
    password?: string[];
    profile_picture?: string[];
}

const Register: React.FC = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
    const history = useHistory();

    const handleRegister = async () => {
        // Limpiar errores anteriores
        setFieldErrors({});

        try {
            const formData = new FormData();
            formData.append('username', username);
            formData.append('email', email);
            formData.append('password', password);
            if (file) {
                formData.append('profile_picture', file);
            }

            const data = await register(formData);
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            window.location.href = '/my-library';
        } catch (error: any) {
            let message = 'Error en el registro';

            if (error.response?.data) {
                const responseData = error.response.data;

                // Si hay errores de validación por campo
                if (responseData.errors) {
                    setFieldErrors(responseData.errors);
                    message = responseData.message || 'Por favor corrige los errores en el formulario';
                } else if (responseData.message) {
                    message = responseData.message;
                }
            } else if (error.message) {
                message = error.message;
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
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px', marginTop: '20px' }}>
                    <img src={logo} alt="LibraDesk Logo" style={{ width: '150px', height: 'auto' }} />
                </div>
                <IonItem className={fieldErrors.username ? 'ion-invalid' : ''}>
                    <IonLabel position="floating">Username</IonLabel>
                    <IonInput
                        value={username}
                        onIonChange={e => {
                            setUsername(e.detail.value!);
                            if (fieldErrors.username) {
                                setFieldErrors(prev => ({ ...prev, username: undefined }));
                            }
                        }}
                    />
                </IonItem>
                {fieldErrors.username && (
                    <IonText color="danger" style={{ fontSize: '0.85rem', padding: '4px 16px', display: 'block' }}>
                        {fieldErrors.username[0]}
                    </IonText>
                )}

                <IonItem className={fieldErrors.email ? 'ion-invalid' : ''}>
                    <IonLabel position="floating">Email</IonLabel>
                    <IonInput
                        value={email}
                        onIonChange={e => {
                            setEmail(e.detail.value!);
                            if (fieldErrors.email) {
                                setFieldErrors(prev => ({ ...prev, email: undefined }));
                            }
                        }}
                    />
                </IonItem>
                {fieldErrors.email && (
                    <IonText color="danger" style={{ fontSize: '0.85rem', padding: '4px 16px', display: 'block' }}>
                        {fieldErrors.email[0]}
                    </IonText>
                )}

                <IonItem className={fieldErrors.password ? 'ion-invalid' : ''}>
                    <IonLabel position="floating">Password</IonLabel>
                    <IonInput
                        type="password"
                        value={password}
                        onIonChange={e => {
                            setPassword(e.detail.value!);
                            if (fieldErrors.password) {
                                setFieldErrors(prev => ({ ...prev, password: undefined }));
                            }
                        }}
                    />
                </IonItem>
                {fieldErrors.password && (
                    <IonText color="danger" style={{ fontSize: '0.85rem', padding: '4px 16px', display: 'block' }}>
                        {fieldErrors.password[0]}
                    </IonText>
                )}

                <IonItem>
                    <IonLabel>Profile Picture</IonLabel>
                    <input type="file" accept="image/*" onChange={handleFileChange} />
                </IonItem>
                {fieldErrors.profile_picture && (
                    <IonText color="danger" style={{ fontSize: '0.85rem', padding: '4px 16px', display: 'block' }}>
                        {fieldErrors.profile_picture[0]}
                    </IonText>
                )}

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
