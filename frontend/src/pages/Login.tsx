import React, { useState, useEffect } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonInput, IonButton, IonItem, IonLabel, IonToast } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { login } from '../services/authService';
import InstallPrompt from '../components/InstallPrompt';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [showInstallPrompt, setShowInstallPrompt] = useState(false);
    const history = useHistory();

    useEffect(() => {
        const checkDevice = () => {
            // Detectar si es móvil (ancho de pantalla o user agent)
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;

            // Detectar si ya está en modo standalone (PWA instalada)
            const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;

            // Verificar si el usuario ya dijo que la instaló
            const userSaysInstalled = localStorage.getItem('pwa_installed') === 'true';

            // Si es móvil y NO está instalada y NO ha dicho que ya la tiene, mostrar prompt
            if (isMobile && !isStandalone && !userSaysInstalled) {
                setShowInstallPrompt(true);
            }
        };

        checkDevice();
    }, []);

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

    if (showInstallPrompt) {
        return <InstallPrompt />;
    }

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

                {/* Botón para reinstalar si se ocultó el prompt */}
                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                    <IonButton fill="clear" size="small" color="medium" onClick={() => {
                        localStorage.removeItem('pwa_installed');
                        setShowInstallPrompt(true);
                    }}>
                        ¿No has instalado la app? Haz clic aquí
                    </IonButton>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default Login;
