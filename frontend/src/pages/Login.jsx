import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, getUser } from '../services/auth.service.js';
import '../styles/Login.css';

const ROLE_DEFAULT_ROUTES = {
  jefe_cuadrilla: '/solicitudes',
  enc_alimentacion: '/aprobacion',
  bodega: '/despacho',
  admin: '/solicitudes',
};

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Email y contraseña son requeridos');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      const user = getUser();
      const defaultRoute = ROLE_DEFAULT_ROUTES[user?.role] || '/solicitudes';
      navigate(defaultRoute);
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
          <div className="login-logo">T</div>
          <h1>TechoONG</h1>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {error && <div className="login-error">{error}</div>}

          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email</label>
            <input
              id="login-email"
              className="input"
              type="email"
              placeholder="correo@ejemplo.cl"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
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
