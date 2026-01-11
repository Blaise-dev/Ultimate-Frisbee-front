import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import { athleteService } from '../services/athlete.service';
import { Athlete } from '../types';
import { MdArrowBack, MdPerson, MdEmail, MdCategory, MdTrendingUp } from 'react-icons/md';

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

      <Card>
        <div style={styles.profileHeader}>
          <div style={styles.avatar}>
            {athlete.firstName[0]}{athlete.lastName[0]}
          </div>
          <div style={styles.profileInfo}>
            <h1 style={styles.name}>{athlete.firstName} {athlete.lastName}</h1>
            <div style={styles.badges}>
              <span style={styles.badge}>
                {categoryLabels[athlete.category] || athlete.category}
              </span>
              <span style={{ ...styles.badge, background: '#e0f2fe', color: '#0369a1' }}>
                {levelLabels[athlete.level] || athlete.level}
              </span>
            </div>
          </div>
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
              {(athlete as any).groups.map((group: any) => (
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
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '28px',
    fontWeight: '600',
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1f2937',
    margin: '0 0 12px 0',
  },
  badges: {
    display: 'flex',
    gap: '8px',
  },
  badge: {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '16px',
    fontSize: '13px',
    fontWeight: '600',
    background: '#f3e8ff',
    color: '#7c3aed',
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
};

export default AthleteDetail;
