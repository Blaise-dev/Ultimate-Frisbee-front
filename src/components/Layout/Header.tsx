import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { MdLogout, MdPerson } from 'react-icons/md';
import { getAssetUrl } from '../../config/env';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);

  useEffect(() => {
    setAvatarLoadFailed(false);
  }, [user?.profile?.profilePicture]);

  const pickInitial = (value?: string) => {
    if (!value) {
      return '';
    }

    const match = value.trim().match(/[A-Za-zÀ-ÖØ-öø-ÿ0-9]/);
    return match ? match[0].toUpperCase() : '';
  };

  const initials = (
    `${pickInitial(user?.profile?.firstName)}${pickInitial(user?.profile?.lastName)}` ||
    pickInitial(user?.email) ||
    'U'
  );
  const canShowAvatarImage = Boolean(user?.profile?.profilePicture) && !avatarLoadFailed;
  const avatarImageUrl = user?.profile?.profilePicture ? getAssetUrl(user.profile.profilePicture) : '';

  return (
    <header style={styles.header}>
      <div style={styles.userInfo}>
        <div 
          style={{
            ...styles.avatar,
            ...(canShowAvatarImage ? styles.avatarImage : {})
          }}
          onClick={() => navigate('/profile')}
          title="Mon profil"
        >
          {canShowAvatarImage ? (
            <img 
              src={avatarImageUrl} 
              alt="Profil" 
              style={styles.avatarImg}
              onError={() => setAvatarLoadFailed(true)}
            />
          ) : (
            <>{initials}</>
          )}
        </div>
        <div>
          <div style={styles.userName}>
            {user?.profile?.firstName} {user?.profile?.lastName}
          </div>
          <div style={styles.userRole}>{user?.role}</div>
        </div>
      </div>
      <div style={styles.headerActions}>
        <button 
          onClick={() => navigate('/profile')} 
          style={styles.profileButton}
          title="Mon profil"
        >
          <MdPerson style={{ fontSize: '20px' }} />
        </button>
        <button onClick={logout} style={styles.logoutButton} title="Déconnexion">
          <MdLogout style={{ fontSize: '20px' }} />
        </button>
      </div>
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
    cursor: 'pointer',
    transition: 'transform 0.2s',
  },
  avatarImage: {
    padding: 0,
    overflow: 'hidden',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  } as React.CSSProperties,
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
  headerActions: {
    display: 'flex',
    gap: '12px',
  },
  profileButton: {
    padding: '12px',
    background: '#ffffff',
    color: '#667eea',
    border: '2px solid #c7d2fe',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    transition: 'all 0.2s ease',
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
