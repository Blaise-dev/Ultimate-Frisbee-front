import React, { useEffect, useState } from 'react';
import MainLayout from '../components/Layout/MainLayout';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Modal from '../components/UI/Modal';
import Input from '../components/UI/Input';
import { useAuth } from '../contexts/AuthContext';
import { athleteService } from '../services/athlete.service';
import { Athlete } from '../types';
import { MdPeople, MdAdd, MdEdit, MdDelete } from 'react-icons/md';

const Athletes: React.FC = () => {
  const { user } = useAuth();
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAthlete, setSelectedAthlete] = useState<Athlete | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    category: '',
    level: '',
  });

  const fetchAthletes = async () => {
    try {
      setLoading(true);
      const data = await athleteService.getAllAthletes();
      setAthletes(data);
    } catch (error) {
      console.error('Erreur lors du chargement des athlètes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAthletes();
  }, []);

  const handleOpenModal = (athlete?: Athlete) => {
    if (athlete) {
      setSelectedAthlete(athlete);
      setFormData({
        email: '',
        password: '',
        firstName: athlete.firstName,
        lastName: athlete.lastName,
        category: athlete.category,
        level: athlete.level,
      });
    } else {
      setSelectedAthlete(null);
      setFormData({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        category: '',
        level: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAthlete(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedAthlete) {
        await athleteService.updateAthlete(selectedAthlete.id, {
          firstName: formData.firstName,
          lastName: formData.lastName,
          category: formData.category as any,
          level: formData.level as any,
        });
      } else {
        await athleteService.createAthlete(formData);
      }
      handleCloseModal();
      fetchAthletes();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde de l\'athlète');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet athlète ?')) {
      try {
        await athleteService.deleteAthlete(id);
        fetchAthletes();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression de l\'athlète');
      }
    }
  };

  const categoryOptions = [
    { value: 'JUNIOR', label: 'Junior' },
    { value: 'SENIOR', label: 'Senior' },
    { value: 'VETERAN', label: 'Vétéran' },
  ];

  const levelOptions = [
    { value: 'BEGINNER', label: 'Débutant' },
    { value: 'INTERMEDIATE', label: 'Intermédiaire' },
    { value: 'ADVANCED', label: 'Avancé' },
    { value: 'EXPERT', label: 'Expert' },
  ];

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
        <h1 style={styles.title}><MdPeople style={{ verticalAlign: 'middle', marginRight: '8px' }} /> Athlètes</h1>
        <Button onClick={() => handleOpenModal()}>
          <MdAdd style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Nouvel athlète
        </Button>
      </div>

      <Card>
        {athletes.length === 0 ? (
          <div style={styles.empty}>Aucun athlète enregistré</div>
        ) : (
          <div style={styles.grid}>
            {athletes.map((athlete) => (
              <div key={athlete.id} style={styles.athleteCard}>
                <div style={styles.athleteHeader}>
                  <div style={styles.avatar}>
                    {athlete.firstName[0]}{athlete.lastName[0]}
                  </div>
                  <div style={styles.athleteInfo}>
                    <h3 style={styles.athleteName}>
                      {athlete.firstName} {athlete.lastName}
                    </h3>
                    <p style={styles.athleteMeta}>
                      {athlete.category} • {athlete.level}
                    </p>
                  </div>
                </div>
                <div style={styles.cardActions}>
                  <button
                    style={styles.actionButton}
                    onClick={() => handleOpenModal(athlete)}
                  >
                    <MdEdit style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Modifier
                  </button>
                  <button
                    style={{ ...styles.actionButton, color: '#ef4444' }}
                    onClick={() => handleDelete(athlete.id)}
                  >
                    <MdDelete style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Supprimer
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
        title={selectedAthlete ? 'Modifier l\'athlète' : 'Nouvel athlète'}
      >
        <form onSubmit={handleSubmit}>
          {!selectedAthlete && (
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
            label="Catégorie"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            options={categoryOptions}
            required
          />
          <Input
            label="Niveau"
            value={formData.level}
            onChange={(e) => setFormData({ ...formData, level: e.target.value })}
            options={levelOptions}
            required
          />
          <div style={styles.modalActions}>
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
              Annuler
            </Button>
            <Button type="submit">
              {selectedAthlete ? 'Mettre à jour' : 'Créer'}
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
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px',
  },
  athleteCard: {
    padding: '20px',
    border: '2px solid #f0f0f0',
    borderRadius: '12px',
    transition: 'all 0.2s',
  },
  athleteHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '16px',
  },
  avatar: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    fontWeight: '600',
    flexShrink: 0,
  },
  athleteInfo: {
    flex: 1,
  },
  athleteName: {
    margin: '0 0 4px 0',
    fontSize: '16px',
    fontWeight: '600',
    color: '#333',
  },
  athleteMeta: {
    margin: 0,
    fontSize: '14px',
    color: '#666',
  },
  cardActions: {
    display: 'flex',
    gap: '8px',
  },
  actionButton: {
    flex: 1,
    padding: '8px 12px',
    background: 'transparent',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#667eea',
    fontWeight: '600',
    transition: 'all 0.2s',
  },
  modalActions: {
    display: 'flex',
    gap: '12px',
    marginTop: '24px',
  },
};

export default Athletes;
