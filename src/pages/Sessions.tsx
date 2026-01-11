import React, { useEffect, useState } from 'react';
import MainLayout from '../components/Layout/MainLayout';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Modal from '../components/UI/Modal';
import Input from '../components/UI/Input';
import { useAuth } from '../contexts/AuthContext';
import { sessionService } from '../services/session.service';
import { coachService } from '../services/coach.service';
import { Session, Coach } from '../types';
import { MdEventNote, MdAdd, MdEdit, MdDelete, MdLocationOn, MdSchedule, MdSportsScore } from 'react-icons/md';

const Sessions: React.FC = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    location: '',
    startTime: '',
    endTime: '',
    description: '',
    coachId: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sessionsData, coachesData] = await Promise.all([
        sessionService.getAllSessions(),
        coachService.getAllCoaches(),
      ]);
      setSessions(sessionsData);
      setCoaches(coachesData);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (session?: Session) => {
    if (session) {
      setSelectedSession(session);
      setFormData({
        title: session.title,
        type: session.type,
        location: session.location || '',
        startTime: new Date(session.startTime).toISOString().slice(0, 16),
        endTime: new Date(session.endTime).toISOString().slice(0, 16),
        description: session.description || '',
        coachId: session.coachId,
      });
    } else {
      setSelectedSession(null);
      setFormData({
        title: '',
        type: '',
        location: '',
        startTime: '',
        endTime: '',
        description: '',
        coachId: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSession(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const sessionData: any = {
        ...formData,
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString(),
      };

      if (selectedSession) {
        await sessionService.updateSession(selectedSession.id, sessionData);
      } else {
        await sessionService.createSession(sessionData);
      }
      handleCloseModal();
      fetchData();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde de la séance');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette séance ?')) {
      try {
        await sessionService.deleteSession(id);
        fetchData();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression de la séance');
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const sessionTypeOptions = [
    { value: 'TRAINING', label: 'Entraînement' },
    { value: 'MATCH', label: 'Match' },
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
        <h1 style={styles.title}><MdEventNote style={{ verticalAlign: 'middle', marginRight: '8px' }} /> Séances</h1>
        {(user?.role === 'ADMIN' || user?.role === 'COACH') && (
          <Button onClick={() => handleOpenModal()}>
            <MdAdd style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Nouvelle séance
          </Button>
        )}
      </div>

      <Card>
        {sessions.length === 0 ? (
          <div style={styles.empty}>Aucune séance programmée</div>
        ) : (
          <div style={styles.grid}>
            {sessions.map((session) => (
              <div key={session.id} style={styles.sessionCard}>
                <div style={styles.sessionHeader}>
                  <span
                    style={{
                      ...styles.badge,
                      background: session.type === 'TRAINING' ? '#e3f2fd' : '#fce4ec',
                      color: session.type === 'TRAINING' ? '#1976d2' : '#c2185b',
                    }}
                  >
                    {session.type === 'TRAINING' ? 'Entraînement' : 'Match'}
                  </span>
                </div>
                <h3 style={styles.sessionTitle}>{session.title}</h3>
                <div style={styles.sessionDetails}>
                  <p style={styles.detail}><MdLocationOn style={{ verticalAlign: 'middle', marginRight: '4px' }} /> {session.location || 'Lieu non défini'}</p>
                  <p style={styles.detail}><MdSchedule style={{ verticalAlign: 'middle', marginRight: '4px' }} /> {formatDate(session.startTime)}</p>
                  <p style={styles.detail}>
                    <MdSchedule style={{ verticalAlign: 'middle', marginRight: '4px' }} /> {formatDate(session.endTime)}
                  </p>
                  {(session as any).coach && (
                    <p style={styles.detail}>
                      <MdSportsScore style={{ verticalAlign: 'middle', marginRight: '4px' }} /> {(session as any).coach.firstName} {(session as any).coach.lastName}
                    </p>
                  )}
                  {session.description && (
                    <p style={styles.description}>{session.description}</p>
                  )}
                </div>
                {(user?.role === 'ADMIN' || user?.role === 'COACH') && (
                  <div style={styles.cardActions}>
                    <button
                      style={styles.actionButton}
                      onClick={() => handleOpenModal(session)}
                    >
                      <MdEdit style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Modifier
                    </button>
                    <button
                      style={{ ...styles.actionButton, color: '#ef4444' }}
                      onClick={() => handleDelete(session.id)}
                    >
                      <MdDelete style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Supprimer
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedSession ? 'Modifier la séance' : 'Nouvelle séance'}
      >
        <form onSubmit={handleSubmit}>
          <Input
            label="Titre"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Ex: Entraînement technique"
            required
          />
          <Input
            label="Type"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            options={sessionTypeOptions}
            required
          />
          <Input
            label="Lieu"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="Ex: Stade municipal"
            required
          />
          <Input
            label="Début"
            type="datetime-local"
            value={formData.startTime}
            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
            required
          />
          <Input
            label="Fin"
            type="datetime-local"
            value={formData.endTime}
            onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
            required
          />
          <Input
            label="Coach"
            value={formData.coachId}
            onChange={(e) => setFormData({ ...formData, coachId: e.target.value })}
            options={coaches.map(c => ({
              value: c.id,
              label: `${c.firstName} ${c.lastName}`,
            }))}
            required
          />
          <Input
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Détails de la séance..."
            textarea
          />
          <div style={styles.modalActions}>
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
              Annuler
            </Button>
            <Button type="submit">
              {selectedSession ? 'Mettre à jour' : 'Créer'}
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
  sessionCard: {
    padding: '20px',
    border: '2px solid #f0f0f0',
    borderRadius: '12px',
    transition: 'all 0.2s',
  },
  sessionHeader: {
    marginBottom: '12px',
  },
  badge: {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
    display: 'inline-block',
  },
  sessionTitle: {
    margin: '0 0 16px 0',
    fontSize: '18px',
    fontWeight: '600',
    color: '#333',
  },
  sessionDetails: {
    marginBottom: '16px',
  },
  detail: {
    margin: '8px 0',
    fontSize: '14px',
    color: '#666',
  },
  description: {
    margin: '12px 0 0 0',
    fontSize: '13px',
    color: '#999',
    fontStyle: 'italic',
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

export default Sessions;
