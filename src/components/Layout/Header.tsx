import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { MdLogout } from 'react-icons/md';

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
      <button onClick={logout} style={styles.logoutButton} title="Déconnexion">
        <MdLogout style={{ fontSize: '20px' }} />
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
    marginLeft: '0',
    borderBottom: '1px solid #e5e7eb',
    width: '100%',
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
    padding: '12px',
    background: '#ffffff',
    color: '#dc2626',
    border: '2px solid #fca5a5',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 4px rgba(220, 38, 38, 0.1)',
  },
};

export default Header;
