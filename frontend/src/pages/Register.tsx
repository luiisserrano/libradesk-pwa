import React, { useState, useRef } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonInput, IonButton, IonItem, IonLabel, IonSelect, IonSelectOption, IonToast, IonText, IonSpinner, IonIcon } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { register } from '../services/authService';
import ReCaptcha from '../components/ReCaptcha';
import ReCAPTCHA from 'react-google-recaptcha';
import { checkmarkCircle, closeCircle } from 'ionicons/icons';

import logo from '../img/logo.png';

interface FieldErrors {
    username?: string[];
    email?: string[];
    password?: string[];
    confirmPassword?: string[];
    profile_picture?: string[];
    captcha?: string[];
}

interface PasswordRequirement {
    met: boolean;
    text: string;
}

const Register: React.FC = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
    const [registrationSuccess, setRegistrationSuccess] = useState(false);
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [loading, setLoading] = useState(false);
    const [touched, setTouched] = useState({ username: false, email: false, password: false, confirmPassword: false });
    const recaptchaRef = useRef<ReCAPTCHA>(null);
    const history = useHistory();

    // Escuchar cambios de conexión
    React.useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Validaciones
    const validateUsername = (value: string): string | null => {
        if (!value.trim()) return 'El nombre de usuario es requerido';
        if (value.length < 3) return 'Mínimo 3 caracteres';
        if (value.length > 50) return 'Máximo 50 caracteres';
        return null;
    };

    const validateEmail = (value: string): string | null => {
        if (!value.trim()) return 'El email es requerido';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return 'Ingresa un email válido';
        return null;
    };

    // Requisitos de contraseña segura
    const getPasswordRequirements = (pwd: string): PasswordRequirement[] => {
        return [
            { met: pwd.length >= 8, text: 'Mínimo 8 caracteres' },
            { met: /[A-Z]/.test(pwd), text: 'Una letra mayúscula' },
            { met: /[a-z]/.test(pwd), text: 'Una letra minúscula' },
            { met: /[0-9]/.test(pwd), text: 'Un número' },
            { met: /[!@#$%^&*(),.?":{}|<>]/.test(pwd), text: 'Un carácter especial (!@#$%^&*...)' },
        ];
    };

    const validatePassword = (pwd: string): string | null => {
        if (!pwd) return 'La contraseña es requerida';
        const requirements = getPasswordRequirements(pwd);
        const unmet = requirements.filter(r => !r.met);
        if (unmet.length > 0) return 'La contraseña no cumple los requisitos';
        return null;
    };

    const validateConfirmPassword = (confirm: string): string | null => {
        if (!confirm) return 'Confirma tu contraseña';
        if (confirm !== password) return 'Las contraseñas no coinciden';
        return null;
    };

    const validateForm = (): boolean => {
        const errors: FieldErrors = {};
        
        const usernameError = validateUsername(username);
        if (usernameError) errors.username = [usernameError];

        const emailError = validateEmail(email);
        if (emailError) errors.email = [emailError];

        const passwordError = validatePassword(password);
        if (passwordError) errors.password = [passwordError];

        const confirmError = validateConfirmPassword(confirmPassword);
        if (confirmError) errors.confirmPassword = [confirmError];

        if (navigator.onLine && !captchaToken) {
            errors.captcha = ['Debes completar el captcha'];
        }

        setFieldErrors(errors);
        setTouched({ username: true, email: true, password: true, confirmPassword: true });
        return Object.keys(errors).length === 0;
    };

    const handleBlur = (field: 'username' | 'email' | 'password' | 'confirmPassword') => {
        setTouched(prev => ({ ...prev, [field]: true }));
        let error: string | null = null;
        
        switch (field) {
            case 'username': error = validateUsername(username); break;
            case 'email': error = validateEmail(email); break;
            case 'password': error = validatePassword(password); break;
            case 'confirmPassword': error = validateConfirmPassword(confirmPassword); break;
        }
        
        setFieldErrors(prev => ({ ...prev, [field]: error ? [error] : undefined }));
    };

    const handleRegister = async () => {
        // Limpiar errores anteriores
        setFieldErrors({});

        // Validar formulario
        if (!validateForm()) return;

        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('username', username);
            formData.append('email', email);
            formData.append('password', password);
            if (file) {
                formData.append('profile_picture', file);
            }

            const data = await register(formData);
            
            // Mostrar pantalla de verificación de correo
            if (data.requires_verification) {
                setRegistrationSuccess(true);
            } else {
                // Fallback por si el backend no requiere verificación
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                window.location.href = '/my-library';
            }
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
            // Reset captcha on error
            recaptchaRef.current?.reset();
            setCaptchaToken(null);
        } finally {
            setLoading(false);
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

    // Pantalla de verificación exitosa
    if (registrationSuccess) {
        return (
            <IonPage>
                <IonContent className="ion-padding">
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '80vh',
                        textAlign: 'center',
                        padding: '20px'
                    }}>
                        <div style={{
                            fontSize: '80px',
                            marginBottom: '20px'
                        }}>
                            📧
                        </div>
                        <h1 style={{ color: 'var(--ion-color-primary)', marginBottom: '10px' }}>
                            ¡Revisa tu correo!
                        </h1>
                        <p style={{ color: 'var(--ion-text-color)', marginBottom: '30px', maxWidth: '400px' }}>
                            Hemos enviado un enlace de verificación a <strong>{email}</strong>. 
                            Por favor revisa tu bandeja de entrada y haz clic en el enlace para activar tu cuenta.
                        </p>
                        <p style={{ color: 'var(--ion-color-medium)', fontSize: '0.9rem', marginBottom: '30px' }}>
                            ¿No recibiste el correo? Revisa tu carpeta de spam.
                        </p>
                        <IonButton expand="block" routerLink="/login">
                            Ir al Login
                        </IonButton>
                    </div>
                </IonContent>
            </IonPage>
        );
    }

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Registro</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px', marginTop: '20px' }}>
                    <img src={logo} alt="LibraDesk Logo" style={{ width: '150px', height: 'auto' }} />
                </div>
                <IonItem className={fieldErrors.username ? 'ion-invalid' : ''}>
                    <IonLabel position="floating">Nombre de usuario</IonLabel>
                    <IonInput
                        value={username}
                        onIonChange={e => {
                            setUsername(e.detail.value!);
                            if (touched.username) {
                                const error = validateUsername(e.detail.value!);
                                setFieldErrors(prev => ({ ...prev, username: error ? [error] : undefined }));
                            }
                        }}
                        onIonBlur={() => handleBlur('username')}
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
                        type="email"
                        value={email}
                        onIonChange={e => {
                            setEmail(e.detail.value!);
                            if (touched.email) {
                                const error = validateEmail(e.detail.value!);
                                setFieldErrors(prev => ({ ...prev, email: error ? [error] : undefined }));
                            }
                        }}
                        onIonBlur={() => handleBlur('email')}
                    />
                </IonItem>
                {fieldErrors.email && (
                    <IonText color="danger" style={{ fontSize: '0.85rem', padding: '4px 16px', display: 'block' }}>
                        {fieldErrors.email[0]}
                    </IonText>
                )}

                <IonItem className={fieldErrors.password ? 'ion-invalid' : ''}>
                    <IonLabel position="floating">Contraseña</IonLabel>
                    <IonInput
                        type="password"
                        value={password}
                        onIonChange={e => {
                            setPassword(e.detail.value!);
                            if (touched.password) {
                                const error = validatePassword(e.detail.value!);
                                setFieldErrors(prev => ({ ...prev, password: error ? [error] : undefined }));
                            }
                            // También validar confirmación si ya tiene valor
                            if (confirmPassword && touched.confirmPassword) {
                                const confirmError = e.detail.value !== confirmPassword ? 'Las contraseñas no coinciden' : null;
                                setFieldErrors(prev => ({ ...prev, confirmPassword: confirmError ? [confirmError] : undefined }));
                            }
                        }}
                        onIonBlur={() => handleBlur('password')}
                    />
                </IonItem>
                
                {/* Indicador de requisitos de contraseña */}
                {password && (
                    <div style={{ padding: '8px 16px', marginBottom: '8px' }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--ion-color-medium)', marginBottom: '4px' }}>
                            Requisitos de contraseña:
                        </div>
                        {getPasswordRequirements(password).map((req, index) => (
                            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}>
                                <IonIcon 
                                    icon={req.met ? checkmarkCircle : closeCircle} 
                                    color={req.met ? 'success' : 'medium'} 
                                    style={{ fontSize: '14px' }}
                                />
                                <span style={{ color: req.met ? 'var(--ion-color-success)' : 'var(--ion-color-medium)' }}>
                                    {req.text}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                <IonItem className={fieldErrors.confirmPassword ? 'ion-invalid' : ''}>
                    <IonLabel position="floating">Confirmar Contraseña</IonLabel>
                    <IonInput
                        type="password"
                        value={confirmPassword}
                        onIonChange={e => {
                            setConfirmPassword(e.detail.value!);
                            if (touched.confirmPassword) {
                                const error = e.detail.value !== password ? 'Las contraseñas no coinciden' : null;
                                setFieldErrors(prev => ({ ...prev, confirmPassword: error ? [error] : undefined }));
                            }
                        }}
                        onIonBlur={() => handleBlur('confirmPassword')}
                    />
                </IonItem>
                {fieldErrors.confirmPassword && (
                    <IonText color="danger" style={{ fontSize: '0.85rem', padding: '4px 16px', display: 'block' }}>
                        {fieldErrors.confirmPassword[0]}
                    </IonText>
                )}

                <IonItem>
                    <IonLabel>Foto de perfil (opcional)</IonLabel>
                    <input type="file" accept="image/*" onChange={handleFileChange} />
                </IonItem>
                {fieldErrors.profile_picture && (
                    <IonText color="danger" style={{ fontSize: '0.85rem', padding: '4px 16px', display: 'block' }}>
                        {fieldErrors.profile_picture[0]}
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

                <IonButton expand="block" onClick={handleRegister} className="ion-margin-top" disabled={loading}>
                    {loading ? <IonSpinner name="crescent" /> : 'Registrarse'}
                </IonButton>
                <IonButton expand="block" fill="clear" routerLink="/login">
                    Ya tengo cuenta
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
