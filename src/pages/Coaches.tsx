import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import Card from '../components/UI/Card';
import Modal from '../components/UI/Modal';
import Toast from '../components/UI/Toast';
import { useToast } from '../hooks/useToast';
import { coachService } from '../services/coach.service';
import { Coach } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
import { MdSportsMartialArts, MdAdd, MdEdit, MdDelete, MdCalendarToday } from 'react-icons/md';

const Coaches: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    specialization: '',
    experienceYears: 0,
  });

  const fetchCoaches = async () => {
    try {
      setLoading(true);
      const data = await coachService.getAllCoaches();
      setCoaches(data);
    } catch (error) {
      console.error('Erreur lors du chargement des coachs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoaches();
  }, []);

  const handleOpenModal = (coach?: Coach) => {
    if (coach) {
      setSelectedCoach(coach);
      setFormData({
        email: '',
        password: '',
        firstName: coach.firstName,
        lastName: coach.lastName,
        specialization: (coach as any).specialization || '',
        experienceYears: (coach as any).experienceYears || 0,
      });
    } else {
      setSelectedCoach(null);
      setFormData({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        specialization: '',
        experienceYears: 0,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCoach(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedCoach) {
        await coachService.updateCoach(selectedCoach.id, {
          firstName: formData.firstName,
          lastName: formData.lastName,
          specialization: formData.specialization,
          experienceYears: Number(formData.experienceYears),
        } as any);
      } else {
        await coachService.createCoach(formData);
        toast.success('Coach créé avec succès');
      }
      handleCloseModal();
      fetchCoaches();
    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Erreur lors de la sauvegarde du coach';
      toast.error(errorMessage);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce coach ?')) {
      try {
        await coachService.deleteCoach(id);
        toast.success('Coach supprimé avec succès');
        fetchCoaches();
      } catch (error: any) {
        console.error('Erreur lors de la suppression:', error);
        const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Erreur lors de la suppression du coach';
        toast.error(errorMessage);
      }
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div style={styles.loading}>Chargement...</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div style={styles.header}>
        <h1 style={styles.title}><MdSportsMartialArts style={{ verticalAlign: 'middle', marginRight: '8px' }} /> Coachs</h1>
        <button onClick={() => handleOpenModal()} style={styles.addButton} title="Nouveau coach">
          <MdAdd style={{ fontSize: '24px' }} />
        </button>
      </div>

      <Card>
        {coaches.length === 0 ? (
          <div style={styles.empty}>Aucun coach enregistré</div>
        ) : (
          <div style={styles.grid}>
            {coaches.map((coach) => (
              <div key={coach.id} style={styles.coachCard}>
                <div 
                  style={styles.coachHeader}
                  onClick={() => navigate(`/coaches/${coach.id}`)}
                >
                  <div style={{
                    ...styles.avatar,
                    ...(coach.profilePicture ? styles.avatarImage : {})
                  }}>
                    {coach.profilePicture ? (
                      <img 
                        src={`${API_URL.replace('/api', '')}${coach.profilePicture}`} 
                        alt={`${coach.firstName} ${coach.lastName}`}
                        style={styles.avatarImg}
                      />
                    ) : (
                      <>{coach.firstName[0]}{coach.lastName[0]}</>
                    )}
                  </div>
                  <div style={styles.coachInfo}>
                    <h3 style={styles.coachName}>
                      {coach.firstName} {coach.lastName}
                    </h3>
                    <p style={styles.coachMeta}>
                      {(coach as any).specialization || 'Coach Ultimate Frisbee'}
                    </p>
                    <p style={styles.coachExperience}>
                      <MdCalendarToday style={{ verticalAlign: 'middle', marginRight: '4px' }} /> {(coach as any).experienceYears || 0} ans d'expérience
                    </p>
                  </div>
                </div>
                <div style={styles.cardActions}>
                  <button
                    style={styles.actionButton}
                    onClick={() => handleOpenModal(coach)}
                    title="Modifier"
                  >
                    <MdEdit style={{ fontSize: '18px' }} />
                  </button>
                  <button
                    style={{ ...styles.actionButton, color: '#ef4444' }}
                    onClick={() => handleDelete(coach.id)}
                    title="Supprimer"
                  >
                    <MdDelete style={{ fontSize: '18px' }} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedCoach ? 'Modifier le coach' : 'Nouveau coach'}
      >
        <form onSubmit={handleSubmit} className="modal-form">
          {!selectedCoach && (
            <>
              <div className="modal-form-group">
                <label className="modal-form-label">
                  <MdSportsMartialArts size={18} />
                  Email
                </label>
                <input
                  className="modal-form-input"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="coach@example.com"
                  required
                />
              </div>
              <div className="modal-form-group">
                <label className="modal-form-label">
                  Mot de passe
                </label>
                <input
                  className="modal-form-input"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  required
                />
              </div>
            </>
          )}
          <div className="modal-form-group">
            <label className="modal-form-label">
              Prénom
            </label>
            <input
              className="modal-form-input"
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              placeholder="Prénom du coach"
              required
            />
          </div>
          <div className="modal-form-group">
            <label className="modal-form-label">
              Nom
            </label>
            <input
              className="modal-form-input"
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              placeholder="Nom du coach"
              required
            />
          </div>
          <div className="modal-form-group">
            <label className="modal-form-label">
              Spécialisation
            </label>
            <input
              className="modal-form-input"
              type="text"
              value={formData.specialization}
              onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
              placeholder="Ex: Stratégie offensive, Défense..."
              required
            />
          </div>
          <div className="modal-form-group">
            <label className="modal-form-label">
              <MdCalendarToday size={18} />
              Années d'expérience
            </label>
            <input
              className="modal-form-input"
              type="number"
              min="0"
              value={formData.experienceYears}
              onChange={(e) => setFormData({ ...formData, experienceYears: Number(e.target.value) })}
              placeholder="Nombre d'années"
              required
            />
          </div>
          <div className="modal-form-actions">
            <button 
              type="button" 
              className="modal-form-button modal-form-button-secondary" 
              onClick={handleCloseModal}
            >
              Annuler
            </button>
            <button 
              type="submit" 
              className="modal-form-button modal-form-button-primary"
            >
              {selectedCoach ? 'Mettre à jour' : 'Créer le coach'}
            </button>
          </div>
        </form>
      </Modal>
      
      {/* Toasts */}
      {toast.toasts.map((t, index) => (
        <Toast
          key={t.id}
          message={t.message}
          type={t.type}
          onClose={() => toast.removeToast(t.id)}
          index={index}
        />
      ))}
    </MainLayout>
  );
};

const styles: Record<string, React.CSSProperties> = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  title: {
    margin: 0,
    fontSize: '28px',
    fontWeight: '700',
    color: '#333',
  },
  addButton: {
    padding: '14px 18px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '16px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    boxShadow: '0 8px 20px rgba(102, 126, 234, 0.4)',
    transition: 'all 0.3s ease',
    minWidth: '50px',
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    fontSize: '18px',
    color: '#999',
  },
  empty: {
    textAlign: 'center',
    padding: '40px',
    color: '#999',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '20px',
  },
  coachCard: {
    padding: '20px',
    border: '2px solid #f0f0f0',
    borderRadius: '12px',
    transition: 'all 0.2s',
  },
  coachHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
    marginBottom: '16px',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  },
  avatar: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    fontWeight: '600',
    flexShrink: 0,
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
  coachInfo: {
    flex: 1,
  },
  coachName: {
    margin: '0 0 4px 0',
    fontSize: '18px',
    fontWeight: '600',
    color: '#333',
  },
  coachMeta: {
    margin: '4px 0',
    fontSize: '14px',
    color: '#666',
  },
  coachExperience: {
    margin: '4px 0',
    fontSize: '13px',
    color: '#999',
  },
  cardActions: {
    display: 'flex',
    gap: '8px',
  },
  actionButton: {
    flex: 1,
    padding: '12px',
    background: 'white',
    border: '2px solid #e5e7eb',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '16px',
    color: '#667eea',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
  },
  modalActions: {
    display: 'flex',
    gap: '12px',
    marginTop: '24px',
  },
};

export default Coaches;
