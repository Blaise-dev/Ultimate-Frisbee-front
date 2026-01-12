import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { MdCameraAlt, MdPerson, MdEmail, MdArrowBack, MdAdminPanelSettings, MdSportsHandball, MdVerified } from 'react-icons/md';
import Toast from '../components/UI/Toast';
import { useToast } from '../hooks/useToast';

interface ProfileData {
  email: string;
  role: string;
  profile: {
    id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
    category?: string;
    level?: string;
  } | null;
}

export default function Profile() {
  const navigate = useNavigate();
  const toast = useToast();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(response.data);
      if (response.data.profile) {
        setFirstName(response.data.profile.firstName || '');
        setLastName(response.data.profile.lastName || '');
      }
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/profile`, 
        { firstName, lastName },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      setEditing(false);
      fetchProfile();
      toast.success('Profil mis à jour avec succès');
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour:', error);
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error 
        || 'Erreur lors de la mise à jour du profil';
      toast.error(errorMessage);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      uploadPhoto(file);
    }
  };

  const uploadPhoto = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('photo', file);

      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/profile/photo`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      fetchProfile();
      setPhotoPreview(null);
      toast.success('Photo de profil mise à jour avec succès');
    } catch (error: any) {
      console.error('Erreur lors de l\'upload:', error);
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error 
        || 'Erreur lors de l\'upload de la photo';
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible et vous serez déconnecté.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Votre compte a été supprimé avec succès');
      setTimeout(() => {
        localStorage.removeItem('token');
        navigate('/login');
      }, 1500);
    } catch (error: any) {
      console.error('Erreur lors de la suppression du compte:', error);
      console.error('Status:', error.response?.status);
      console.error('Data:', error.response?.data);
      
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error 
        || 'Erreur lors de la suppression du compte';
      toast.error(errorMessage);
    }
  };

  const getProfileImageUrl = () => {
    if (photoPreview) return photoPreview;
    if (profile?.profile?.profilePicture) {
      // Les fichiers statiques sont servis depuis /uploads, pas /api/uploads
      const baseUrl = API_URL.replace('/api', '');
      return `${baseUrl}${profile.profile.profilePicture}`;
    }
    const name = profile?.profile 
      ? `${profile.profile.firstName}+${profile.profile.lastName}` 
      : profile?.email?.split('@')[0] || 'Admin';
    return `https://ui-avatars.com/api/?name=${name}&size=400&background=667eea&color=fff&bold=true`;
  };

  const getRoleIcon = () => {
    switch (profile?.role) {
      case 'ADMIN': return <MdAdminPanelSettings size={28} />;
      case 'COACH': return <MdSportsHandball size={28} />;
      case 'ATHLETE': return <MdVerified size={28} />;
      default: return <MdPerson size={28} />;
    }
  };

  const getRoleLabel = () => {
    switch (profile?.role) {
      case 'ADMIN': return 'Administrateur';
      case 'COACH': return 'Coach';
      case 'ATHLETE': return 'Athlète';
      default: return profile?.role;
    }
  };

  const getRoleColor = () => {
    switch (profile?.role) {
      case 'ADMIN': return '#dc2626';
      case 'COACH': return '#7b1fa2';
      case 'ATHLETE': return '#1976d2';
      default: return '#667eea';
    }
  };

  if (loading) {
    return <div style={styles.loading}>Chargement...</div>;
  }

  return (
    <>
      {toast.toasts.map((t) => (
        <Toast
          key={t.id}
          message={t.message}
          type={t.type}
          onClose={() => toast.removeToast(t.id)}
        />
      ))}
      <div style={styles.container}>
        <div style={styles.header}>
          <button style={styles.backButton} onClick={() => navigate(-1)}>
            <MdArrowBack size={20} />
            <span>Retour</span>
          </button>
          <h1 style={styles.title}>Mon Profil</h1>
        </div>

      <div style={styles.card}>
        <div style={styles.photoSection}>
          <div style={styles.photoContainer}>
            <img 
              src={getProfileImageUrl()} 
              alt="Profile" 
              style={styles.profileImage}
            />
            {uploading && (
              <div style={styles.uploadingOverlay}>
                <div style={styles.spinner}></div>
              </div>
            )}
            {profile?.profile && (
              <label style={styles.photoButton}>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handlePhotoChange}
                  style={{ display: 'none' }}
                />
                <MdCameraAlt size={24} />
              </label>
            )}
          </div>
          <div style={styles.roleSection}>
            <div style={{ ...styles.roleBadge, background: getRoleColor() }}>
              {getRoleIcon()}
              <span>{getRoleLabel()}</span>
            </div>
          </div>
        </div>

        <div style={styles.infoSection}>
          {!editing ? (
            <>
              {profile?.profile ? (
                <>
                  <div style={styles.infoRow}>
                    <MdPerson size={24} color="#667eea" />
                    <div style={styles.infoContent}>
                      <div style={styles.label}>Nom complet</div>
                      <div style={styles.value}>
                        {profile.profile.firstName} {profile.profile.lastName}
                      </div>
                    </div>
                  </div>

                  <div style={styles.infoRow}>
                    <MdEmail size={24} color="#667eea" />
                    <div style={styles.infoContent}>
                      <div style={styles.label}>Email</div>
                      <div style={styles.value}>{profile.email}</div>
                    </div>
                  </div>

                  {profile.profile.category && (
                    <div style={styles.infoRow}>
                      <div style={styles.badge}>{profile.profile.category}</div>
                      {profile.profile.level && (
                        <div style={styles.badge}>{profile.profile.level}</div>
                      )}
                    </div>
                  )}

                  <button style={styles.editButton} onClick={() => setEditing(true)}>
                    Modifier le profil
                  </button>

                  {profile?.role !== 'ADMIN' && (
                    <button style={styles.deleteButton} onClick={handleDeleteAccount}>
                      Supprimer mon compte
                    </button>
                  )}
                </>
              ) : (
                <>
                  <div style={styles.adminNotice}>
                    <MdAdminPanelSettings size={48} color="#dc2626" />
                    <h3 style={styles.adminTitle}>Compte Administrateur</h3>
                    <p style={styles.adminText}>
                      En tant qu'administrateur, vous avez accès à toutes les fonctionnalités de gestion de la plateforme Ultimate Frisbee.
                    </p>
                  </div>

                  <div style={styles.infoRow}>
                    <MdEmail size={24} color="#667eea" />
                    <div style={styles.infoContent}>
                      <div style={styles.label}>Email de connexion</div>
                      <div style={styles.value}>{profile?.email}</div>
                    </div>
                  </div>

                  <div style={styles.statsGrid}>
                    <div style={styles.statCard}>
                      <div style={styles.statIcon}>👥</div>
                      <div style={styles.statLabel}>Gestion</div>
                      <div style={styles.statValue}>Utilisateurs</div>
                    </div>
                    <div style={styles.statCard}>
                      <div style={styles.statIcon}>🏃</div>
                      <div style={styles.statLabel}>Accès</div>
                      <div style={styles.statValue}>Athlètes</div>
                    </div>
                    <div style={styles.statCard}>
                      <div style={styles.statIcon}>👨‍🏫</div>
                      <div style={styles.statLabel}>Supervision</div>
                      <div style={styles.statValue}>Coaches</div>
                    </div>
                    <div style={styles.statCard}>
                      <div style={styles.statIcon}>📊</div>
                      <div style={styles.statLabel}>Contrôle</div>
                      <div style={styles.statValue}>Sessions</div>
                    </div>
                  </div>

                  <div style={styles.quickActions}>
                    <h4 style={styles.quickActionsTitle}>Accès Rapide</h4>
                    <button 
                      style={styles.quickActionButton}
                      onClick={() => navigate('/users')}
                    >
                      <MdAdminPanelSettings size={20} />
                      Gérer les utilisateurs
                    </button>
                    <button 
                      style={styles.quickActionButton}
                      onClick={() => navigate('/athletes')}
                    >
                      <MdVerified size={20} />
                      Voir les athlètes
                    </button>
                    <button 
                      style={styles.quickActionButton}
                      onClick={() => navigate('/coaches')}
                    >
                      <MdSportsHandball size={20} />
                      Voir les coaches
                    </button>
                  </div>
                </>
              )}
            </>
          ) : (
            <form onSubmit={handleUpdateProfile}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Prénom</label>
                <input 
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Nom</label>
                <input 
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.buttonGroup}>
                <button type="submit" style={styles.saveButton}>
                  Enregistrer
                </button>
                <button 
                  type="button" 
                  style={styles.cancelButton}
                  onClick={() => {
                    setEditing(false);
                    setFirstName(profile?.profile?.firstName || '');
                    setLastName(profile?.profile?.lastName || '');
                  }}
                >
                  Annuler
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
      </div>
    </>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: '32px',
    maxWidth: '900px',
    margin: '0 auto',
  },
  header: {
    marginBottom: '32px',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    background: 'white',
    border: '2px solid #e0e0e0',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '600',
    color: '#667eea',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  title: {
    fontSize: '32px',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    margin: 0,
  },
  card: {
    background: '#fff',
    borderRadius: '24px',
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.08)',
    overflow: 'hidden',
  },
  photoSection: {
    padding: '48px 32px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '24px',
  },
  roleSection: {
    display: 'flex',
    justifyContent: 'center',
  },
  roleBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 24px',
    borderRadius: '16px',
    color: 'white',
    fontSize: '16px',
    fontWeight: '700',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
  },
  photoContainer: {
    position: 'relative',
    width: '200px',
    height: '200px',
  },
  profileImage: {
    width: '200px',
    height: '200px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '6px solid white',
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid rgba(255, 255, 255, 0.3)',
    borderTop: '4px solid white',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  photoButton: {
    position: 'absolute',
    bottom: '10px',
    right: '10px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: 'white',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
    transition: 'transform 0.2s',
  },
  infoSection: {
    padding: '32px',
  },
  infoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '20px 0',
    borderBottom: '1px solid #f0f0f0',
  },
  infoContent: {
    flex: 1,
  },
  label: {
    fontSize: '13px',
    color: '#999',
    marginBottom: '4px',
  },
  value: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#333',
  },
  badge: {
    padding: '8px 16px',
    background: '#f0f0f0',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#667eea',
  },
  editButton: {
    marginTop: '24px',
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '16px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 8px 20px rgba(102, 126, 234, 0.4)',
  },
  deleteButton: {
    marginTop: '12px',
    width: '100%',
    padding: '14px',
    background: 'white',
    color: '#dc2626',
    border: '2px solid #dc2626',
    borderRadius: '16px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  formGroup: {
    marginBottom: '20px',
  },
  formLabel: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '8px',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #e0e0e0',
    borderRadius: '12px',
    fontSize: '16px',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
    marginTop: '24px',
  },
  saveButton: {
    flex: 1,
    padding: '14px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '16px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  cancelButton: {
    flex: 1,
    padding: '14px',
    background: 'white',
    color: '#667eea',
    border: '2px solid #667eea',
    borderRadius: '16px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '400px',
    fontSize: '18px',
    color: '#999',
  },
  adminNotice: {
    textAlign: 'center',
    padding: '32px',
    background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
    borderRadius: '16px',
    marginBottom: '24px',
  },
  adminTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#dc2626',
    marginTop: '16px',
    marginBottom: '8px',
  },
  adminText: {
    fontSize: '15px',
    color: '#991b1b',
    lineHeight: '1.6',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
    marginTop: '24px',
    marginBottom: '24px',
  },
  statCard: {
    background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
    padding: '20px',
    borderRadius: '16px',
    textAlign: 'center',
    border: '2px solid #bae6fd',
  },
  statIcon: {
    fontSize: '32px',
    marginBottom: '8px',
  },
  statLabel: {
    fontSize: '13px',
    color: '#0369a1',
    fontWeight: '600',
    marginBottom: '4px',
  },
  statValue: {
    fontSize: '16px',
    color: '#0c4a6e',
    fontWeight: '700',
  },
  quickActions: {
    marginTop: '24px',
  },
  quickActionsTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#333',
    marginBottom: '16px',
  },
  quickActionButton: {
    width: '100%',
    padding: '16px 20px',
    background: 'white',
    border: '2px solid #e0e0e0',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '600',
    color: '#667eea',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '12px',
    transition: 'all 0.2s',
  },
};
