import React, { useEffect, useState } from 'react';
import MainLayout from '../components/Layout/MainLayout';
import Card from '../components/UI/Card';
import { useAuth } from '../contexts/AuthContext';
import { sessionService } from '../services/session.service';
import { athleteService } from '../services/athlete.service';
import { Session, Athlete } from '../types';
import { MdDashboard, MdEventNote, MdAccessTime, MdPeople, MdLocationOn, MdSchedule, MdGroup, MdClose, MdEmail, MdPhone, MdCake } from 'react-icons/md';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [selectedAthlete, setSelectedAthlete] = useState<Athlete | null>(null);
  const [stats, setStats] = useState({
    totalSessions: 0,
    upcomingSessions: 0,
    totalAthletes: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const sessionsData = await sessionService.getAllSessions();
        setSessions(sessionsData);

        const now = new Date();
        const upcoming = sessionsData.filter(s => new Date(s.startTime) > now).length;

        setStats({
          totalSessions: sessionsData.length,
          upcomingSessions: upcoming,
          totalAthletes: 0,
        });

        if (user?.role === 'COACH' || user?.role === 'ADMIN') {
          const athletesData = await athleteService.getAllAthletes();
          setAthletes(athletesData);
          setStats(prev => ({ ...prev, totalAthletes: athletesData.length }));
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

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

  const getSessionTypeLabel = (type: string) => {
    return type === 'TRAINING' ? 'Entraînement' : 'Match';
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
      <h1 style={styles.title}><MdDashboard style={{ verticalAlign: 'middle', marginRight: '8px' }} /> Tableau de bord</h1>
      <p style={styles.subtitle}>
        Bienvenue, {user?.profile?.firstName} {user?.profile?.lastName}
      </p>

      {/* Statistiques */}
      <div style={styles.statsGrid}>
        <div style={{ ...styles.statCard, borderLeft: '4px solid #4f9eff' }}>
          <div style={{ ...styles.statIcon, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <MdEventNote style={{ color: 'white' }} />
          </div>
          <div>
            <div style={styles.statValue}>{stats.totalSessions}</div>
            <div style={styles.statLabel}>Séances totales</div>
          </div>
        </div>
        <div style={{ ...styles.statCard, borderLeft: '4px solid #10b981' }}>
          <div style={{ ...styles.statIcon, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
            <MdAccessTime style={{ color: 'white' }} />
          </div>
          <div>
            <div style={styles.statValue}>{stats.upcomingSessions}</div>
            <div style={styles.statLabel}>Séances à venir</div>
          </div>
        </div>
        {(user?.role === 'COACH' || user?.role === 'ADMIN') && (
          <div style={{ ...styles.statCard, borderLeft: '4px solid #f59e0b' }}>
            <div style={{ ...styles.statIcon, background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
              <MdPeople style={{ color: 'white' }} />
            </div>
            <div>
              <div style={styles.statValue}>{stats.totalAthletes}</div>
              <div style={styles.statLabel}>Athlètes</div>
            </div>
          </div>
        )}
      </div>

      <div style={styles.content}>
        {/* Section Séances */}
        <Card title={<span><MdEventNote style={{ verticalAlign: 'middle', marginRight: '8px' }} /> Prochaines séances</span>}>
          {sessions.length === 0 ? (
            <div style={styles.emptyMessage}>Aucune séance programmée</div>
          ) : (
            <div style={styles.grid}>
              {sessions.slice(0, 6).map((session) => (
                <div 
                  key={session.id} 
                  style={styles.card}
                  onClick={() => setSelectedSession(session)}
                >
                  <div style={styles.cardImage}>
                    <img 
                      src={session.type === 'TRAINING' 
                        ? 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=250&fit=crop' 
                        : 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400&h=250&fit=crop'
                      } 
                      alt={session.title}
                      style={styles.cardImg}
                    />
                    <span style={{
                      ...styles.badge,
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      background: session.type === 'TRAINING' ? '#e3f2fd' : '#fce4ec',
                      color: session.type === 'TRAINING' ? '#1976d2' : '#c2185b',
                    }}>
                      {getSessionTypeLabel(session.type)}
                    </span>
                  </div>
                  <div style={styles.cardBody}>
                    <h3 style={styles.cardTitle}>{session.title}</h3>
                    <p style={styles.cardText}><MdLocationOn style={{ verticalAlign: 'middle', marginRight: '4px' }} /> {session.location || 'Lieu non défini'}</p>
                    <p style={styles.cardText}><MdSchedule style={{ verticalAlign: 'middle', marginRight: '4px' }} /> {formatDate(session.startTime)}</p>
                    <p style={styles.cardText}>
                      <MdGroup style={{ verticalAlign: 'middle', marginRight: '4px' }} /> {(session as any).athletes?.length || 0} athlète(s)
                    </p>
                    {session.description && (
                      <p style={styles.cardDescription}>{session.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Section Athlètes (seulement pour Coach/Admin) */}
        {(user?.role === 'COACH' || user?.role === 'ADMIN') && (
          <Card title={<span><MdPeople style={{ verticalAlign: 'middle', marginRight: '8px' }} /> Athlètes récents</span>}>
            {athletes.length === 0 ? (
              <div style={styles.emptyMessage}>Aucun athlète enregistré</div>
            ) : (
              <div style={styles.athleteGrid}>
                {athletes.slice(0, 6).map((athlete) => (
                  <div 
                    key={athlete.id} 
                    style={styles.athleteCard}
                    onClick={() => setSelectedAthlete(athlete)}
                  >
                    <div style={styles.athleteCardImage}>
                      <img 
                        src={`https://ui-avatars.com/api/?name=${athlete.firstName}+${athlete.lastName}&size=400&background=10b981&color=fff&bold=true`}
                        alt={`${athlete.firstName} ${athlete.lastName}`}
                        style={styles.athleteImg}
                      />
                    </div>
                    <div style={styles.athleteCardBody}>
                      <h4 style={styles.athleteName}>
                        {athlete.firstName} {athlete.lastName}
                      </h4>
                      <p style={styles.athleteInfo}>
                        {athlete.category} • {athlete.level}
                      </p>
                      {athlete.groups && athlete.groups.length > 0 && (
                        <p style={styles.athleteGroups}>
                          <MdGroup style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                          {athlete.groups.map((ag: any) => ag.group.name).join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}
      </div>

      {/* Modal Détails Séance */}
      {selectedSession && (
        <div style={styles.modalOverlay} onClick={() => setSelectedSession(null)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button style={styles.closeButton} onClick={() => setSelectedSession(null)}>
              <MdClose style={{ fontSize: '24px' }} />
            </button>
            <div style={styles.modalImageContainer}>
              <img 
                src={selectedSession.type === 'TRAINING' 
                  ? 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&h=400&fit=crop' 
                  : 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=600&h=400&fit=crop'
                } 
                alt={selectedSession.title}
                style={styles.modalImage}
              />
              <span style={{
                ...styles.badge,
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: selectedSession.type === 'TRAINING' ? '#e3f2fd' : '#fce4ec',
                color: selectedSession.type === 'TRAINING' ? '#1976d2' : '#c2185b',
              }}>
                {getSessionTypeLabel(selectedSession.type)}
              </span>
            </div>
            <div style={styles.modalBody}>
              <h2 style={styles.modalTitle}>{selectedSession.title}</h2>
              <div style={styles.modalDetails}>
                <p style={styles.modalDetailItem}>
                  <MdLocationOn style={styles.modalIcon} />
                  <strong>Lieu:</strong> {selectedSession.location || 'Non défini'}
                </p>
                <p style={styles.modalDetailItem}>
                  <MdSchedule style={styles.modalIcon} />
                  <strong>Date:</strong> {formatDate(selectedSession.startTime)}
                </p>
                <p style={styles.modalDetailItem}>
                  <MdAccessTime style={styles.modalIcon} />
                  <strong>Durée:</strong> {selectedSession.duration} minutes
                </p>
                <p style={styles.modalDetailItem}>
                  <MdGroup style={styles.modalIcon} />
                  <strong>Participants:</strong> {(selectedSession as any).athletes?.length || 0} athlète(s)
                </p>
                {selectedSession.description && (
                  <div style={styles.modalDescription}>
                    <strong>Description:</strong>
                    <p>{selectedSession.description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Détails Athlète */}
      {selectedAthlete && (
        <div style={styles.modalOverlay} onClick={() => setSelectedAthlete(null)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button style={styles.closeButton} onClick={() => setSelectedAthlete(null)}>
              <MdClose style={{ fontSize: '24px' }} />
            </button>
            <div style={styles.modalImageContainer}>
              <img 
                src={`https://ui-avatars.com/api/?name=${selectedAthlete.firstName}+${selectedAthlete.lastName}&size=600&background=10b981&color=fff&bold=true`}
                alt={`${selectedAthlete.firstName} ${selectedAthlete.lastName}`}
                style={styles.modalImage}
              />
            </div>
            <div style={styles.modalBody}>
              <h2 style={styles.modalTitle}>
                {selectedAthlete.firstName} {selectedAthlete.lastName}
              </h2>
              <div style={styles.modalDetails}>
                <p style={styles.modalDetailItem}>
                  <MdPeople style={styles.modalIcon} />
                  <strong>Catégorie:</strong> {selectedAthlete.category}
                </p>
                <p style={styles.modalDetailItem}>
                  <MdDashboard style={styles.modalIcon} />
                  <strong>Niveau:</strong> {selectedAthlete.level}
                </p>
                {selectedAthlete.email && (
                  <p style={styles.modalDetailItem}>
                    <MdEmail style={styles.modalIcon} />
                    <strong>Email:</strong> {selectedAthlete.email}
                  </p>
                )}
                {selectedAthlete.phone && (
                  <p style={styles.modalDetailItem}>
                    <MdPhone style={styles.modalIcon} />
                    <strong>Téléphone:</strong> {selectedAthlete.phone}
                  </p>
                )}
                {selectedAthlete.dateOfBirth && (
                  <p style={styles.modalDetailItem}>
                    <MdCake style={styles.modalIcon} />
                    <strong>Date de naissance:</strong> {new Date(selectedAthlete.dateOfBirth).toLocaleDateString('fr-FR')}
                  </p>
                )}
                {selectedAthlete.groups && selectedAthlete.groups.length > 0 && (
                  <div style={styles.modalDescription}>
                    <p style={styles.modalDetailItem}>
                      <MdGroup style={styles.modalIcon} />
                      <strong>Groupes:</strong>
                    </p>
                    <ul style={styles.groupsList}>
                      {selectedAthlete.groups.map((ag: any) => (
                        <li key={ag.group.id}>{ag.group.name}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

const styles: Record<string, React.CSSProperties> = {
  title: {
    margin: '0 0 8px 0',
    fontSize: '28px',
    fontWeight: '700',
    color: '#333',
  },
  subtitle: {
    margin: '0 0 24px 0',
    fontSize: '16px',
    color: '#666',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '32px',
  },
  statCard: {
    background: 'white',
    padding: '24px',
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    transition: 'all 0.3s ease',
  },
  statIcon: {
    fontSize: '28px',
    width: '64px',
    height: '64px',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
  statValue: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#1a1f36',
    lineHeight: '1',
  },
  statLabel: {
    fontSize: '14px',
    color: '#6b7280',
    marginTop: '8px',
    fontWeight: '500',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '20px',
  },
  card: {
    border: '2px solid #e5e7eb',
    borderRadius: '16px',
    transition: 'all 0.3s ease',
    background: 'white',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    cursor: 'pointer',
  },
  cardImage: {
    position: 'relative',
    width: '100%',
    height: '200px',
    overflow: 'hidden',
  },
  cardImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  cardBody: {
    padding: '20px',
  },
  cardHeader: {
    marginBottom: '12px',
  },
  badge: {
    padding: '6px 16px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '600',
    display: 'inline-block',
  },
  cardTitle: {
    fontSize: '19px',
    fontWeight: '700',
    margin: '0 0 16px 0',
    color: '#1a1f36',
  },
  cardText: {
    margin: '10px 0',
    fontSize: '14px',
    color: '#6b7280',
    display: 'flex',
    alignItems: 'center',
  },
  cardDescription: {
    marginTop: '12px',
    fontSize: '14px',
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  athleteGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '20px',
  },
  athleteCard: {
    border: '2px solid #e5e7eb',
    borderRadius: '16px',
    transition: 'all 0.3s ease',
    background: 'white',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    cursor: 'pointer',
  },
  athleteCardImage: {
    width: '100%',
    height: '180px',
    overflow: 'hidden',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  },
  athleteImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  athleteCardBody: {
    padding: '20px',
  },
  athleteAvatar: {
    width: '56px',
    height: '56px',
    borderRadius: '14px',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    fontWeight: '700',
    flexShrink: 0,
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
  },
  athleteName: {
    margin: '0 0 8px 0',
    fontSize: '17px',
    fontWeight: '700',
    color: '#1a1f36',
  },
  athleteInfo: {
    margin: '0 0 8px 0',
    fontSize: '14px',
    color: '#6b7280',
  },
  athleteGroups: {
    margin: '0',
    fontSize: '13px',
    color: '#10b981',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    fontSize: '18px',
    color: '#999',
  },
  emptyMessage: {
    padding: '40px',
    textAlign: 'center',
    color: '#999',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  modalContent: {
    background: 'white',
    borderRadius: '20px',
    maxWidth: '700px',
    width: '100%',
    maxHeight: '90vh',
    overflow: 'auto',
    position: 'relative',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  closeButton: {
    position: 'absolute',
    top: '16px',
    left: '16px',
    background: 'rgba(255, 255, 255, 0.95)',
    border: 'none',
    borderRadius: '50%',
    width: '44px',
    height: '44px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    zIndex: 10,
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
    transition: 'all 0.2s ease',
    color: '#374151',
  },
  modalImageContainer: {
    position: 'relative',
    width: '100%',
    height: '350px',
    overflow: 'hidden',
    borderRadius: '20px 20px 0 0',
  },
  modalImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  modalBody: {
    padding: '32px',
  },
  modalTitle: {
    margin: '0 0 24px 0',
    fontSize: '28px',
    fontWeight: '700',
    color: '#1a1f36',
  },
  modalDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  modalDetailItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '16px',
    color: '#374151',
    margin: '0',
  },
  modalIcon: {
    fontSize: '24px',
    color: '#10b981',
    flexShrink: 0,
  },
  modalDescription: {
    marginTop: '8px',
    padding: '20px',
    background: '#f9fafb',
    borderRadius: '12px',
    fontSize: '15px',
    color: '#4b5563',
    lineHeight: '1.6',
  },
  groupsList: {
    listStyle: 'none',
    padding: '12px 0 0 0',
    margin: '0',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
};

export default Dashboard;
