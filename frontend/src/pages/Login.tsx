import React, { useState } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonInput, IonButton, IonItem, IonLabel, IonToast } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { login } from '../services/authService';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const history = useHistory();

    const handleLogin = async () => {
        try {
            const data = await login({ email, password });
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            window.location.href = '/my-library';
        } catch (error) {
            setToastMessage('Login failed');
            setShowToast(true);
        }
    };

    const handleBiometricLogin = () => {
        // WebAuthn implementation would go here
        setToastMessage('Biometric login not implemented yet');
        setShowToast(true);
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Login</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                <IonItem>
                    <IonLabel position="floating">Email</IonLabel>
                    <IonInput value={email} onIonChange={e => setEmail(e.detail.value!)} />
                </IonItem>
                <IonItem>
                    <IonLabel position="floating">Password</IonLabel>
                    <IonInput type="password" value={password} onIonChange={e => setPassword(e.detail.value!)} />
                </IonItem>
                <IonButton expand="block" onClick={handleLogin} className="ion-margin-top">
                    Login
                </IonButton>
                <IonButton expand="block" color="secondary" onClick={handleBiometricLogin} className="ion-margin-top">
                    Login with Fingerprint
                </IonButton>
                <IonButton expand="block" fill="clear" routerLink="/register">
                    Create Account
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

export default Login;
