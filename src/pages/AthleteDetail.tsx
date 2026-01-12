import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import { athleteService } from '../services/athlete.service';
import { Athlete } from '../types';
import { MdArrowBack, MdEmail, MdCategory, MdTrendingUp } from 'react-icons/md';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const AthleteDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [athlete, setAthlete] = useState<Athlete | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAthlete = async () => {
      if (!id) return;
      try {
        const data = await athleteService.getAthleteById(id);
        setAthlete(data);
      } catch (error) {
        console.error('Erreur lors du chargement:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAthlete();
  }, [id]);

  if (loading) {
    return (
      <MainLayout>
        <div style={styles.loading}>Chargement...</div>
      </MainLayout>
    );
  }

  if (!athlete) {
    return (
      <MainLayout>
        <div style={styles.error}>Athlète non trouvé</div>
      </MainLayout>
    );
  }

  const categoryLabels: Record<string, string> = {
    JUNIOR: 'Junior',
    SENIOR: 'Senior',
    VETERAN: 'Vétéran',
  };

  const levelLabels: Record<string, string> = {
    BEGINNER: 'Débutant',
    INTERMEDIATE: 'Intermédiaire',
    ADVANCED: 'Avancé',
    EXPERT: 'Expert',
  };

  return (
    <MainLayout>
      <div style={styles.header}>
        <Button onClick={() => navigate(-1)} variant="secondary">
          <MdArrowBack style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Retour
        </Button>
      </div>

      {/* Image de l'athlète en haut */}
      <div style={styles.imageContainer}>
        <img 
          src={athlete.profilePicture 
            ? `${API_URL.replace('/api', '')}${athlete.profilePicture}`
            : `https://ui-avatars.com/api/?name=${athlete.firstName}+${athlete.lastName}&size=1200&background=10b981&color=fff&bold=true`
          }
          alt={`${athlete.firstName} ${athlete.lastName}`}
          style={styles.image}
          onError={(e) => {
            const img = e.target as HTMLImageElement;
            img.src = `https://ui-avatars.com/api/?name=${athlete.firstName}+${athlete.lastName}&size=1200&background=10b981&color=fff&bold=true`;
          }}
        />
        <div style={styles.imageOverlay}></div>
        <div style={styles.imageContent}>
          <h1 style={styles.imageTitle}>{athlete.firstName} {athlete.lastName}</h1>
          <div style={styles.imageBadges}>
            <span style={styles.imageBadge}>
              {categoryLabels[athlete.category] || athlete.category}
            </span>
            <span style={{ ...styles.imageBadge, background: 'rgba(224, 242, 254, 0.95)', color: '#0369a1' }}>
              {levelLabels[athlete.level] || athlete.level}
            </span>
          </div>
        </div>
      </div>

      <Card>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Informations</h2>
          <div style={styles.infoGrid}>
            <div style={styles.infoItem}>
              <MdEmail style={styles.infoIcon} />
              <div>
                <div style={styles.infoLabel}>Email</div>
                <div style={styles.infoValue}>{(athlete as any).user?.email || 'Non renseigné'}</div>
              </div>
            </div>
            <div style={styles.infoItem}>
              <MdCategory style={styles.infoIcon} />
              <div>
                <div style={styles.infoLabel}>Catégorie</div>
                <div style={styles.infoValue}>{categoryLabels[athlete.category] || athlete.category}</div>
              </div>
            </div>
            <div style={styles.infoItem}>
              <MdTrendingUp style={styles.infoIcon} />
              <div>
                <div style={styles.infoLabel}>Niveau</div>
                <div style={styles.infoValue}>{levelLabels[athlete.level] || athlete.level}</div>
              </div>
            </div>
          </div>
        </div>

        {(athlete as any).groups && (athlete as any).groups.length > 0 && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Groupes ({(athlete as any).groups.length})</h2>
            <div style={styles.groupsList}>
              {(athlete as any).groups.map((athleteGroup: any) => {
                const group = athleteGroup.group || athleteGroup;
                return (
                  <div 
                    key={group.id} 
                    style={styles.groupItem}
                    onClick={() => navigate(`/groups/${group.id}`)}
                  >
                    <div style={styles.groupName}>{group.name}</div>
                    <div style={styles.groupType}>{group.type}</div>
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
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
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
    margin: '0 0 16px 0',
    textShadow: '0 4px 12px rgba(0,0,0,0.4)',
  },
  imageBadges: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  },
  imageBadge: {
    padding: '10px 24px',
    borderRadius: '24px',
    fontSize: '14px',
    fontWeight: '700',
    background: 'rgba(139, 92, 246, 0.95)',
    color: 'white',
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
  section: {
    marginBottom: '32px',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
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
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  infoValue: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1f2937',
  },
  groupsList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '16px',
  },
  groupItem: {
    padding: '20px',
    background: '#ffffff',
    borderRadius: '12px',
    border: '2px solid #e5e7eb',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  groupName: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '8px',
  },
  groupType: {
    fontSize: '14px',
    color: '#6b7280',
  },
};

export default AthleteDetail;
