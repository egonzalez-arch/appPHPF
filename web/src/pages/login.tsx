import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { apiFetch } from '../lib/apiClient';
import { getStoredToken } from '../lib/auth';
import { useRouter } from 'next/router';

/**
 * Página de login mínima (mantén tu diseño / clases actuales).
 * Ajusta campos y endpoint si tu backend usa nombres distintos.
 */
const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      // Ajustar endpoint si tu backend usa otro (ej: /auth/login)
      const resp = await apiFetch<{ access_token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      await login(resp.access_token);
      if (getStoredToken()) {
        router.replace('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Error de autenticación');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-wrapper">
      <form onSubmit={handleSubmit} className="login-form">
        <h1>Iniciar Sesión</h1>
        <div className="form-group">
          <label>Email</label>
          <input
            disabled={submitting}
            value={email}
            onChange={e => setEmail(e.target.value)}
            type="email"
            autoComplete="username"
          />
        </div>
        <div className="form-group">
          <label>Contraseña</label>
          <input
            disabled={submitting}
            value={password}
            onChange={e => setPassword(e.target.value)}
            type="password"
            autoComplete="current-password"
          />
        </div>
        {error && <div className="error-box">{error}</div>}
        <button type="submit" disabled={submitting}>
          {submitting ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;