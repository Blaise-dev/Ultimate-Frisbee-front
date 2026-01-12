import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Modal from '../components/UI/Modal';
import Input from '../components/UI/Input';
import { coachService } from '../services/coach.service';
import { Coach } from '../types';
import { MdSportsMartialArts, MdAdd, MdEdit, MdDelete, MdCalendarToday } from 'react-icons/md';

const Coaches: React.FC = () => {
  const navigate = useNavigate();
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
      }
      handleCloseModal();
      fetchCoaches();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde du coach');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce coach ?')) {
      try {
        await coachService.deleteCoach(id);
        fetchCoaches();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression du coach');
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
                  <div style={styles.avatar}>
                    {coach.firstName[0]}{coach.lastName[0]}
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
        <form onSubmit={handleSubmit}>
          {!selectedCoach && (
            <>
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
              <Input
                label="Mot de passe"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </>
          )}
          <Input
            label="Prénom"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            required
          />
          <Input
            label="Nom"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            required
          />
          <Input
            label="Spécialisation"
            value={formData.specialization}
            onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
            placeholder="Ex: Stratégie offensive, Défense..."
            required
          />
          <Input
            label="Années d'expérience"
            type="number"
            value={formData.experienceYears}
            onChange={(e) => setFormData({ ...formData, experienceYears: Number(e.target.value) })}
            required
          />
          <div style={styles.modalActions}>
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
              Annuler
            </Button>
            <Button type="submit">
              {selectedCoach ? 'Mettre à jour' : 'Créer'}
            </Button>
          </div>
        </form>
      </Modal>
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
