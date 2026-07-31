import { useState } from 'react';
import { Database, LoaderCircle, Lock } from 'lucide-react';
import { login } from '../services/erpnext';
import type { ERPUser } from '../services/erpnext';

interface LoginPageProps {
  onLogin: (user: ERPUser) => void;
}

export const LoginPage = ({ onLogin }: LoginPageProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login({ username, password });
      onLogin(user);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-panel">
        <div className="login-brand">
          <div className="login-brand-icon"><Database size={24} /></div>
          <div>
            <h1>Pactac ERP</h1>
            <p>Sign in to continue</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <label>
            Email or username
            <input
              autoFocus
              autoComplete="username"
              value={username}
              onChange={event => setUsername(event.target.value)}
              placeholder="Enter your email or username"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={event => setPassword(event.target.value)}
              placeholder="Enter your password"
              required
            />
          </label>

          {error && <div className="login-error" role="alert">{error}</div>}

          <button className="login-submit" disabled={loading}>
            {loading ? <LoaderCircle className="animate-spin" size={17} /> : <Lock size={17} />}
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </section>
    </main>
  );
};
