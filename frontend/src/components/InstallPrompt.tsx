import React, { useEffect, useState } from 'react';
import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonIcon, IonText } from '@ionic/react';
import { downloadOutline, shareOutline, addCircleOutline } from 'ionicons/icons';

import icon from '../img/icono.png';

const InstallPrompt: React.FC = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<any>((window as any).deferredPrompt);
    const [isIOS, setIsIOS] = useState(false);
    const [isSecure, setIsSecure] = useState(true);
    const [debugInfo, setDebugInfo] = useState<string>('');

    useEffect(() => {
        // Verificar si es contexto seguro (HTTPS o localhost)
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const isHttps = window.location.protocol === 'https:';
        setIsSecure(isLocalhost || isHttps);

        // Detectar si es iOS
        const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        setIsIOS(ios);

        // Actualizar debug info
        const updateDebugInfo = () => {
            const swStatus = navigator.serviceWorker?.controller ? 'Active' : 'None';
            const secureContext = window.isSecureContext ? 'Yes' : 'No';
            setDebugInfo(`SecureCtx: ${secureContext}, SW: ${swStatus}, iOS: ${ios}, Prompt: ${!!(window as any).deferredPrompt}`);
        };

        updateDebugInfo();

        // Manual SW registration removed to avoid conflicts with vite-plugin-pwa

        // Escuchar evento para Android/Chrome
        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e);
            (window as any).deferredPrompt = e;
            setDebugInfo(prev => prev + ' | Event Fired!');
        };

        window.addEventListener('beforeinstallprompt', handler);

        // Chequear si ya estaba capturado
        if ((window as any).deferredPrompt) {
            setDeferredPrompt((window as any).deferredPrompt);
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) {
            alert('No se puede instalar: El navegador no ha disparado el evento de instalación. Asegúrate de haber habilitado el flag de Chrome.');
            return;
        }

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            setDeferredPrompt(null);
            (window as any).deferredPrompt = null;
        }
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            padding: '20px',
            backgroundColor: '#f4f5f8'
        }}>
            <IonCard style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
                <IonCardHeader>
                    <IonCardTitle>Instala LibraDesk</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                    <div style={{ marginBottom: '20px' }}>
                        <img
                            src={icon}
                            alt="App Icon"
                            style={{ width: '80px', height: '80px', borderRadius: '16px' }}
                        />
                    </div>

                    <IonText color="dark">
                        <p style={{ fontSize: '1.1rem', marginBottom: '20px' }}>
                            Para la mejor experiencia, instala nuestra aplicación en tu dispositivo.
                        </p>
                    </IonText>

                    {!isSecure && (
                        <div style={{ backgroundColor: '#fff3cd', color: '#856404', padding: '15px', borderRadius: '8px', marginBottom: '15px', fontSize: '0.9rem', textAlign: 'left' }}>
                            <p><strong>⚠️ Modo de Pruebas (HTTP)</strong></p>
                            <p>Para instalar sin HTTPS, debes habilitar una opción en Chrome:</p>
                            <ol style={{ paddingLeft: '20px', margin: '10px 0' }}>
                                <li>Abre <code>chrome://flags</code> en una nueva pestaña.</li>
                                <li>Busca "Insecure origins treated as secure".</li>
                                <li>Habilítalo y agrega: <code>http://{window.location.hostname}:5173</code></li>
                                <li>Reinicia Chrome.</li>
                            </ol>
                        </div>
                    )}

                    {isIOS ? (
                        <div style={{ textAlign: 'left', backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '8px' }}>
                            <p><strong>Para instalar en iOS:</strong></p>
                            <p>1. Toca el botón <strong>Compartir</strong> <IonIcon icon={shareOutline} style={{ verticalAlign: 'middle' }} /></p>
                            <p>2. Selecciona <strong>Agregar a Inicio</strong> <IonIcon icon={addCircleOutline} style={{ verticalAlign: 'middle' }} /></p>
                        </div>
                    ) : (
                        <>
                            <IonButton expand="block" onClick={handleInstallClick} disabled={!deferredPrompt}>
                                <IonIcon slot="start" icon={downloadOutline} />
                                {deferredPrompt ? 'Instalar Aplicación' : 'Instalación no disponible'}
                            </IonButton>
                            <p style={{ fontSize: '0.8rem', color: '#999', marginTop: '10px' }}>
                                Debug: {debugInfo}
                            </p>
                        </>
                    )}

                    {!isIOS && !deferredPrompt && (
                        <div style={{ marginTop: '20px' }}>
                            <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '10px' }}>
                                Si el botón está deshabilitado, usa el menú de tu navegador (3 puntos) y busca "Instalar aplicación" o "Agregar a la pantalla principal".
                            </p>
                        </div>
                    )}

                    <div style={{ marginTop: '30px', borderTop: '1px solid #ddd', paddingTop: '20px', width: '100%' }}>
                        <IonButton fill="clear" expand="block" color="medium" onClick={() => {
                            localStorage.setItem('pwa_installed', 'true');
                            window.location.reload();
                        }}>
                            Ya la instalé / Continuar en Navegador
                        </IonButton>
                    </div>
                </IonCardContent>
            </IonCard>
        </div>
    );
};

export default InstallPrompt;
