import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import Card from '../components/UI/Card';
import Modal from '../components/UI/Modal';
import Toast from '../components/UI/Toast';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../contexts/AuthContext';
import { sessionService } from '../services/session.service';
import { coachService } from '../services/coach.service';
import { Session, Coach } from '../types';
import { MdEventNote, MdAdd, MdEdit, MdDelete, MdLocationOn, MdSchedule, MdSportsScore, MdImage, MdPersonAdd, MdPersonRemove } from 'react-icons/md';
import axios from 'axios';
import { API_URL, getAssetUrl, getDefaultSessionImageUrl } from '../config/env';

const Sessions: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

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
      // Afficher l'image existante ou l'image par défaut
      if (session.imageUrl) {
        setImagePreview(getAssetUrl(session.imageUrl));
      } else {
        setImagePreview(getDefaultSessionImageUrl(session.type));
      }
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
      setImagePreview('');
    }
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSession(null);
    setImageFile(null);
    setImagePreview('');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const sessionData: any = {
        ...formData,
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString(),
      };

      console.log('Saving session data:', sessionData);

      let sessionId: string;
      if (selectedSession) {
        console.log('Updating session:', selectedSession.id);
        await sessionService.updateSession(selectedSession.id, sessionData);
        sessionId = selectedSession.id;
      } else {
        console.log('Creating new session');
        const newSession = await sessionService.createSession(sessionData);
        sessionId = newSession.id;
        console.log('New session created with ID:', sessionId);
      }

      // Upload de l'image si sélectionnée
      if (imageFile) {
        console.log('Uploading image for session:', sessionId);
        const imageFormData = new FormData();
        imageFormData.append('image', imageFile);
        const token = localStorage.getItem('token');
        const response = await axios.post(`${API_URL}/sessions/${sessionId}/image`, imageFormData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`,
          },
        });
        console.log('Image uploaded successfully:', response.data);
      }

      handleCloseModal();
      fetchData();
    } catch (error: any) {
      console.error('Erreur complète:', error);
      console.error('Détails:', error.response?.data);
      const errorMsg = error.response?.data?.message || error.message || 'Erreur inconnue';
      alert(`Erreur lors de la sauvegarde de la séance: ${errorMsg}`);
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

  const handleRegisterToSession = async (sessionId: string) => {
    try {
      const athleteId = (user?.profile as any)?.id;
      if (!athleteId) {
        toast.error('Profil athlète non trouvé');
        return;
      }
      
      await sessionService.addAthleteToSession(sessionId, athleteId);
      toast.success('Inscription réussie !');
      fetchData();
    } catch (error: any) {
      console.error('Erreur lors de l\'inscription:', error);
      const errorMessage = error.response?.data?.error || 'Erreur lors de l\'inscription';
      toast.error(errorMessage);
    }
  };

  const handleUnregisterFromSession = async (sessionId: string) => {
    try {
      const athleteId = (user?.profile as any)?.id;
      console.log('🗑️ Tentative de désinscription:', { sessionId, athleteId, user });
      
      if (!athleteId) {
        toast.error('Profil athlète non trouvé');
        return;
      }
      
      await sessionService.removeAthleteFromSession(sessionId, athleteId);
      toast.success('Désinscription réussie !');
      fetchData();
    } catch (error: any) {
      console.error('Erreur lors de la désinscription:', error);
      console.error('Détails erreur:', error.response);
      const errorMessage = error.response?.data?.error || 'Erreur lors de la désinscription';
      toast.error(errorMessage);
    }
  };

  const isRegisteredToSession = (session: Session): boolean => {
    const athleteId = (user?.profile as any)?.id;
    if (!athleteId) return false;
    return (session as any).athletes?.some((a: any) => a.athleteId === athleteId) || false;
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
      {toast.toasts.map((t, index) => (
        <Toast
          key={t.id}
          message={t.message}
          type={t.type}
          onClose={() => toast.removeToast(t.id)}
          index={index}
        />
      ))}
      <div style={styles.header}>
        <h1 style={styles.title}><MdEventNote style={{ verticalAlign: 'middle', marginRight: '8px' }} /> Séances</h1>
        {(user?.role === 'ADMIN' || user?.role === 'COACH') && (
          <button onClick={() => handleOpenModal()} style={styles.addButton} title="Nouvelle séance">
            <MdAdd style={{ fontSize: '24px' }} />
          </button>
        )}
      </div>

      <Card>
        {sessions.length === 0 ? (
          <div style={styles.empty}>Aucune séance programmée</div>
        ) : (
          <div style={styles.grid}>
            {sessions.map((session) => {
              const imageSrc = session.imageUrl 
                ? getAssetUrl(session.imageUrl)
                : getDefaultSessionImageUrl(session.type);
              
              console.log('Session:', session.title, 'ImageURL:', session.imageUrl, 'Final src:', imageSrc);
              
              return (
                <div key={session.id} style={styles.sessionCard}>
                  <div 
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/sessions/${session.id}`)}
                  >
                    <div style={styles.sessionImage}>
                      <img 
                        src={imageSrc}
                        alt={session.title}
                        style={styles.image}
                        onError={(e) => {
                          // Image par défaut si erreur de chargement
                          const img = e.target as HTMLImageElement;
                          const fallbackSrc = getDefaultSessionImageUrl(session.type);
                          console.error('Image loading error for:', img.src, 'Fallback to:', fallbackSrc);
                          img.src = fallbackSrc;
                        }}
                        onLoad={() => console.log('Image loaded successfully:', imageSrc)}
                      />
                      
                      {/* Bouton d'inscription en bulle sur l'image pour les athlètes */}
                      {user?.role === 'ATHLETE' && (
                        <div style={styles.imageOverlay}>
                          {isRegisteredToSession(session) ? (
                            <button
                              style={{ 
                                ...styles.bubbleButton, 
                                borderColor: '#ef4444',
                                color: '#ef4444'
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUnregisterFromSession(session.id);
                              }}
                              title="Se désinscrire"
                            >
                              <MdPersonRemove style={{ fontSize: '22px' }} />
                            </button>
                          ) : (
                            <button
                              style={styles.bubbleButton}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRegisterToSession(session.id);
                              }}
                              title="S'inscrire"
                            >
                              <MdPersonAdd style={{ fontSize: '22px' }} />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                    <div style={styles.sessionContent}>
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
                  </div>
                  </div>
                  
                  {/* Boutons pour Admin/Coach */}
                  {(user?.role === 'ADMIN' || user?.role === 'COACH') && (
                    <div style={styles.cardActions}>
                      <button
                        style={styles.actionButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenModal(session);
                        }}
                      >
                        <MdEdit style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Modifier
                      </button>
                      <button
                        style={{ ...styles.actionButton, color: '#ef4444' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(session.id);
                        }}
                      >
                      <MdDelete style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Supprimer
                    </button>
                  </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedSession ? 'Modifier la séance' : 'Nouvelle séance'}
      >
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="modal-form-group">
            <label className="modal-form-label">
              <MdEventNote size={18} />
              Titre
            </label>
            <input
              className="modal-form-input"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ex: Entraînement technique"
              required
            />
          </div>
          <div className="modal-form-group">
            <label className="modal-form-label">
              <MdSportsScore size={18} />
              Type
            </label>
            <select
              className="modal-form-select"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              required
            >
              <option value="">Sélectionner un type</option>
              {sessionTypeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="modal-form-group">
            <label className="modal-form-label">
              <MdLocationOn size={18} />
              Lieu
            </label>
            <input
              className="modal-form-input"
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Ex: Stade municipal"
              required
            />
          </div>
          <div className="modal-form-group">
            <label className="modal-form-label">
              <MdSchedule size={18} />
              Début
            </label>
            <input
              className="modal-form-input"
              type="datetime-local"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              required
            />
          </div>
          <div className="modal-form-group">
            <label className="modal-form-label">
              <MdSchedule size={18} />
              Fin
            </label>
            <input
              className="modal-form-input"
              type="datetime-local"
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              required
            />
          </div>
          <div className="modal-form-group">
            <label className="modal-form-label">
              Coach
            </label>
            <select
              className="modal-form-select"
              value={formData.coachId}
              onChange={(e) => setFormData({ ...formData, coachId: e.target.value })}
            >
              <option value="">Sélectionner un coach</option>
              {coaches.map(c => (
                <option key={c.id} value={c.id}>
                  {c.firstName} {c.lastName}
                </option>
              ))}
            </select>
          </div>
          <div className="modal-form-group">
            <label className="modal-form-label">
              <MdImage size={18} />
              Image de la séance
            </label>
            <div style={{
              border: '2px dashed #d1d5db',
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'center',
              backgroundColor: '#fafafa',
              transition: 'all 0.2s',
              cursor: 'pointer',
              position: 'relative',
            }}
            onClick={() => document.getElementById('session-image-input')?.click()}
            >
              {imagePreview ? (
                <div style={{ position: 'relative' }}>
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    style={{ 
                      maxWidth: '100%', 
                      maxHeight: '300px', 
                      borderRadius: '8px',
                      objectFit: 'cover'
                    }} 
                  />
                  <div style={{
                    marginTop: '12px',
                    fontSize: '14px',
                    color: '#667eea',
                    fontWeight: '600'
                  }}>
                    Cliquer pour changer l'image
                  </div>
                </div>
              ) : (
                <div style={{ padding: '40px 20px' }}>
                  <MdImage size={48} color="#d1d5db" style={{ marginBottom: '12px' }} />
                  <div style={{ fontSize: '16px', color: '#6b7280', marginBottom: '8px', fontWeight: '600' }}>
                    Cliquer pour ajouter une image
                  </div>
                  <div style={{ fontSize: '13px', color: '#9ca3af' }}>
                    ou glisser-déposer (JPEG, PNG, GIF, WebP - Max 10MB)
                  </div>
                </div>
              )}
              <input
                id="session-image-input"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
            </div>
          </div>
          <div className="modal-form-group">
            <label className="modal-form-label">
              Description
            </label>
            <textarea
              className="modal-form-textarea"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Détails de la séance..."
              rows={4}
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
              {selectedSession ? 'Mettre à jour' : 'Créer la séance'}
            </button>
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
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '20px',
  },
  sessionCard: {
    border: '2px solid #f0f0f0',
    borderRadius: '12px',
    transition: 'all 0.2s',
    overflow: 'visible',
  },
  sessionImage: {
    width: '100%',
    height: '200px',
    overflow: 'visible',
    backgroundColor: '#f5f5f5',
    position: 'relative' as const,
    borderRadius: '12px 12px 0 0',
  },
  imageOverlay: {
    position: 'absolute' as const,
    bottom: '-30px',
    right: '8px',
    zIndex: 10,
  },
  bubbleButton: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    border: '3px solid #667eea',
    background: 'white',
    color: '#667eea',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    transition: 'all 0.3s ease',
    fontSize: '24px',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '12px 12px 0 0',
  },
  sessionContent: {
    padding: '20px',
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
    padding: '0 20px 20px',
  },
  actionButton: {
    flex: 1,
    padding: '10px',
    background: 'transparent',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#667eea',
    fontWeight: '600',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerButton: {
    flex: 1,
    padding: '14px 20px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '15px',
    color: 'white',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
  },
  modalActions: {
    display: 'flex',
    gap: '12px',
    marginTop: '24px',
  },
};

export default Sessions;
