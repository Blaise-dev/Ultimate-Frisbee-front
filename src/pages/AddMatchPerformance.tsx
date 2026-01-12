import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import { sessionService } from '../services/session.service';
import { Session } from '../types';
import { MdArrowBack, MdSave, MdSportsScore } from 'react-icons/md';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface AthletePerformance {
  athleteId: string;
  athleteName: string;
  points: number;
  assists: number;
  blocks: number;
  catches: number;
  turnovers: number;
}

const AddMatchPerformance: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [performances, setPerformances] = useState<AthletePerformance[]>([]);
  const [activityId, setActivityId] = useState<string>('');

  useEffect(() => {
    fetchSession();
  }, [sessionId]);

  const fetchSession = async () => {
    if (!sessionId) return;
    try {
      const data = await sessionService.getSessionById(sessionId);
      setSession(data);
      
      // Trouver l'activité principale du match
      const matchActivity = (data as any).activities?.find((a: any) => 
        a.name.toLowerCase().includes('match') || a.theme === 'MATCH'
      ) || (data as any).activities?.[0];
      
      if (matchActivity) {
        setActivityId(matchActivity.id);
      }

      // Initialiser les performances pour chaque athlète
      const athletes = (data as any).athletes || [];
      const initialPerformances: AthletePerformance[] = athletes.map((athleteSession: any) => {
        const athlete = athleteSession.athlete || athleteSession;
        return {
          athleteId: athlete.id,
          athleteName: `${athlete.firstName} ${athlete.lastName}`,
          points: 0,
          assists: 0,
          blocks: 0,
          catches: 0,
          turnovers: 0,
        };
      });
      setPerformances(initialPerformances);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePerformance = (athleteId: string, field: keyof AthletePerformance, value: number) => {
    setPerformances(prev => prev.map(p => 
      p.athleteId === athleteId ? { ...p, [field]: value } : p
    ));
  };

  const calculateScore = (perf: AthletePerformance): number => {
    return (perf.points * 3) + (perf.assists * 2) + (perf.blocks * 2) + perf.catches - (perf.turnovers * 2);
  };

  const handleSave = async () => {
    if (!activityId) {
      alert('Aucune activité de match trouvée pour cette session');
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      
      // Sauvegarder chaque performance
      for (const perf of performances) {
        // Supprimer les anciennes performances
        // (on pourrait ajouter un endpoint DELETE, mais pour simplifier on les écrase)
        
        const stats = [
          { dataType: 'points', value: perf.points },
          { dataType: 'assists', value: perf.assists },
          { dataType: 'blocks', value: perf.blocks },
          { dataType: 'catches', value: perf.catches },
          { dataType: 'turnovers', value: perf.turnovers },
        ];

        for (const stat of stats) {
          await axios.post(
            `${API_URL}/activities/performance`,
            {
              activityId,
              athleteId: perf.athleteId,
              dataType: stat.dataType,
              value: stat.value,
            },
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );
        }
      }

      alert('Performances enregistrées avec succès !');
      navigate(`/match-stats/${sessionId}`);
    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde des performances');
    } finally {
      setSaving(false);
    }
  };

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
        <div style={styles.error}>Session non trouvée</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div style={styles.header}>
        <Button onClick={() => navigate(-1)} variant="secondary">
          <MdArrowBack style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Retour
        </Button>
        <h1 style={styles.title}>
          <MdSportsScore size={32} /> Saisir les Performances
        </h1>
      </div>

      <Card>
        <div style={styles.sessionInfo}>
          <h2>{session.title}</h2>
          <p style={styles.sessionMeta}>
            {new Date(session.startTime).toLocaleDateString('fr-FR')} • {performances.length} participants
          </p>
        </div>

        <div style={styles.legend}>
          <h3 style={styles.legendTitle}>Barème de notation</h3>
          <div style={styles.legendGrid}>
            <div style={styles.legendItem}>Points: <strong>×3</strong></div>
            <div style={styles.legendItem}>Passes: <strong>×2</strong></div>
            <div style={styles.legendItem}>Blocks: <strong>×2</strong></div>
            <div style={styles.legendItem}>Réceptions: <strong>×1</strong></div>
            <div style={styles.legendItem}>Pertes: <strong>-2</strong></div>
          </div>
        </div>

        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeader}>
                <th style={{...styles.th, ...styles.thName}}>Athlète</th>
                <th style={styles.th}>Points</th>
                <th style={styles.th}>Passes</th>
                <th style={styles.th}>Blocks</th>
                <th style={styles.th}>Réceptions</th>
                <th style={styles.th}>Pertes</th>
                <th style={{...styles.th, ...styles.thScore}}>Score Total</th>
              </tr>
            </thead>
            <tbody>
              {performances.map((perf) => (
                <tr key={perf.athleteId} style={styles.tableRow}>
                  <td style={{...styles.td, ...styles.tdName}}>{perf.athleteName}</td>
                  <td style={styles.td}>
                    <input
                      type="number"
                      min="0"
                      value={perf.points}
                      onChange={(e) => updatePerformance(perf.athleteId, 'points', parseInt(e.target.value) || 0)}
                      style={styles.input}
                    />
                  </td>
                  <td style={styles.td}>
                    <input
                      type="number"
                      min="0"
                      value={perf.assists}
                      onChange={(e) => updatePerformance(perf.athleteId, 'assists', parseInt(e.target.value) || 0)}
                      style={styles.input}
                    />
                  </td>
                  <td style={styles.td}>
                    <input
                      type="number"
                      min="0"
                      value={perf.blocks}
                      onChange={(e) => updatePerformance(perf.athleteId, 'blocks', parseInt(e.target.value) || 0)}
                      style={styles.input}
                    />
                  </td>
                  <td style={styles.td}>
                    <input
                      type="number"
                      min="0"
                      value={perf.catches}
                      onChange={(e) => updatePerformance(perf.athleteId, 'catches', parseInt(e.target.value) || 0)}
                      style={styles.input}
                    />
                  </td>
                  <td style={styles.td}>
                    <input
                      type="number"
                      min="0"
                      value={perf.turnovers}
                      onChange={(e) => updatePerformance(perf.athleteId, 'turnovers', parseInt(e.target.value) || 0)}
                      style={styles.input}
                    />
                  </td>
                  <td style={{...styles.td, ...styles.tdScore}}>
                    <strong>{calculateScore(perf)}</strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={styles.actions}>
          <Button onClick={() => navigate(-1)} variant="secondary" disabled={saving}>
            Annuler
          </Button>
          <Button onClick={handleSave} variant="primary" disabled={saving}>
            <MdSave style={{ verticalAlign: 'middle', marginRight: '4px' }} />
            {saving ? 'Enregistrement...' : 'Enregistrer les Performances'}
          </Button>
        </div>
      </Card>
    </MainLayout>
  );
};

const styles: Record<string, React.CSSProperties> = {
  header: {
    marginBottom: '24px',
  },
  title: {
    fontSize: '32px',
    fontWeight: '800',
    color: '#1f2937',
    margin: '16px 0 0 0',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
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
  sessionInfo: {
    marginBottom: '24px',
    paddingBottom: '24px',
    borderBottom: '2px solid #e5e7eb',
  },
  sessionMeta: {
    color: '#6b7280',
    fontSize: '14px',
    margin: '8px 0 0 0',
  },
  legend: {
    background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
    padding: '20px',
    borderRadius: '12px',
    marginBottom: '24px',
    border: '2px solid #bae6fd',
  },
  legendTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#0c4a6e',
    margin: '0 0 12px 0',
  },
  legendGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '12px',
  },
  legendItem: {
    color: '#0369a1',
    fontSize: '14px',
  },
  tableContainer: {
    overflowX: 'auto',
    marginBottom: '24px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tableHeader: {
    background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
  },
  th: {
    padding: '16px 12px',
    textAlign: 'left',
    color: 'white',
    fontWeight: '700',
    fontSize: '14px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  thName: {
    minWidth: '200px',
  },
  thScore: {
    textAlign: 'center',
    background: '#10b981',
  },
  tableRow: {
    borderBottom: '1px solid #e5e7eb',
    transition: 'background 0.2s',
  },
  td: {
    padding: '16px 12px',
  },
  tdName: {
    fontWeight: '600',
    color: '#1f2937',
  },
  tdScore: {
    textAlign: 'center',
    fontSize: '18px',
    fontWeight: '700',
    color: '#10b981',
  },
  input: {
    width: '70px',
    padding: '8px 12px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    textAlign: 'center',
    transition: 'all 0.2s',
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    paddingTop: '24px',
    borderTop: '2px solid #e5e7eb',
  },
};

export default AddMatchPerformance;
