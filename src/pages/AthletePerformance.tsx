import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MdArrowBack, MdTrendingUp, MdEmojiEvents, MdShowChart } from 'react-icons/md';
import { AthletePerformanceHistory } from '../types';
import '../styles/AthletePerformance.css';

const AthletePerformance: React.FC = () => {
  const { athleteId } = useParams<{ athleteId: string }>();
  const navigate = useNavigate();
  const [performance, setPerformance] = useState<AthletePerformanceHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dates par défaut : 6 derniers mois
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 6);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchPerformance();
  }, [athleteId, startDate, endDate]);

  const fetchPerformance = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:3000/api/match-stats/athlete/${athleteId}`,
        {
          params: { startDate, endDate },
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setPerformance(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors du chargement des performances');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Chargement...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!performance) return <div className="error">Aucune donnée disponible</div>;

  return (
    <div className="athlete-performance-container">
      <div className="header-actions">
        <button className="back-button" onClick={() => navigate(-1)}>
          <MdArrowBack size={20} />
          <span>Retour</span>
        </button>
      </div>

      <h1>
        <MdShowChart size={32} /> Performances en Compétition
      </h1>

      <div className="athlete-header">
        <h2>{performance.athlete.name}</h2>
        <div className="athlete-badges">
          <span className="badge">{performance.athlete.category}</span>
          <span className="badge">{performance.athlete.level}</span>
        </div>
      </div>

      <div className="date-filters">
        <label>
          Date de début
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </label>
        <label>
          Date de fin
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </label>
      </div>

      <div className="summary-section">
        <div className="summary-card">
          <div className="summary-icon">
            <MdEmojiEvents size={32} />
          </div>
          <div className="summary-content">
            <div className="summary-value">{performance.summary.totalMatches}</div>
            <div className="summary-label">Matchs disputés</div>
          </div>
        </div>
      </div>

      <div className="averages-section">
        <h3><MdTrendingUp size={24} /> Moyennes par Match</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{performance.summary.averages.points.toFixed(1)}</div>
            <div className="stat-label">Points</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{performance.summary.averages.assists.toFixed(1)}</div>
            <div className="stat-label">Passes décisives</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{performance.summary.averages.blocks.toFixed(1)}</div>
            <div className="stat-label">Blocks</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{performance.summary.averages.catches.toFixed(1)}</div>
            <div className="stat-label">Réceptions</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{performance.summary.averages.turnovers.toFixed(1)}</div>
            <div className="stat-label">Pertes</div>
          </div>
          <div className="stat-card highlight">
            <div className="stat-value">{performance.summary.averages.totalScore.toFixed(1)}</div>
            <div className="stat-label">Score Moyen</div>
          </div>
        </div>
      </div>

      {performance.summary.bestMatch && (
        <div className="best-match-section">
          <h3><MdEmojiEvents size={24} /> Meilleure Performance</h3>
          <div className="best-match-card">
            <div className="best-match-header">
              <h4>{performance.summary.bestMatch.title}</h4>
              <p>{new Date(performance.summary.bestMatch.date).toLocaleDateString('fr-FR')}</p>
              {performance.summary.bestMatch.group && <p>{performance.summary.bestMatch.group}</p>}
            </div>
            <div className="best-match-stats">
              <div className="stat-item">
                <span className="stat-number">{performance.summary.bestMatch.stats.points}</span>
                <span className="stat-text">Points</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{performance.summary.bestMatch.stats.assists}</span>
                <span className="stat-text">Passes</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{performance.summary.bestMatch.stats.blocks}</span>
                <span className="stat-text">Blocks</span>
              </div>
              <div className="stat-item highlight">
                <span className="stat-number">{performance.summary.bestMatch.stats.totalScore}</span>
                <span className="stat-text">Score Total</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="history-section">
        <h3>Historique des Matchs</h3>
        {performance.matchHistory.length === 0 ? (
          <p className="no-data">Aucun match sur cette période</p>
        ) : (
          <div className="history-table">
            <div className="table-header">
              <div className="col-date">Date</div>
              <div className="col-match">Match</div>
              <div className="col-stat">Pts</div>
              <div className="col-stat">Pass</div>
              <div className="col-stat">Blk</div>
              <div className="col-stat">Rec</div>
              <div className="col-stat">Per</div>
              <div className="col-score">Score</div>
            </div>
            {performance.matchHistory.map((match) => (
              <div 
                key={match.sessionId} 
                className="table-row"
                onClick={() => navigate(`/match-stats/${match.sessionId}`)}
              >
                <div className="col-date">
                  {new Date(match.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                </div>
                <div className="col-match">
                  <div className="match-title">{match.title}</div>
                  {match.group && <div className="match-group">{match.group}</div>}
                </div>
                <div className="col-stat">{match.stats.points}</div>
                <div className="col-stat">{match.stats.assists}</div>
                <div className="col-stat">{match.stats.blocks}</div>
                <div className="col-stat">{match.stats.catches}</div>
                <div className="col-stat">{match.stats.turnovers}</div>
                <div className="col-score">
                  <span className="score-badge">{match.stats.totalScore}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AthletePerformance;
