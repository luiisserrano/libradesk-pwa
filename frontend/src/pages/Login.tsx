import React, { useState, useEffect } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonInput, IonButton, IonItem, IonLabel, IonToast } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { login } from '../services/authService';
import { biometricService } from '../services/biometricService';
import InstallPrompt from '../components/InstallPrompt';

import logo from '../img/logo.png';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [showInstallPrompt, setShowInstallPrompt] = useState(false);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const history = useHistory();

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

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

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
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

    const handleBiometricLogin = async () => {
        const available = await biometricService.isAvailable();
        const enabled = localStorage.getItem('biometric_enabled') === 'true';

        if (!available || !enabled) {
            setToastMessage('La autenticación biométrica no está disponible o activada.');
            setShowToast(true);
            return;
        }

        const success = await biometricService.verify();
        if (success) {
            // Restore session data
            const biometricToken = localStorage.getItem('biometric_token');
            const biometricUser = localStorage.getItem('biometric_user');

            if (biometricToken && biometricUser) {
                localStorage.setItem('token', biometricToken);
                localStorage.setItem('user', biometricUser);

                // Alert user about offline/local mode
                alert('Has ingresado en modo local/offline. Podrás leer tus libros descargados, pero algunas funciones pueden estar limitadas.');
            } else {
                alert('No se encontraron datos de sesión guardados. Por favor inicia sesión con contraseña para actualizar tus datos biométricos.');
            }

            // "Log in" to offline mode (access to cached data)
            sessionStorage.setItem('offline_authenticated', 'true');

            window.location.href = '/my-library';
        } else {
            setToastMessage('No se pudo verificar la identidad.');
            setShowToast(true);
        }
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
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px', marginTop: '20px' }}>
                    <img src={logo} alt="LibraDesk Logo" style={{ width: '150px', height: 'auto' }} />
                </div>
                {isOnline ? (
                    <>
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
                        <IonButton expand="block" fill="clear" routerLink="/register">
                            Create Account
                        </IonButton>
                    </>
                ) : (
                    <div className="ion-text-center ion-padding">
                        <p style={{ color: 'var(--ion-color-warning)' }}>
                            <strong>Estás desconectado.</strong>
                        </p>
                        <p>Solo puedes iniciar sesión con Huella/FaceID para acceder a tus libros guardados.</p>
                    </div>
                )}

                <IonButton expand="block" color="secondary" onClick={handleBiometricLogin} className="ion-margin-top">
                    Login with Fingerprint
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
