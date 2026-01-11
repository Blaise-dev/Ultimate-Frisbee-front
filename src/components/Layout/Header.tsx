import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const Header: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header style={styles.header}>
      <div style={styles.userInfo}>
        <div style={styles.avatar}>
          {user?.profile?.firstName?.[0]}{user?.profile?.lastName?.[0]}
        </div>
        <div>
          <div style={styles.userName}>
            {user?.profile?.firstName} {user?.profile?.lastName}
          </div>
          <div style={styles.userRole}>{user?.role}</div>
        </div>
      </div>
      <button onClick={logout} style={styles.logoutButton}>
        Déconnexion
      </button>
    </header>
  );
};

const styles: Record<string, React.CSSProperties> = {
  header: {
    background: '#ffffff',
    padding: '16px 32px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    marginLeft: '260px',
    borderBottom: '1px solid #e5e7eb',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  avatar: {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #4f9eff 0%, #3b7dd6 100%)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: '600',
  },
  userName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1f2937',
  },
  userRole: {
    fontSize: '12px',
    color: '#6b7280',
    textTransform: 'capitalize',
  },
  logoutButton: {
    padding: '8px 18px',
    background: '#ffffff',
    color: '#374151',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    transition: 'all 0.2s',
  },
};

export default Header;
