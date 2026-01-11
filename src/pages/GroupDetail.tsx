import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import { groupService } from '../services/group.service';
import { Group } from '../types';
import { MdArrowBack, MdGroup, MdPeople, MdSportsMartialArts } from 'react-icons/md';

const GroupDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroup = async () => {
      if (!id) return;
      try {
        const data = await groupService.getGroupById(id);
        setGroup(data);
      } catch (error) {
        console.error('Erreur lors du chargement:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGroup();
  }, [id]);

  if (loading) {
    return (
      <MainLayout>
        <div style={styles.loading}>Chargement...</div>
      </MainLayout>
    );
  }

  if (!group) {
    return (
      <MainLayout>
        <div style={styles.error}>Groupe non trouvé</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div style={styles.header}>
        <Button onClick={() => navigate('/groups')} variant="secondary">
          <MdArrowBack style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Retour
        </Button>
      </div>

      <Card>
        <div style={styles.profileHeader}>
          <div style={styles.avatar}>
            <MdGroup style={{ fontSize: '36px' }} />
          </div>
          <div style={styles.profileInfo}>
            <h1 style={styles.name}>{group.name}</h1>
            <span style={styles.badge}>{group.type}</span>
          </div>
        </div>

        {group.description && (
          <div style={styles.descriptionSection}>
            <p style={styles.description}>{group.description}</p>
          </div>
        )}

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Informations</h2>
          <div style={styles.infoGrid}>
            {(group as any).coach && (
              <div 
                style={styles.infoItem}
                onClick={() => navigate(`/coaches/${(group as any).coach.id}`)}
              >
                <MdSportsMartialArts style={styles.infoIcon} />
                <div>
                  <div style={styles.infoLabel}>Coach</div>
                  <div style={styles.infoValue}>
                    {(group as any).coach.firstName} {(group as any).coach.lastName}
                  </div>
                </div>
              </div>
            )}
            {(group as any).athletes && (
              <div style={styles.infoItem}>
                <MdPeople style={styles.infoIcon} />
                <div>
                  <div style={styles.infoLabel}>Membres</div>
                  <div style={styles.infoValue}>{(group as any).athletes.length} athlètes</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {(group as any).athletes && (group as any).athletes.length > 0 && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Athlètes ({(group as any).athletes.length})</h2>
            <div style={styles.athletesList}>
              {(group as any).athletes.map((athleteGroup: any) => {
                const athlete = athleteGroup.athlete || athleteGroup;
                return (
                  <div 
                    key={athlete.id} 
                    style={styles.athleteItem}
                    onClick={() => navigate(`/athletes/${athlete.id}`)}
                  >
                    <div style={styles.athleteAvatar}>
                      {athlete.firstName[0]}{athlete.lastName[0]}
                    </div>
                    <div>
                      <div style={styles.athleteName}>
                        {athlete.firstName} {athlete.lastName}
                      </div>
                      <div style={styles.athleteLevel}>
                        {athlete.category} · {athlete.level}
                      </div>
                    </div>
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
    borderRadius: '16px',
    background: 'linear-gradient(135deg, #4f9eff 0%, #3b7dd6 100%)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
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
  badge: {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '16px',
    fontSize: '13px',
    fontWeight: '600',
    background: '#dbeafe',
    color: '#1e40af',
  },
  descriptionSection: {
    marginBottom: '24px',
    padding: '16px',
    background: '#f9fafb',
    borderRadius: '8px',
  },
  description: {
    margin: 0,
    color: '#4b5563',
    lineHeight: '1.6',
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
    cursor: 'pointer',
    transition: 'all 0.2s',
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
  athletesList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '12px',
  },
  athleteItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    background: '#f9fafb',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  athleteAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: '600',
  },
  athleteName: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '2px',
  },
  athleteLevel: {
    fontSize: '13px',
    color: '#6b7280',
  },
};

export default GroupDetail;
