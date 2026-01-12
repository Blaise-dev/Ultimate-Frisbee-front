import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import { coachService } from '../services/coach.service';
import { Coach } from '../types';
import { MdArrowBack, MdPerson, MdEmail, MdCalendarToday } from 'react-icons/md';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const CoachDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [coach, setCoach] = useState<Coach | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCoach = async () => {
      if (!id) {
        setLoading(false);
        return;
      }
      try {
        const data = await coachService.getCoachById(id);
        setCoach(data);
      } catch (error) {
        console.error('Erreur lors du chargement:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCoach();
  }, [id]);

  if (loading) {
    return (
      <MainLayout>
        <div style={styles.loading}>Chargement...</div>
      </MainLayout>
    );
  }

  if (!coach) {
    return (
      <MainLayout>
        <div style={styles.error}>Coach non trouvé</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div style={styles.header}>
        <Button onClick={() => navigate('/coaches')} variant="secondary">
          <MdArrowBack style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Retour
        </Button>
      </div>

      <Card>
        <div style={styles.profileHeader}>
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
          <div style={styles.profileInfo}>
            <h1 style={styles.name}>{coach.firstName} {coach.lastName}</h1>
            <div style={styles.badge}>Entraîneur</div>
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Informations</h2>
          <div style={styles.infoGrid}>
            <div style={styles.infoItem}>
              <MdEmail style={styles.infoIcon} />
              <div>
                <div style={styles.infoLabel}>Email</div>
                <div style={styles.infoValue}>{(coach as any).user?.email || 'Non renseigné'}</div>
              </div>
            </div>
            {(coach as any).specialization && (
              <div style={styles.infoItem}>
                <MdPerson style={styles.infoIcon} />
                <div>
                  <div style={styles.infoLabel}>Spécialisation</div>
                  <div style={styles.infoValue}>{(coach as any).specialization}</div>
                </div>
              </div>
            )}
            {(coach as any).experienceYears && (
              <div style={styles.infoItem}>
                <MdCalendarToday style={styles.infoIcon} />
                <div>
                  <div style={styles.infoLabel}>Expérience</div>
                  <div style={styles.infoValue}>{(coach as any).experienceYears} ans</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {(coach as any).groups && (coach as any).groups.length > 0 && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Groupes supervisés ({(coach as any).groups.length})</h2>
            <div style={styles.groupsList}>
              {(coach as any).groups.map((group: any) => (
                <div 
                  key={group.id} 
                  style={styles.groupItem}
                  onClick={() => navigate(`/groups/${group.id}`)}
                >
                  <div style={styles.groupName}>{group.name}</div>
                  <div style={styles.groupType}>{group.type}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {(coach as any).sessions && (coach as any).sessions.length > 0 && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Séances ({(coach as any).sessions.length})</h2>
            <div style={styles.sessionsList}>
              {(coach as any).sessions.map((session: any) => (
                <div 
                  key={session.id} 
                  style={styles.sessionItem}
                  onClick={() => navigate(`/sessions/${session.id}`)}
                >
                  <div style={styles.sessionTitle}>{session.title}</div>
                  <div style={styles.sessionDate}>
                    {new Date(session.startTime).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </div>
                </div>
              ))}
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
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '28px',
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
    background: '#fef3c7',
    color: '#d97706',
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
  groupsList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '12px',
  },
  groupItem: {
    padding: '16px',
    background: '#f9fafb',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  groupName: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '4px',
  },
  groupType: {
    fontSize: '13px',
    color: '#6b7280',
  },
  sessionsList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '12px',
  },
  sessionItem: {
    padding: '16px',
    background: '#f9fafb',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  sessionTitle: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '4px',
  },
  sessionDate: {
    fontSize: '13px',
    color: '#6b7280',
  },
};

export default CoachDetail;
