import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ReCaptcha from '../components/ReCaptcha';
import ReCAPTCHA from 'react-google-recaptcha';
import './Auth.css';

interface FieldErrors {
  email?: string[];
  password?: string[];
  captcha?: string[];
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [touched, setTouched] = useState<{ email: boolean; password: boolean }>({ email: false, password: false });
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

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
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      // Verificar si hay errores de validación por campo
      if (err.errors) {
        setFieldErrors(err.errors);
      } else {
        setError(err.message || 'Error al iniciar sesión. Verifica tus credenciales.');
      }
      // Reset captcha on error
      recaptchaRef.current?.reset();
      setCaptchaToken(null);
    } finally {
      setLoading(false);
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
