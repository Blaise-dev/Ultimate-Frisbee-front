import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import { sessionService } from '../services/session.service';
import { Session } from '../types';
import { MdArrowBack, MdEventNote, MdLocationOn, MdSchedule, MdSportsScore, MdPeople } from 'react-icons/md';

const SessionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      if (!id) return;
      try {
        const data = await sessionService.getSessionById(id);
        setSession(data);
      } catch (error) {
        console.error('Erreur lors du chargement:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [id]);

  if (loading) {
    return (
      <MainLayout>
        <div style={styles.loading}>Chargement...</div>
      </MainLayout>
    );
  }

  if (!session) {
    return (
      <MainLayout>
        <div style={styles.error}>Séance non trouvée</div>
      </MainLayout>
    );
  }

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

  return (
    <MainLayout>
      <div style={styles.header}>
        <Button onClick={() => navigate('/sessions')} variant="secondary">
          <MdArrowBack style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Retour
        </Button>
      </div>

      <Card>
        <div style={styles.profileHeader}>
          <div style={styles.avatar}>
            <MdEventNote style={{ fontSize: '36px' }} />
          </div>
          <div style={styles.profileInfo}>
            <h1 style={styles.name}>{session.title}</h1>
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
        </div>

        {session.description && (
          <div style={styles.descriptionSection}>
            <p style={styles.description}>{session.description}</p>
          </div>
        )}

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Informations</h2>
          <div style={styles.infoGrid}>
            <div style={styles.infoItem}>
              <MdSchedule style={styles.infoIcon} />
              <div>
                <div style={styles.infoLabel}>Début</div>
                <div style={styles.infoValue}>{formatDate(session.startTime)}</div>
              </div>
            </div>
            <div style={styles.infoItem}>
              <MdSchedule style={styles.infoIcon} />
              <div>
                <div style={styles.infoLabel}>Fin</div>
                <div style={styles.infoValue}>{formatDate(session.endTime)}</div>
              </div>
            </div>
            {session.location && (
              <div style={styles.infoItem}>
                <MdLocationOn style={styles.infoIcon} />
                <div>
                  <div style={styles.infoLabel}>Lieu</div>
                  <div style={styles.infoValue}>{session.location}</div>
                </div>
              </div>
            )}
            {(session as any).coach && (
              <div 
                style={styles.infoItem}
                onClick={() => navigate(`/coaches/${(session as any).coach.id}`)}
              >
                <MdSportsScore style={styles.infoIcon} />
                <div>
                  <div style={styles.infoLabel}>Coach</div>
                  <div style={styles.infoValue}>
                    {(session as any).coach.firstName} {(session as any).coach.lastName}
                  </div>
                </div>
              </div>
            )}
            {(session as any).athletes && (
              <div style={styles.infoItem}>
                <MdPeople style={styles.infoIcon} />
                <div>
                  <div style={styles.infoLabel}>Participants</div>
                  <div style={styles.infoValue}>{(session as any).athletes.length} athlètes</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {(session as any).activities && (session as any).activities.length > 0 && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Activités ({(session as any).activities.length})</h2>
            <div style={styles.activitiesList}>
              {(session as any).activities.map((activity: any) => (
                <div key={activity.id} style={styles.activityItem}>
                  <div style={styles.activityHeader}>
                    <div style={styles.activityName}>{activity.name}</div>
                    <span style={styles.activityBadge}>{activity.theme}</span>
                  </div>
                  {activity.description && (
                    <div style={styles.activityDescription}>{activity.description}</div>
                  )}
                  <div style={styles.activityDuration}>Durée: {activity.duration} min</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {(session as any).athletes && (session as any).athletes.length > 0 && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Participants ({(session as any).athletes.length})</h2>
            <div style={styles.athletesList}>
              {(session as any).athletes.map((athleteSession: any) => {
                const athlete = athleteSession.athlete || athleteSession;
                return (
                  <div 
                    key={athlete.id} 
                    style={styles.athleteItem}
                    onClick={() => navigate(`/athletes/${athlete.id}`)}
                  >
                    <div style={styles.athleteAvatar}>
                      {athlete.firstName[0]}{athlete.lastName[0]}
                    </div>
                    <div>
                      <div style={styles.athleteName}>
                        {athlete.firstName} {athlete.lastName}
                      </div>
                      <div style={styles.athleteLevel}>
                        {athlete.category} · {athlete.level}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Card>
    </MainLayout>
  );
};

const styles: Record<string, React.CSSProperties> = {
  header: {
    marginBottom: '24px',
  },
  loading: {
    textAlign: 'center',
    padding: '48px',
    color: '#6b7280',
  },
  error: {
    textAlign: 'center',
    padding: '48px',
    color: '#ef4444',
  },
  profileHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    paddingBottom: '24px',
    borderBottom: '1px solid #e5e7eb',
    marginBottom: '24px',
  },
  avatar: {
    width: '80px',
    height: '80px',
    borderRadius: '16px',
    background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1f2937',
    margin: '0 0 12px 0',
  },
  badge: {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '16px',
    fontSize: '13px',
    fontWeight: '600',
  },
  descriptionSection: {
    marginBottom: '24px',
    padding: '16px',
    background: '#f9fafb',
    borderRadius: '8px',
  },
  description: {
    margin: 0,
    color: '#4b5563',
    lineHeight: '1.6',
  },
  section: {
    marginBottom: '32px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '16px',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '16px',
  },
  infoItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '16px',
    background: '#f9fafb',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  infoIcon: {
    fontSize: '20px',
    color: '#4f9eff',
    marginTop: '2px',
  },
  infoLabel: {
    fontSize: '13px',
    color: '#6b7280',
    marginBottom: '4px',
  },
  infoValue: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#1f2937',
  },
  activitiesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  activityItem: {
    padding: '16px',
    background: '#f9fafb',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
  },
  activityHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  activityName: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1f2937',
  },
  activityBadge: {
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
    background: '#e0f2fe',
    color: '#0369a1',
  },
  activityDescription: {
    fontSize: '14px',
    color: '#6b7280',
    marginBottom: '8px',
  },
  activityDuration: {
    fontSize: '13px',
    color: '#9ca3af',
  },
  athletesList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '12px',
  },
  athleteItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    background: '#f9fafb',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  athleteAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: '600',
  },
  athleteName: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '2px',
  },
  athleteLevel: {
    fontSize: '13px',
    color: '#6b7280',
  },
};

export default SessionDetail;
