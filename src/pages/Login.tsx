import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { MdSportsBaseball } from 'react-icons/md';
import CreatorSignature from '../components/UI/CreatorSignature';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logoContainer}>
          <MdSportsBaseball style={styles.logoIcon} />
          <h1 style={styles.title}>Ultimate Frisbee</h1>
        </div>
        <h2 style={styles.subtitle}>Connexion</h2>
        
        {error && <div style={styles.error}>{error}</div>}
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
              placeholder="votre@email.com"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{...styles.button, opacity: loading ? 0.6 : 1}}
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>

          <div style={styles.footer}>
            <span style={styles.footerText}>Pas encore de compte ? </span>
            <Link to="/register" style={styles.link}>
              S'inscrire
            </Link>
          </div>

          <div style={styles.signature}>
            <CreatorSignature compact />
          </div>
        </form>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f9fafb',
    padding: '20px',
  },
  card: {
    background: '#ffffff',
    padding: '48px',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '420px',
    border: '1px solid #e5e7eb',
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    marginBottom: '8px',
  },
  logoIcon: {
    fontSize: '32px',
    color: '#4f9eff',
  },
  title: {
    textAlign: 'center',
    margin: '0',
    fontSize: '28px',
    color: '#1f2937',
    fontWeight: '600',
  },
  subtitle: {
    textAlign: 'center',
    margin: '0 0 32px 0',
    fontSize: '16px',
    color: '#6b7280',
    fontWeight: '400',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#374151',
  },
  input: {
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    transition: 'border-color 0.15s',
    outline: 'none',
    color: '#1f2937',
  },
  button: {
    padding: '12px',
    background: '#4f9eff',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    marginTop: '8px',
    transition: 'background 0.15s',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
  },
  error: {
    padding: '12px',
    background: '#fee2e2',
    color: '#dc2626',
    borderRadius: '6px',
    marginBottom: '20px',
    textAlign: 'center',
    fontSize: '13px',
    border: '1px solid #fecaca',
  },
  footer: {
    textAlign: 'center',
    marginTop: '16px',
  },
  footerText: {
    fontSize: '14px',
    color: '#6b7280',
  },
  link: {
    color: '#667eea',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '600',
  },
  signature: {
    marginTop: '18px',
  },
};

export default Login;
