import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import { athleteService } from '../services/athlete.service';
import { Athlete } from '../types';
import { MdArrowBack, MdEmail, MdCategory, MdTrendingUp } from 'react-icons/md';

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
        <Button onClick={() => navigate('/athletes')} variant="secondary">
          <MdArrowBack style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Retour
        </Button>
      </div>

      {/* Image de l'athlète en haut */}
      <div style={styles.imageContainer}>
        <img 
          src={`https://ui-avatars.com/api/?name=${athlete.firstName}+${athlete.lastName}&size=1200&background=10b981&color=fff&bold=true`}
          alt={`${athlete.firstName} ${athlete.lastName}`}
          style={styles.image}
        />
        <div style={styles.imageBadges}>
          <span style={styles.imageBadge}>
            {categoryLabels[athlete.category] || athlete.category}
          </span>
          <span style={{ ...styles.imageBadge, background: '#e0f2fe', color: '#0369a1' }}>
            {levelLabels[athlete.level] || athlete.level}
          </span>
        </div>
      </div>

      <Card>
        <div style={styles.profileHeader}>
          <h1 style={styles.name}>{athlete.firstName} {athlete.lastName}</h1>
        </div>

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
    height: '350px',
    marginBottom: '24px',
    borderRadius: '20px',
    overflow: 'hidden',
    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  imageBadges: {
    position: 'absolute',
    bottom: '20px',
    right: '20px',
    display: 'flex',
    gap: '12px',
  },
  imageBadge: {
    padding: '10px 24px',
    borderRadius: '24px',
    fontSize: '15px',
    fontWeight: '600',
    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    color: 'white',
    boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
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
    paddingBottom: '24px',
    borderBottom: '1px solid #e5e7eb',
    marginBottom: '24px',
  },
  name: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#1f2937',
    margin: '0',
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
    padding: '20px',
    background: '#ffffff',
    borderRadius: '12px',
    border: '2px solid #f3f4f6',
    transition: 'all 0.3s ease',
  },
  infoIcon: {
    fontSize: '24px',
    color: '#4f9eff',
    marginTop: '2px',
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
