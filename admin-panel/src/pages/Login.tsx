import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ReCaptcha from '../components/ReCaptcha';
import ReCAPTCHA from 'react-google-recaptcha';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import './Auth.css';

interface FieldErrors {
  email?: string[];
  password?: string[];
  captcha?: string[];
  code?: string[];
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [touched, setTouched] = useState<{ email: boolean; password: boolean }>({ email: false, password: false });
  const [needs2FA, setNeeds2FA] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [emailHint, setEmailHint] = useState('');
  const [resending, setResending] = useState(false);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const navigate = useNavigate();
  const { setSession } = useAuth();

  // Validación del email
  const validateEmail = (email: string): string | null => {
    if (!email.trim()) {
      return 'El email es requerido';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Ingresa un email válido';
    }
    return null;
  };

  // Validación de la contraseña
  const validatePassword = (password: string): string | null => {
    if (!password) {
      return 'La contraseña es requerida';
    }
    if (password.length < 6) {
      return 'La contraseña debe tener al menos 6 caracteres';
    }
    return null;
  };

  // Validar todo el formulario
  const validateForm = (): boolean => {
    const errors: FieldErrors = {};
    
    const emailError = validateEmail(email);
    if (emailError) {
      errors.email = [emailError];
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      errors.password = [passwordError];
    }

    if (!captchaToken) {
      errors.captcha = ['Debes completar el captcha'];
    }

    setFieldErrors(errors);
    
    // Marcar todos como touched para mostrar errores
    setTouched({ email: true, password: true });

    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validar formulario antes de enviar
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Primero enviar código 2FA
      const response = await api.post('/2fa/send', { email, password });
      
      if (response.data.requires_2fa) {
        setNeeds2FA(true);
        setEmailHint(response.data.email_hint || email);
      } else {
        // Si no requiere 2FA, el backend ya devuelve el token
        // Verificar si es admin antes de permitir acceso
        if (response.data.user.role_id !== 1) {
          setError('No tienes permisos de administrador');
          recaptchaRef.current?.reset();
          setCaptchaToken(null);
          return;
        }
        
        // Usar setSession del AuthContext
        setSession(response.data.token, response.data.user);
        navigate('/');
      }
    } catch (err: any) {
      // Verificar si hay errores de validación por campo
      if (err.response?.data?.errors) {
        setFieldErrors(err.response.data.errors);
      } else if (err.response?.data?.requires_verification) {
        setError('Debes verificar tu email antes de iniciar sesión');
      } else {
        setError(err.response?.data?.message || err.message || 'Error al iniciar sesión. Verifica tus credenciales.');
      }
      // Reset captcha on error
      recaptchaRef.current?.reset();
      setCaptchaToken(null);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!twoFactorCode || twoFactorCode.length !== 6) {
      setFieldErrors({ code: ['Ingresa el código de 6 dígitos'] });
      return;
    }

    setLoading(true);
    setFieldErrors({});

