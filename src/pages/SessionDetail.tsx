import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import { sessionService } from '../services/session.service';
import { Session } from '../types';
import { MdArrowBack, MdLocationOn, MdSchedule, MdSportsScore, MdPeople } from 'react-icons/md';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

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

  // Debug: afficher les informations de l'image
  const imageSrc = session 
    ? (session.imageUrl 
        ? `${API_URL.replace('/api', '')}${session.imageUrl}`
        : `http://localhost:3000/uploads/sessions/default-${session.type.toLowerCase()}.jpg`)
    : '';
  
  console.log('SessionDetail - Session:', session?.title, 'ImageURL:', session?.imageUrl, 'Final src:', imageSrc);

  return (
    <MainLayout>
      <div style={styles.header}>
        <Button onClick={() => navigate(-1)} variant="secondary">
          <MdArrowBack style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Retour
        </Button>
      </div>

      {/* Image de la séance en haut */}
      <div style={styles.imageContainer}>
        <img 
          src={imageSrc} 
          alt={session.title}
          style={styles.image}
          onError={(e) => {
            // Image de fallback si erreur
            const img = e.target as HTMLImageElement;
            const fallbackSrc = `http://localhost:3000/uploads/sessions/default-${session.type.toLowerCase()}.jpg`;
            console.error('SessionDetail - Image loading error for:', img.src, 'Fallback to:', fallbackSrc);
            img.src = fallbackSrc;
          }}
          onLoad={() => console.log('SessionDetail - Image loaded successfully:', imageSrc)}
        />
        <div style={styles.imageOverlay}></div>
        <div style={styles.imageContent}>
          <span
            style={{
              ...styles.imageBadge,
              background: session.type === 'TRAINING' ? 'rgba(25, 118, 210, 0.95)' : 'rgba(194, 24, 91, 0.95)',
            }}
          >
            {session.type === 'TRAINING' ? 'Entraînement' : 'Match'}
          </span>
          <h1 style={styles.imageTitle}>{session.title}</h1>
          {session.location && (
            <p style={styles.imageSubtitle}>
              <MdLocationOn style={{ verticalAlign: 'middle', marginRight: '6px' }} />
              {session.location}
            </p>
          )}
        </div>
      </div>

      <Card>

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
                    <div style={{
                      ...styles.athleteAvatar,
                      ...(athlete.profilePicture ? styles.avatarImage : {})
                    }}>
                      {athlete.profilePicture ? (
                        <img 
                          src={`${API_URL.replace('/api', '')}${athlete.profilePicture}`} 
                          alt={`${athlete.firstName} ${athlete.lastName}`}
                          style={styles.avatarImg}
                        />
                      ) : (
                        <>{athlete.firstName[0]}{athlete.lastName[0]}</>
                      )}
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
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: '420px',
    marginBottom: '32px',
    borderRadius: '24px',
    overflow: 'hidden',
    boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.6) 100%)',
    zIndex: 1,
  },
  imageContent: {
    position: 'absolute',
    bottom: '32px',
    left: '32px',
    right: '32px',
    zIndex: 2,
  },
  imageTitle: {
    fontSize: '42px',
    fontWeight: '800',
    color: 'white',
    margin: '0 0 12px 0',
    textShadow: '0 4px 12px rgba(0,0,0,0.4)',
  },
  imageSubtitle: {
    fontSize: '18px',
    color: 'rgba(255,255,255,0.95)',
    margin: '0',
    display: 'flex',
    alignItems: 'center',
    textShadow: '0 2px 8px rgba(0,0,0,0.3)',
  },
  imageBadge: {
    display: 'inline-block',
    padding: '10px 24px',
    borderRadius: '24px',
    fontSize: '14px',
    fontWeight: '700',
    color: 'white',
    marginBottom: '16px',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
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
    marginBottom: '24px',
  },
  descriptionSection: {
    marginBottom: '24px',
    padding: '24px',
    background: 'linear-gradient(135deg, #f0fdf4 0%, #f9fafb 100%)',
    borderRadius: '16px',
    border: '2px solid #d1fae5',
  },
  description: {
    margin: 0,
    color: '#374151',
    lineHeight: '1.8',
    fontSize: '15px',
  },
  section: {
    marginBottom: '32px',
  },
  sectionTitle: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px',
  },
  infoItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
    padding: '24px',
    background: 'linear-gradient(135deg, #f9fafb 0%, #ffffff 100%)',
    borderRadius: '16px',
    border: '2px solid #e5e7eb',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  },
  infoIcon: {
    fontSize: '28px',
    color: '#10b981',
    marginTop: '2px',
    flexShrink: 0,
  },
  infoLabel: {
    fontSize: '13px',
    color: '#6b7280',
    marginBottom: '6px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  infoValue: {
    fontSize: '16px',
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
  avatarImage: {
    padding: 0,
    overflow: 'hidden',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  } as React.CSSProperties,
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
