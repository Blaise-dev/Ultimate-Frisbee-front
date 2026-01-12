import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MdBlock, MdCheckCircle, MdPerson, MdArrowBack, MdAdd, MdDelete } from 'react-icons/md';
import Modal from '../components/UI/Modal';
import Toast from '../components/UI/Toast';
import { useToast } from '../hooks/useToast';

interface User {
  id: string;
  email: string;
  role: string;
  isBanned: boolean;
  bannedAt?: string;
  isDeleted: boolean;
  deletedAt?: string;
  athlete?: {
    firstName: string;
    lastName: string;
  };
  coach?: {
    firstName: string;
    lastName: string;
  };
}

export default function UserManagement() {
  const navigate = useNavigate();
  const toast = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userType, setUserType] = useState<'ATHLETE' | 'COACH'>('ATHLETE');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    category: 'JUNIOR' as const,
    level: 'BEGINNER' as const,
  });
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Récupérer tous les athlètes (incluant les supprimés pour la page admin)
      const athletesResponse = await axios.get(`${API_URL}/athletes?includeDeleted=true`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Récupérer tous les coaches (incluant les supprimés pour la page admin)
      const coachesResponse = await axios.get(`${API_URL}/coaches?includeDeleted=true`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Combiner et formater les données
      const athleteUsers = athletesResponse.data.map((athlete: any) => ({
        id: athlete.userId,
        email: athlete.user?.email || 'N/A',
        role: 'ATHLETE',
        isBanned: athlete.user?.isBanned || false,
        bannedAt: athlete.user?.bannedAt,
        isDeleted: athlete.user?.isDeleted || false,
        deletedAt: athlete.user?.deletedAt,
        athlete: {
          firstName: athlete.firstName,
          lastName: athlete.lastName,
        }
      }));

      const coachUsers = coachesResponse.data.map((coach: any) => ({
        id: coach.userId,
        email: coach.user?.email || 'N/A',
        role: 'COACH',
        isBanned: coach.user?.isBanned || false,
        bannedAt: coach.user?.bannedAt,
        isDeleted: coach.user?.isDeleted || false,
        deletedAt: coach.user?.deletedAt,
        coach: {
          firstName: coach.firstName,
          lastName: coach.lastName,
        }
      }));

      const allUsers = [...athleteUsers, ...coachUsers];
      console.log('Utilisateurs récupérés:', allUsers);
      setUsers(allUsers);
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
      setLoading(false);
    }
  };

  const handleBanUser = async (userId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir bannir cet utilisateur ?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/admin/ban/${userId}`, 
        { reason: 'Banni par l\'administrateur' },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      toast.success('Utilisateur banni avec succès');
      await fetchUsers();
    } catch (error: any) {
      console.error('Erreur lors du bannissement:', error);
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error 
        || 'Erreur lors du bannissement de l\'utilisateur';
      toast.error(errorMessage);
    }
  };

  const handleUnbanUser = async (userId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/admin/unban/${userId}`, {},
        { headers: { Authorization: `Bearer ${token}` }}
      );
      toast.success('Utilisateur débanni avec succès');
      await fetchUsers();
    } catch (error: any) {
      console.error('Erreur lors du débannissement:', error);
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error 
        || 'Erreur lors du débannissement de l\'utilisateur';
      toast.error(errorMessage);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce compte utilisateur ? Cette action est irréversible.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${API_URL}/admin/delete/${userId}`,
        { headers: { Authorization: `Bearer ${token}` }}
      );
      toast.success('Utilisateur supprimé avec succès');
      await fetchUsers();
    } catch (error: any) {
      console.error('Erreur lors de la suppression:', error);
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error 
        || 'Erreur lors de la suppression de l\'utilisateur';
      toast.error(errorMessage);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      if (userType === 'ATHLETE') {
        await axios.post(`${API_URL}/auth/register`, {
          email: formData.email,
          password: formData.password,
          role: 'ATHLETE',
          firstName: formData.firstName,
          lastName: formData.lastName,
          category: formData.category,
          level: formData.level,
        }, { headers: { Authorization: `Bearer ${token}` }});
      } else {
        await axios.post(`${API_URL}/auth/register`, {
          email: formData.email,
          password: formData.password,
          role: 'COACH',
          firstName: formData.firstName,
          lastName: formData.lastName,
        }, { headers: { Authorization: `Bearer ${token}` }});
      }

      setIsModalOpen(false);
      setFormData({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        category: 'JUNIOR',
        level: 'BEGINNER',
      });
      fetchUsers();
      toast.success('Utilisateur créé avec succès');
    } catch (error: any) {
      console.error('Erreur lors de la création:', error);
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error 
        || 'Erreur lors de la création de l\'utilisateur';
      toast.error(errorMessage);
    }
  };

  const getUserName = (user: User) => {
    if (user.athlete) {
      return `${user.athlete.firstName} ${user.athlete.lastName}`;
    }
    if (user.coach) {
      return `${user.coach.firstName} ${user.coach.lastName}`;
    }
    return user.email;
  };

  const getRoleBadge = (role: string) => {
    const colors: { [key: string]: { bg: string, text: string } } = {
      ATHLETE: { bg: '#e3f2fd', text: '#1976d2' },
      COACH: { bg: '#f3e5f5', text: '#7b1fa2' },
      ADMIN: { bg: '#fce4ec', text: '#c2185b' },
    };

    const color = colors[role] || colors.ATHLETE;

    return (
      <span style={{
        ...styles.badge,
        background: color.bg,
        color: color.text,
      }}>
        {role}
      </span>
    );
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
          <button 
            onClick={() => navigate(-1)}
            style={styles.backButton}
          >
            <MdArrowBack style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Retour
          </button>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
            <div>
            <h1 style={styles.title}>Gestion des Utilisateurs</h1>
            <p style={styles.subtitle}>
              {users.length} utilisateur{users.length > 1 ? 's' : ''} • 
              {' '}{users.filter(u => u.isBanned).length} banni{users.filter(u => u.isBanned).length > 1 ? 's' : ''} • 
              {' '}{users.filter(u => u.isDeleted).length} supprimé{users.filter(u => u.isDeleted).length > 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            style={styles.createButton}
          >
            <MdAdd style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Créer un utilisateur
          </button>
        </div>
      </div>

      <div style={styles.userList}>
        {users.map((user) => (
          <div key={user.id} style={{
            ...styles.userCard,
            ...(user.isBanned && styles.userCardBanned),
            ...(user.isDeleted && styles.userCardDeleted),
          }}>
            <div style={styles.userInfo}>
              <div style={styles.userIcon}>
                <MdPerson size={28} color={user.isDeleted ? '#999' : user.isBanned ? '#999' : '#667eea'} />
              </div>
              <div style={styles.userDetails}>
                <div style={styles.userName}>
                  {getUserName(user)}
                  {user.isDeleted && (
                    <span style={styles.deletedBadge}>SUPPRIMÉ</span>
                  )}
                  {user.isBanned && !user.isDeleted && (
                    <span style={styles.bannedBadge}>BANNI</span>
                  )}
                </div>
                <div style={styles.userEmail}>{user.email}</div>
                {user.deletedAt && (
                  <div style={styles.deletedDate}>
                    Supprimé le {new Date(user.deletedAt).toLocaleDateString('fr-FR')}
                  </div>
                )}
                {user.bannedAt && !user.isDeleted && (
                  <div style={styles.bannedDate}>
                    Banni le {new Date(user.bannedAt).toLocaleDateString('fr-FR')}
                  </div>
                )}
              </div>
              <div style={styles.userActions}>
                {getRoleBadge(user.role)}
                {!user.isDeleted && (
                  <>
                    {!user.isBanned ? (
                      <button
                        style={styles.banButton}
                        onClick={() => handleBanUser(user.id)}
                        title="Bannir l'utilisateur"
                      >
                        <MdBlock size={20} />
                      </button>
                    ) : (
                      <button
                        style={styles.unbanButton}
                        onClick={() => handleUnbanUser(user.id)}
                        title="Débannir l'utilisateur"
                      >
                        <MdCheckCircle size={20} />
                      </button>
                    )}
                    <button
                      style={styles.deleteButton}
                      onClick={() => handleDeleteUser(user.id)}
                      title="Supprimer l'utilisateur"
                    >
                      <MdDelete size={20} />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setFormData({
            email: '',
            password: '',
            firstName: '',
            lastName: '',
            category: 'JUNIOR',
            level: 'BEGINNER',
          });
        }}
        title="Créer un utilisateur"
      >
        <form onSubmit={handleCreateUser} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Type d'utilisateur</label>
            <select
              value={userType}
              onChange={(e) => setUserType(e.target.value as 'ATHLETE' | 'COACH')}
              style={styles.select}
            >
              <option value="ATHLETE">Athlète</option>
              <option value="COACH">Coach</option>
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Mot de passe *</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              style={styles.input}
              required
              minLength={6}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Prénom *</label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Nom *</label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              style={styles.input}
              required
            />
          </div>

          {userType === 'ATHLETE' && (
            <>
              <div style={styles.formGroup}>
                <label style={styles.label}>Catégorie</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  style={styles.select}
                >
                  <option value="JUNIOR">Junior</option>
                  <option value="SENIOR">Senior</option>
                  <option value="VETERAN">Vétéran</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Niveau</label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value as any })}
                  style={styles.select}
                >
                  <option value="BEGINNER">Débutant</option>
                  <option value="INTERMEDIATE">Intermédiaire</option>
                  <option value="ADVANCED">Avancé</option>
                  <option value="EXPERT">Expert</option>
                </select>
              </div>
            </>
          )}

          <div style={styles.modalActions}>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              style={styles.cancelButton}
            >
              Annuler
            </button>
            <button
              type="submit"
              style={styles.submitButton}
            >
              Créer
            </button>
          </div>
        </form>
      </Modal>
      </div>
    </>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: '32px',
  },
  header: {
    marginBottom: '32px',
  },
  backButton: {
    padding: '10px 20px',
    background: '#fff',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    color: '#333',
    transition: 'all 0.2s',
    marginBottom: '16px',
    display: 'inline-flex',
    alignItems: 'center',
  },
  title: {
    fontSize: '32px',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '16px',
    color: '#999',
  },
  userList: {
    display: 'grid',
    gap: '16px',
  },
  userCard: {
    background: '#fff',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
    transition: 'all 0.2s',
  },
  userCardBanned: {
    background: '#f5f5f5',
    opacity: 0.7,
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  userIcon: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    background: '#f0f0f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#333',
    marginBottom: '4px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  userEmail: {
    fontSize: '14px',
    color: '#666',
  },
  bannedDate: {
    fontSize: '13px',
    color: '#dc2626',
    marginTop: '4px',
  },
  deletedDate: {
    fontSize: '13px',
    color: '#6b7280',
    marginTop: '4px',
  },
  bannedBadge: {
    padding: '4px 12px',
    background: '#dc2626',
    color: 'white',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '700',
  },
  deletedBadge: {
    padding: '4px 12px',
    background: '#6b7280',
    color: 'white',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '700',
  },
  userActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  badge: {
    padding: '8px 16px',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: '600',
  },
  banButton: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    border: '2px solid #dc2626',
    background: 'white',
    color: '#dc2626',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  unbanButton: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    border: '2px solid #16a34a',
    background: 'white',
    color: '#16a34a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  deleteButton: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    border: '2px solid #f97316',
    background: 'white',
    color: '#f97316',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  userCardDeleted: {
    opacity: 0.6,
    background: '#f9fafb',
    border: '2px solid #d1d5db',
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '400px',
    fontSize: '18px',
    color: '#999',
  },
  createButton: {
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#333',
  },
  input: {
    padding: '12px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '14px',
    transition: 'all 0.2s',
  },
  select: {
    padding: '12px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '14px',
    transition: 'all 0.2s',
    backgroundColor: 'white',
  },
  modalActions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    marginTop: '24px',
  },
  cancelButton: {
    padding: '10px 20px',
    background: '#f5f5f5',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    color: '#666',
  },
  submitButton: {
    padding: '10px 20px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
  },
};
