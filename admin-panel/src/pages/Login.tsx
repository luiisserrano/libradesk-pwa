import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ReCaptcha from '../components/ReCaptcha';
import ReCAPTCHA from 'react-google-recaptcha';
import './Auth.css';

interface FieldErrors {
  email?: string[];
  password?: string[];
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    // Verificar captcha
    if (!captchaToken) {
      setError('Por favor completa el captcha');
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

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-logo">📖 LibraDesk</h1>
          <p className="auth-subtitle">Panel de Administración</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <h2>Iniciar Sesión</h2>

          {error && <div className="auth-error">{error}</div>}

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className={`form-input ${fieldErrors.email ? 'input-error' : ''}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
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
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            {fieldErrors.password && (
              <span className="field-error">{fieldErrors.password[0]}</span>
            )}
          </div>

          <ReCaptcha 
            recaptchaRef={recaptchaRef}
            onVerify={(token) => setCaptchaToken(token)} 
            onExpire={() => setCaptchaToken(null)}
          />

          <button type="submit" className="btn btn-primary auth-btn" disabled={loading || !captchaToken}>
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>

        </form>
      </div>
    </div>
  );
}
