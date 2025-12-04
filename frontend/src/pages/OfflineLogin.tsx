import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { biometricService } from '../services/biometricService';
import { IonContent, IonPage, IonButton, IonIcon, IonText, IonSpinner } from '@ionic/react';
import { fingerPrintOutline, lockClosedOutline } from 'ionicons/icons';

const OfflineLogin: React.FC = () => {
    const history = useHistory();
    const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const enabled = localStorage.getItem('biometric_enabled') === 'true';
        setIsBiometricEnabled(enabled);
    }, []);

    const handleUnlock = async () => {
        setLoading(true);
        setError('');

        try {
            const result = await biometricService.verify();

            if (result.success) {
                // Restore session data
                const biometricToken = localStorage.getItem('biometric_token');
                const biometricUser = localStorage.getItem('biometric_user');

                if (biometricToken && biometricUser) {
                    localStorage.setItem('token', biometricToken);
                    localStorage.setItem('user', biometricUser);
                    history.push('/my-library');
                } else {
                    setError('Identidad verificada, pero no hay sesión guardada. Por favor inicia sesión online una vez para activar.');
                }
            } else {
                setError(result.error || 'No se pudo verificar la identidad.');
            }
        } catch (e: any) {
            setError(e.message);
        }
        setLoading(false);
    };

    return (
        <IonPage>
            <IonContent className="ion-padding ion-text-center" fullscreen>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    gap: '20px'
                }}>
                    <div style={{
                        background: 'var(--ion-color-light)',
                        padding: '30px',
                        borderRadius: '50%',
                        marginBottom: '20px'
                    }}>
                        <IonIcon icon={lockClosedOutline} style={{ fontSize: '64px', color: 'var(--ion-color-medium)' }} />
                    </div>

                    <IonText>
                        <h1>Modo Sin Conexión</h1>
                        <p>Desbloquea para acceder a tu biblioteca descargada</p>
                    </IonText>

                    {isBiometricEnabled ? (
                        <IonButton
                            expand="block"
                            onClick={handleUnlock}
                            disabled={loading}
                            className="ion-margin-top"
                            style={{ width: '100%', maxWidth: '300px' }}
                        >
                            {loading ? <IonSpinner name="crescent" /> : (
                                <>
                                    <IonIcon slot="start" icon={fingerPrintOutline} />
                                    Desbloquear con Huella/FaceID
                                </>
                            )}
                        </IonButton>
                    ) : (
                        <div className="ion-padding">
                            <p style={{ color: 'var(--ion-color-danger)' }}>
                                La autenticación biométrica no está activada.
                                <br />
                                Necesitas internet para iniciar sesión con contraseña.
                            </p>
                            <IonButton routerLink="/login" fill="outline">
                                Ir al Login
                            </IonButton>
                        </div>
                    )}

                    {error && (
                        <p style={{ color: 'var(--ion-color-danger)' }}>{error}</p>
                    )}
                </div>
            </IonContent>
        </IonPage>
    );
};

export default OfflineLogin;
