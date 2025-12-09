import React, { useState, useEffect, useRef } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonInput, IonButton, IonItem, IonLabel, IonToast, IonText, IonNote, IonSpinner } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { login } from '../services/authService';
import { biometricService } from '../services/biometricService';
import api from '../services/api';
import InstallPrompt from '../components/InstallPrompt';
import ReCaptcha from '../components/ReCaptcha';
import ReCAPTCHA from 'react-google-recaptcha';

import logo from '../img/logo.png';

interface FieldErrors {
    email?: string[];
    password?: string[];
    code?: string[];
    captcha?: string[];
}

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [showInstallPrompt, setShowInstallPrompt] = useState(false);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
    const [isMobile, setIsMobile] = useState(false);
    const [needsVerification, setNeedsVerification] = useState(false);
    const [needs2FA, setNeeds2FA] = useState(false);
    const [twoFactorCode, setTwoFactorCode] = useState('');
    const [emailHint, setEmailHint] = useState('');
    const [resendingEmail, setResendingEmail] = useState(false);
    const [loading, setLoading] = useState(false);
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);
    const [touched, setTouched] = useState({ email: false, password: false, submitted: false });
    const recaptchaRef = useRef<ReCAPTCHA>(null);
    const history = useHistory();

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        const checkDevice = () => {
            // Detectar si es móvil (ancho de pantalla o user agent)
            const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            setIsMobile(mobile);

            // Detectar si ya está en modo standalone (PWA instalada)
            const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;

            // Si es móvil y NO está instalada, mostrar prompt
            if (mobile && !isStandalone) {
                setShowInstallPrompt(true);
            }
        };

        checkDevice();

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Validaciones
    const validateEmail = (email: string): string | null => {
        if (!email.trim()) return 'El email es requerido';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) return 'Ingresa un email válido';
        return null;
    };

    const validatePassword = (password: string): string | null => {
        if (!password) return 'La contraseña es requerida';
        if (password.length < 6) return 'La contraseña debe tener al menos 6 caracteres';
        return null;
    };

    const validateForm = (): boolean => {
        const errors: FieldErrors = {};
        
        const emailError = validateEmail(email);
        if (emailError) errors.email = [emailError];

        const passwordError = validatePassword(password);
        if (passwordError) errors.password = [passwordError];

        if (navigator.onLine && !captchaToken) {
            errors.captcha = ['Debes completar el captcha'];
        }

        setFieldErrors(errors);
        setTouched({ email: true, password: true, submitted: true });
        return Object.keys(errors).length === 0;
    };

    const handleBlur = (field: 'email' | 'password') => {
        // Solo validar en blur si ya se intentó enviar el formulario
        if (!touched.submitted) return;
        
        setTouched(prev => ({ ...prev, [field]: true }));
        if (field === 'email') {
            const error = validateEmail(email);
            setFieldErrors(prev => ({ ...prev, email: error ? [error] : undefined }));
        } else if (field === 'password') {
            const error = validatePassword(password);
            setFieldErrors(prev => ({ ...prev, password: error ? [error] : undefined }));
        }
    };

    const handleLogin = async () => {
        // Limpiar errores anteriores
        setFieldErrors({});
        setNeedsVerification(false);

        // Validar formulario
        if (!validateForm()) return;

        setLoading(true);

        try {
            // Primero intentar login para ver si necesita 2FA
            const response = await api.post('/2fa/send', { email, password });
            
            if (response.data.requires_2fa) {
                setNeeds2FA(true);
                setEmailHint(response.data.email_hint || email);
                setToastMessage('Código de verificación enviado a tu correo');
                setShowToast(true);
            } else {
                // Si no requiere 2FA, el backend ya devuelve el token
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                window.location.href = '/my-library';
            }
        } catch (error: any) {
            let message = 'Error al iniciar sesión';

            if (error.response?.data) {
                const responseData = error.response.data;

                // Verificar si necesita verificación de email
                if (responseData.requires_verification) {
                    setNeedsVerification(true);
                    return;
                }

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
            // Reset captcha on error
            recaptchaRef.current?.reset();
            setCaptchaToken(null);
        } finally {
            setLoading(false);
        }
    };

    const handleVerify2FA = async () => {
        if (!twoFactorCode || twoFactorCode.length !== 6) {
            setFieldErrors({ code: ['Ingresa el código de 6 dígitos'] });
            return;
        }

        setLoading(true);
        setFieldErrors({});

        try {
            const response = await api.post('/2fa/verify', { email, code: twoFactorCode });
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            window.location.href = '/my-library';
        } catch (error: any) {
            const message = error.response?.data?.message || 'Código inválido o expirado';
            setFieldErrors({ code: [message] });
        } finally {
            setLoading(false);
        }
    };

    const handleResend2FA = async () => {
        setResendingEmail(true);
        try {
            await api.post('/2fa/send', { email, password });
            setToastMessage('Nuevo código enviado a tu correo');
            setShowToast(true);
            setTwoFactorCode('');
        } catch (error: any) {
            setToastMessage(error.response?.data?.message || 'Error al reenviar código');
            setShowToast(true);
        } finally {
            setResendingEmail(false);
        }
    };

    const handleResendVerification = async () => {
        setResendingEmail(true);
        try {
            await api.post('/email/resend', { email });
            setToastMessage('Correo de verificación enviado. Revisa tu bandeja de entrada.');
            setShowToast(true);
        } catch (error: any) {
            setToastMessage(error.response?.data?.message || 'Error al reenviar el correo');
            setShowToast(true);
        } finally {
            setResendingEmail(false);
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

    // Pantalla de verificación 2FA
    if (needs2FA) {
        return (
            <IonPage>
                <IonHeader>
                    <IonToolbar>
                        <IonTitle>Verificación de Seguridad</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <IonContent className="ion-padding">
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '70vh',
                        textAlign: 'center',
                        padding: '20px'
                    }}>
                        <div style={{ fontSize: '80px', marginBottom: '20px' }}>🔐</div>
                        <h2 style={{ color: 'var(--ion-color-primary)', marginBottom: '10px' }}>
                            Ingresa el código
                        </h2>
                        <p style={{ marginBottom: '20px', maxWidth: '350px' }}>
                            Enviamos un código de 6 dígitos a <strong>{emailHint}</strong>
                        </p>
                        
                        <IonItem style={{ width: '100%', maxWidth: '200px', marginBottom: '10px' }}>
                            <IonInput
                                type="tel"
                                value={twoFactorCode}
                                onIonChange={e => setTwoFactorCode(e.detail.value?.replace(/\D/g, '').slice(0, 6) || '')}
                                placeholder="000000"
                                style={{ textAlign: 'center', fontSize: '24px', letterSpacing: '8px' }}
                                maxlength={6}
                            />
                        </IonItem>
                        {fieldErrors.code && (
                            <IonText color="danger" style={{ fontSize: '0.85rem', marginBottom: '15px' }}>
                                {fieldErrors.code[0]}
                            </IonText>
                        )}

                        <IonButton 
                            expand="block" 
                            onClick={handleVerify2FA}
                            disabled={loading || twoFactorCode.length !== 6}
                            style={{ marginBottom: '15px', maxWidth: '300px' }}
                        >
                            {loading ? <IonSpinner name="crescent" /> : 'Verificar'}
                        </IonButton>
                        
                        <IonButton 
                            expand="block" 
                            fill="outline"
                            onClick={handleResend2FA}
                            disabled={resendingEmail}
                            style={{ marginBottom: '15px', maxWidth: '300px' }}
                        >
                            {resendingEmail ? <IonSpinner name="crescent" /> : 'Reenviar código'}
                        </IonButton>
                        
                        <IonButton 
                            expand="block" 
                            fill="clear"
                            onClick={() => {
                                setNeeds2FA(false);
                                setTwoFactorCode('');
                                setFieldErrors({});
                            }}
                            style={{ maxWidth: '300px' }}
                        >
                            Volver al login
                        </IonButton>
                    </div>
                    <IonToast isOpen={showToast} onDidDismiss={() => setShowToast(false)} message={toastMessage} duration={3000} />
                </IonContent>
            </IonPage>
        );
    }

    // Mostrar mensaje de verificación pendiente
    if (needsVerification) {
        return (
            <IonPage>
                <IonHeader>
                    <IonToolbar>
                        <IonTitle>Verificación Pendiente</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <IonContent className="ion-padding">
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '70vh',
                        textAlign: 'center',
                        padding: '20px'
                    }}>
                        <div style={{ fontSize: '80px', marginBottom: '20px' }}>📧</div>
                        <h2 style={{ color: 'var(--ion-color-warning)', marginBottom: '10px' }}>
                            Verifica tu correo
                        </h2>
                        <p style={{ marginBottom: '20px', maxWidth: '350px' }}>
                            Debes verificar tu correo electrónico <strong>{email}</strong> antes de poder iniciar sesión.
                        </p>
                        <p style={{ color: 'var(--ion-color-medium)', fontSize: '0.9rem', marginBottom: '30px' }}>
                            Revisa tu bandeja de entrada y haz clic en el enlace de verificación.
                        </p>
                        <IonButton 
                            expand="block" 
                            onClick={handleResendVerification}
                            disabled={resendingEmail}
                            style={{ marginBottom: '15px', maxWidth: '300px' }}
                        >
                            {resendingEmail ? <IonSpinner name="crescent" /> : 'Reenviar correo de verificación'}
                        </IonButton>
                        <IonButton 
                            expand="block" 
                            fill="clear"
                            onClick={() => setNeedsVerification(false)}
                            style={{ maxWidth: '300px' }}
                        >
                            Volver al login
                        </IonButton>
                    </div>
                    <IonToast
                        isOpen={showToast}
                        onDidDismiss={() => setShowToast(false)}
                        message={toastMessage}
                        duration={3000}
                    />
                </IonContent>
            </IonPage>
        );
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
                        <IonItem className={touched.submitted && fieldErrors.email ? 'ion-invalid' : ''}>
                            <IonLabel position="floating">Email</IonLabel>
                            <IonInput
                                type="email"
                                value={email}
                                onIonChange={e => {
                                    setEmail(e.detail.value!);
                                    if (touched.submitted) {
                                        const error = validateEmail(e.detail.value!);
                                        setFieldErrors(prev => ({ ...prev, email: error ? [error] : undefined }));
                                    }
                                }}
                                onIonBlur={() => handleBlur('email')}
                            />
                        </IonItem>
                        {touched.submitted && fieldErrors.email && (
                            <IonText color="danger" style={{ fontSize: '0.85rem', padding: '4px 16px', display: 'block' }}>
                                {fieldErrors.email[0]}
                            </IonText>
                        )}

                        <IonItem className={touched.submitted && fieldErrors.password ? 'ion-invalid' : ''}>
                            <IonLabel position="floating">Contraseña</IonLabel>
                            <IonInput
                                type="password"
                                value={password}
                                onIonChange={e => {
                                    setPassword(e.detail.value!);
                                    if (touched.submitted) {
                                        const error = validatePassword(e.detail.value!);
                                        setFieldErrors(prev => ({ ...prev, password: error ? [error] : undefined }));
                                    }
                                }}
                                onIonBlur={() => handleBlur('password')}
                            />
                        </IonItem>
                        {touched.submitted && fieldErrors.password && (
                            <IonText color="danger" style={{ fontSize: '0.85rem', padding: '4px 16px', display: 'block' }}>
                                {fieldErrors.password[0]}
                            </IonText>
                        )}

                        <ReCaptcha 
                            recaptchaRef={recaptchaRef}
                            onVerify={(token) => {
                                setCaptchaToken(token);
                                if (token) setFieldErrors(prev => ({ ...prev, captcha: undefined }));
                            }} 
                            onExpire={() => setCaptchaToken(null)}
                        />
                        {fieldErrors.captcha && (
                            <IonText color="danger" style={{ fontSize: '0.85rem', padding: '4px 16px', display: 'block', textAlign: 'center' }}>
                                {fieldErrors.captcha[0]}
                            </IonText>
                        )}

                        <IonButton expand="block" onClick={handleLogin} className="ion-margin-top" disabled={loading}>
                            {loading ? <IonSpinner name="crescent" /> : 'Iniciar Sesión'}
                        </IonButton>
                        <IonButton expand="block" fill="clear" routerLink="/register">
                            Crear Cuenta
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

                {isMobile && (
                    <IonButton expand="block" color="secondary" onClick={handleBiometricLogin} className="ion-margin-top">
                        Login con Huella/FaceID
                    </IonButton>
                )}
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
