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
        <div style={styles.statCard}>
          <div style={styles.statIcon}><MdEventNote /></div>
          <div>
            <div style={styles.statValue}>{stats.totalSessions}</div>
            <div style={styles.statLabel}>Séances totales</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}><MdAccessTime /></div>
          <div>
            <div style={styles.statValue}>{stats.upcomingSessions}</div>
            <div style={styles.statLabel}>Séances à venir</div>
          </div>
        </div>
        {(user?.role === 'COACH' || user?.role === 'ADMIN') && (
          <div style={styles.statCard}>
            <div style={styles.statIcon}><MdPeople /></div>
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
                  <div style={styles.cardHeader}>
                    <span style={{
                      ...styles.badge,
                      background: session.type === 'TRAINING' ? '#e3f2fd' : '#fce4ec',
                      color: session.type === 'TRAINING' ? '#1976d2' : '#c2185b',
                    }}>
                      {getSessionTypeLabel(session.type)}
                    </span>
                  </div>
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
                    <div style={styles.athleteAvatar}>
                      {athlete.firstName[0]}{athlete.lastName[0]}
                    </div>
                    <div>
                      <h4 style={styles.athleteName}>
                        {athlete.firstName} {athlete.lastName}
                      </h4>
                      <p style={styles.athleteInfo}>
                        {athlete.category} • {athlete.level}
                      </p>
                      {athlete.groups && athlete.groups.length > 0 && (
                        <p style={styles.athleteGroups}>
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
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  statIcon: {
    fontSize: '32px',
    width: '60px',
    height: '60px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #4f9eff 0%, #3b7dd6 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ffffff',
  },
  statValue: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#333',
  },
  statLabel: {
    fontSize: '14px',
    color: '#999',
    marginTop: '4px',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '16px',
  },
  card: {
    padding: '16px',
    border: '2px solid #f0f0f0',
    borderRadius: '12px',
  },
  cardHeader: {
    marginBottom: '12px',
  },
  badge: {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
    display: 'inline-block',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: '600',
    margin: '0 0 12px 0',
    color: '#333',
  },
  cardText: {
    margin: '8px 0',
    fontSize: '14px',
    color: '#666',
  },
  cardDescription: {
    marginTop: '12px',
    fontSize: '14px',
    color: '#888',
    fontStyle: 'italic',
  },
  athleteGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '16px',
  },
  athleteCard: {
    padding: '16px',
    border: '2px solid #f0f0f0',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  athleteAvatar: {
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
  athleteName: {
    margin: '0 0 4px 0',
    fontSize: '16px',
    fontWeight: '600',
    color: '#333',
  },
  athleteInfo: {
    margin: '4px 0',
    fontSize: '14px',
    color: '#666',
  },
  athleteGroups: {
    margin: '4px 0',
    fontSize: '12px',
    color: '#999',
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
