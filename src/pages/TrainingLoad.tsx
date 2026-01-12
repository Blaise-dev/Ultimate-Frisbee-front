import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../styles/TrainingLoad.css';

interface TrainingLoadData {
  athlete: {
    id: string;
    name: string;
  };
  period: {
    startDate: string;
    endDate: string;
    days: number;
    weeks: number;
  };
  summary: {
    totalSessions: number;
    totalHours: number;
    avgSessionsPerWeek: number;
    avgHoursPerWeek: number;
    avgHoursPerSession: number;
  };
  sessionTypeDistribution: Record<string, number>;
  activityDistribution: Array<{
    theme: string;
    count: number;
    totalDuration: number;
    percentage: number;
  }>;
  alerts: Array<{
    level: 'low' | 'high' | 'critical';
    message: string;
  }>;
  weeklyBreakdown: Array<{
    week: string;
    sessions: number;
    hours: number;
  }>;
}

const TrainingLoad: React.FC = () => {
  const { athleteId } = useParams<{ athleteId: string }>();
  const [trainingLoad, setTrainingLoad] = useState<TrainingLoadData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Dates par défaut : dernier mois
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchTrainingLoad();
  }, [athleteId, startDate, endDate]);

  const fetchTrainingLoad = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:3000/api/training-load/athlete/${athleteId}`,
        {
          params: { startDate, endDate },
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setTrainingLoad(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Chargement...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!trainingLoad) return <div className="error">Aucune donnée disponible</div>;

  const getAlertClass = (level: string) => {
    switch (level) {
      case 'low': return 'alert-low';
      case 'high': return 'alert-high';
      case 'critical': return 'alert-critical';
      default: return '';
    }
  };

  return (
    <div className="training-load-container">
      <h1>Analyse de la charge d'entraînement</h1>
      
      <div className="athlete-info">
        <h2>{trainingLoad.athlete.name}</h2>
        <p>
          Période: {trainingLoad.period.startDate} → {trainingLoad.period.endDate}
          ({trainingLoad.period.weeks} semaines)
        </p>
      </div>

      <div className="date-filters">
        <label>
          Date de début:
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </label>
        <label>
          Date de fin:
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </label>
      </div>

      {/* Alertes */}
      {trainingLoad.alerts.length > 0 && (
        <div className="alerts-section">
          <h3>⚠️ Alertes</h3>
          {trainingLoad.alerts.map((alert, index) => (
            <div key={index} className={`alert ${getAlertClass(alert.level)}`}>
              {alert.message}
            </div>
          ))}
        </div>
      )}

      {/* Résumé statistiques */}
      <div className="summary-grid">
        <div className="stat-card">
          <h3>Total séances</h3>
          <p className="stat-value">{trainingLoad.summary.totalSessions}</p>
        </div>
        <div className="stat-card">
          <h3>Total heures</h3>
          <p className="stat-value">{trainingLoad.summary.totalHours}h</p>
        </div>
        <div className="stat-card">
          <h3>Séances/semaine</h3>
          <p className="stat-value">{trainingLoad.summary.avgSessionsPerWeek}</p>
        </div>
        <div className="stat-card">
          <h3>Heures/semaine</h3>
          <p className="stat-value">{trainingLoad.summary.avgHoursPerWeek}h</p>
        </div>
        <div className="stat-card">
          <h3>Heures/séance</h3>
          <p className="stat-value">{trainingLoad.summary.avgHoursPerSession}h</p>
        </div>
      </div>

      {/* Distribution par type de séance */}
      <div className="distribution-section">
        <h3>Distribution par type de séance</h3>
        <div className="distribution-bars">
          {Object.entries(trainingLoad.sessionTypeDistribution).map(([type, count]) => (
            <div key={type} className="distribution-item">
              <span className="distribution-label">{type}</span>
              <div className="distribution-bar-container">
                <div
                  className="distribution-bar"
                  style={{
                    width: `${(count / trainingLoad.summary.totalSessions) * 100}%`,
                  }}
                />
              </div>
              <span className="distribution-value">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Distribution des activités */}
      <div className="distribution-section">
        <h3>Distribution des activités par thème</h3>
        <div className="activity-distribution">
          {trainingLoad.activityDistribution.map((activity) => (
            <div key={activity.theme} className="activity-item">
              <div className="activity-header">
                <span className="activity-theme">{activity.theme}</span>
                <span className="activity-percentage">{activity.percentage.toFixed(1)}%</span>
              </div>
              <div className="activity-details">
                <span>{activity.count} activités</span>
                <span>{activity.totalDuration} min</span>
              </div>
              <div className="activity-bar-container">
                <div
                  className="activity-bar"
                  style={{ width: `${activity.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Évolution hebdomadaire */}
      <div className="weekly-section">
        <h3>Évolution hebdomadaire</h3>
        <div className="weekly-table">
          <table>
            <thead>
              <tr>
                <th>Semaine</th>
                <th>Séances</th>
                <th>Heures</th>
              </tr>
            </thead>
            <tbody>
              {trainingLoad.weeklyBreakdown.map((week, index) => (
                <tr key={index}>
                  <td>{week.week}</td>
                  <td>{week.sessions}</td>
                  <td>{week.hours}h</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TrainingLoad;
