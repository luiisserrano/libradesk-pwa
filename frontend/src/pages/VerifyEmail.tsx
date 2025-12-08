import React, { useEffect, useState } from 'react';
import { IonContent, IonPage, IonButton, IonSpinner, IonIcon } from '@ionic/react';
import { checkmarkCircle, closeCircle, mailOutline } from 'ionicons/icons';
import { useHistory, useLocation } from 'react-router-dom';
import api from '../services/api';

import './VerifyEmail.css';

const VerifyEmail: React.FC = () => {
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');
    const history = useHistory();
    const location = useLocation();

    useEffect(() => {
        const verifyEmail = async () => {
            const params = new URLSearchParams(location.search);
            const token = params.get('token');

            if (!token) {
                setStatus('error');
                setMessage('Token de verificación no proporcionado');
                return;
            }

            try {
                const response = await api.post('/email/verify', { token });
                setStatus('success');
                setMessage(response.data.message);
            } catch (error: any) {
                setStatus('error');
                setMessage(error.response?.data?.message || 'Error al verificar el correo');
            }
        };

        verifyEmail();
    }, [location]);

    return (
        <IonPage>
            <IonContent className="verify-email-content">
                <div className="verify-container">
                    {status === 'loading' && (
                        <div className="verify-box">
                            <IonSpinner name="crescent" className="verify-spinner" />
                            <h2>Verificando tu correo...</h2>
                            <p>Por favor espera un momento</p>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="verify-box success">
                            <IonIcon icon={checkmarkCircle} className="verify-icon success" />
                            <h2>¡Correo Verificado!</h2>
                            <p>{message}</p>
                            <IonButton expand="block" onClick={() => history.push('/login')}>
                                Iniciar Sesión
                            </IonButton>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="verify-box error">
                            <IonIcon icon={closeCircle} className="verify-icon error" />
                            <h2>Error de Verificación</h2>
                            <p>{message}</p>
                            <IonButton expand="block" color="medium" onClick={() => history.push('/login')}>
                                Volver al Login
                            </IonButton>
                        </div>
                    )}
                </div>
            </IonContent>
        </IonPage>
    );
};

export default VerifyEmail;
