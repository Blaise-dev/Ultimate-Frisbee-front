import React, { useEffect, useState } from 'react';
import MainLayout from '../components/Layout/MainLayout';
import Card from '../components/UI/Card';
import { useAuth } from '../contexts/AuthContext';
import { sessionService } from '../services/session.service';
import { athleteService } from '../services/athlete.service';
import { Session, Athlete } from '../types';
import { MdDashboard, MdEventNote, MdAccessTime, MdPeople, MdLocationOn, MdSchedule, MdGroup } from 'react-icons/md';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [athletes, setAthletes] = useState<Athlete[]>([]);
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
                <div key={session.id} style={styles.card}>
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
                  <div key={athlete.id} style={styles.athleteCard}>
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
};

export default Dashboard;
