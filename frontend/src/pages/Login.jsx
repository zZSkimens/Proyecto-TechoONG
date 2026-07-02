import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/auth.service.js';
import '../styles/Login.css';

export default function LoginPage() {
  const [rut, setRut] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!rut || !password) {
      setError('RUT y contraseña son requeridos');
      return;
    }

    setLoading(true);
    try {
      await login(rut, password);
      navigate('/inicio');
    } catch (err) {
      setError(err.data?.message || err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <div className="login-logo">
            <svg viewBox="0 0 100 100" width="72" height="72">
              <circle cx="50" cy="50" r="48" fill="#1DA1D4" />
              <path d="M50 20 L30 45 L38 45 L38 65 L62 65 L62 45 L70 45 Z" fill="white" />
            </svg>
          </div>
          <h1>TechoONG</h1>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {error && <div className="login-error">{error}</div>}

          <div className="form-group">
            <label className="form-label" htmlFor="login-rut">RUT</label>
            <input
              id="login-rut"
              className="input"
              type="text"
              placeholder="12345678-9"
              value={rut}
              onChange={(e) => setRut(e.target.value)}
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Contraseña</label>
            <input
              id="login-password"
              className="input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                Ingresando...
              </>
            ) : (
              'Iniciar Sesión'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