    try {
      const response = await api.post('/2fa/verify', { email, code: twoFactorCode });
      
      console.log('2FA verify response:', response.data);
      
      // Verificar si es admin
      if (response.data.user.role_id !== 1) {
        setError('No tienes permisos de administrador');
        setNeeds2FA(false);
        setTwoFactorCode('');
        return;
      }
      
      // Usar setSession del AuthContext para actualizar el estado
      setSession(response.data.token, response.data.user);
      console.log('Navigating to /');
      navigate('/');
    } catch (err: any) {
      console.error('2FA verify error:', err);
      const message = err.response?.data?.message || 'Código inválido o expirado';
      setFieldErrors({ code: [message] });
    } finally {
      setLoading(false);
    }
  };

  const handleResend2FA = async () => {
    setResending(true);
    try {
      await api.post('/2fa/send', { email, password });
      setError('');
      setTwoFactorCode('');
      // Mostrar mensaje de éxito temporalmente
      setError('Nuevo código enviado a tu correo');
      setTimeout(() => setError(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al reenviar código');
    } finally {
      setResending(false);
    }
  };

  // Manejar blur para mostrar errores en tiempo real
  const handleBlur = (field: 'email' | 'password') => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    if (field === 'email') {
      const error = validateEmail(email);
      setFieldErrors(prev => ({ ...prev, email: error ? [error] : undefined }));
    } else if (field === 'password') {
      const error = validatePassword(password);
      setFieldErrors(prev => ({ ...prev, password: error ? [error] : undefined }));
    }
  };

  // Limpiar error al escribir
  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (touched.email) {
      const error = validateEmail(value);
      setFieldErrors(prev => ({ ...prev, email: error ? [error] : undefined }));
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (touched.password) {
      const error = validatePassword(value);
      setFieldErrors(prev => ({ ...prev, password: error ? [error] : undefined }));
    }
  };

  // Pantalla de verificación 2FA
  if (needs2FA) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1 className="auth-logo">🔐 LibraDesk</h1>
            <p className="auth-subtitle">Verificación de Seguridad</p>
          </div>

          <form onSubmit={handleVerify2FA} className="auth-form">
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '60px', marginBottom: '15px' }}>🛡️</div>
              <h2 style={{ marginBottom: '10px' }}>Ingresa el código</h2>
              <p style={{ color: '#666', fontSize: '14px' }}>
                Enviamos un código de 6 dígitos a <strong>{emailHint}</strong>
              </p>
            </div>

            {error && (
              <div className={error.includes('enviado') ? 'auth-success' : 'auth-error'}>
                {error}
              </div>
            )}

            <div className="form-group">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                className={`form-input ${fieldErrors.code ? 'input-error' : ''}`}
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                style={{ 
                  textAlign: 'center', 
                  fontSize: '28px', 
                  letterSpacing: '10px',
                  fontFamily: 'monospace'
                }}
                autoFocus
              />
              {fieldErrors.code && (
                <span className="field-error" style={{ textAlign: 'center', display: 'block' }}>
                  {fieldErrors.code[0]}
                </span>
              )}
            </div>

            <p style={{ 
              textAlign: 'center', 
              fontSize: '13px', 
              color: '#856404', 
              background: '#fff3cd', 
              padding: '10px', 
              borderRadius: '6px',
              marginBottom: '15px'
            }}>
              ⏰ Este código expira en 10 minutos
            </p>

            <button 
              type="submit" 
              className="btn btn-primary auth-btn" 
              disabled={loading || twoFactorCode.length !== 6}
            >
              {loading ? 'Verificando...' : 'Verificar Código'}
            </button>

            <button 
              type="button" 
              className="btn btn-secondary auth-btn" 
              onClick={handleResend2FA}
              disabled={resending}
              style={{ marginTop: '10px' }}
            >
              {resending ? 'Enviando...' : 'Reenviar Código'}
            </button>

            <button 
              type="button" 
              className="btn auth-btn" 
              onClick={() => {
                setNeeds2FA(false);
                setTwoFactorCode('');
                setFieldErrors({});
                setError('');
              }}
              style={{ marginTop: '10px', background: 'transparent', color: '#666' }}
            >
              ← Volver al login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-logo">📖 LibraDesk</h1>
          <p className="auth-subtitle">Panel de Administración</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <h2>Iniciar Sesión</h2>

          {error && <div className="auth-error">{error}</div>}

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className={`form-input ${fieldErrors.email ? 'input-error' : ''}`}
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              onBlur={() => handleBlur('email')}
              placeholder="tu@email.com"
            />
            {fieldErrors.email && (
              <span className="field-error">{fieldErrors.email[0]}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <input
              type="password"
              className={`form-input ${fieldErrors.password ? 'input-error' : ''}`}
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              onBlur={() => handleBlur('password')}
              placeholder="••••••••"
            />
            {fieldErrors.password && (
              <span className="field-error">{fieldErrors.password[0]}</span>
            )}
          </div>

          <ReCaptcha 
            recaptchaRef={recaptchaRef}
            onVerify={(token) => {
              setCaptchaToken(token);
              if (token) {
                setFieldErrors(prev => ({ ...prev, captcha: undefined }));
              }
            }} 
            onExpire={() => setCaptchaToken(null)}
          />
          {fieldErrors.captcha && (
            <span className="field-error" style={{ textAlign: 'center', display: 'block', marginTop: '-10px', marginBottom: '10px' }}>
              {fieldErrors.captcha[0]}
            </span>
          )}

          <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>

        </form>
      </div>
    </div>
  );
}
