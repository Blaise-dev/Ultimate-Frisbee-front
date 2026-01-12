import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MdArrowBack, MdEmojiEvents, MdTrendingUp, MdSportsHandball } from 'react-icons/md';
import { MatchStats as MatchStatsType } from '../types';
import '../styles/MatchStats.css';

const MatchStats: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [matchStats, setMatchStats] = useState<MatchStatsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMatchStats();
  }, [sessionId]);

  const fetchMatchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:3000/api/match-stats/session/${sessionId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMatchStats(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Chargement...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!matchStats) return <div className="error">Aucune donnée disponible</div>;

  const getRankMedal = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const getStatColor = (value: number, type: string) => {
    if (type === 'turnovers') {
      if (value === 0) return '#10b981';
      if (value <= 2) return '#f59e0b';
      return '#ef4444';
    }
    if (value >= 5) return '#10b981';
    if (value >= 3) return '#3b82f6';
    if (value >= 1) return '#f59e0b';
    return '#9ca3af';
  };

  return (
    <div className="match-stats-container">
      <div className="header-actions">
        <button className="back-button" onClick={() => navigate(-1)}>
          <MdArrowBack size={20} />
          <span>Retour</span>
        </button>
      </div>

      <h1>
        <MdEmojiEvents size={32} /> Statistiques du Match
      </h1>

      <div className="match-info">
        <h2>{matchStats.session.title}</h2>
        <div className="match-meta">
          <span>{new Date(matchStats.session.date).toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}</span>
          {matchStats.session.coach && <span>• {matchStats.session.coach}</span>}
          {matchStats.session.sport && <span>• {matchStats.session.sport}</span>}
        </div>
        <div className="match-summary">
          <span><strong>{matchStats.participants}</strong> participants</span>
          <span><strong>{matchStats.activities}</strong> activités</span>
        </div>
      </div>

      <div className="podium-section">
        <h3><MdTrendingUp size={24} /> Top 3 Joueurs</h3>
        <div className="podium">
          {matchStats.stats.slice(0, 3).map((athlete) => (
            <div key={athlete.athleteId} className={`podium-place place-${athlete.rank}`}>
              <div className="podium-rank">{getRankMedal(athlete.rank)}</div>
              <div className="podium-name">{athlete.name}</div>
              <div className="podium-score">{athlete.stats.totalScore} pts</div>
              <div className="podium-badges">
                <span className="badge">{athlete.category}</span>
                <span className="badge">{athlete.level}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rankings-section">
        <h3><MdSportsHandball size={24} /> Classement Complet</h3>
        <div className="rankings-table">
          <div className="table-header">
            <div className="col-rank">Rang</div>
            <div className="col-name">Joueur</div>
            <div className="col-stat">Points</div>
            <div className="col-stat">Passes</div>
            <div className="col-stat">Blocks</div>
            <div className="col-stat">Réceptions</div>
            <div className="col-stat">Pertes</div>
            <div className="col-score">Score Total</div>
          </div>
          {matchStats.stats.map((athlete) => (
            <div key={athlete.athleteId} className={`table-row ${athlete.rank <= 3 ? 'highlight' : ''}`}>
              <div className="col-rank">
                <span className="rank-badge">{getRankMedal(athlete.rank)}</span>
              </div>
              <div className="col-name">
                <div className="player-name">{athlete.name}</div>
                <div className="player-meta">{athlete.category} • {athlete.level}</div>
              </div>
              <div className="col-stat">
                <span style={{ color: getStatColor(athlete.stats.points, 'points') }}>
                  {athlete.stats.points}
                </span>
              </div>
              <div className="col-stat">
                <span style={{ color: getStatColor(athlete.stats.assists, 'assists') }}>
                  {athlete.stats.assists}
                </span>
              </div>
              <div className="col-stat">
                <span style={{ color: getStatColor(athlete.stats.blocks, 'blocks') }}>
                  {athlete.stats.blocks}
                </span>
              </div>
              <div className="col-stat">
                <span style={{ color: getStatColor(athlete.stats.catches, 'catches') }}>
                  {athlete.stats.catches}
                </span>
              </div>
              <div className="col-stat">
                <span style={{ color: getStatColor(athlete.stats.turnovers, 'turnovers') }}>
                  {athlete.stats.turnovers}
                </span>
              </div>
              <div className="col-score">
                <span className="total-score">{athlete.stats.totalScore}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="stats-legend">
        <h4>Calcul du Score Total</h4>
        <p>
          <strong>Points × 3</strong> + <strong>Passes × 2</strong> + <strong>Blocks × 2</strong> + 
          <strong>Réceptions × 1</strong> - <strong>Pertes × 2</strong>
        </p>
      </div>
    </div>
  );
};

export default MatchStats;
