import React, { useEffect, useState } from 'react';
import MainLayout from '../components/Layout/MainLayout';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Modal from '../components/UI/Modal';
import Input from '../components/UI/Input';
import { useAuth } from '../contexts/AuthContext';
import { groupService } from '../services/group.service';
import { coachService } from '../services/coach.service';
import { Group, Coach } from '../types';
import { MdGroup, MdAdd, MdEdit, MdDelete, MdSportsMartialArts } from 'react-icons/md';

const Groups: React.FC = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    level: '',
    coachId: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [groupsData, coachesData] = await Promise.all([
        groupService.getAllGroups(),
        coachService.getAllCoaches(),
      ]);
      setGroups(groupsData);
      setCoaches(coachesData);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (group?: Group) => {
    if (group) {
      setSelectedGroup(group);
      setFormData({
        name: group.name,
        category: (group as any).category || '',
        level: (group as any).level || '',
        coachId: (group as any).coachId || '',
      });
    } else {
      setSelectedGroup(null);
      setFormData({
        name: '',
        category: '',
        level: '',
        coachId: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedGroup(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedGroup) {
        await groupService.updateGroup(selectedGroup.id, formData as any);
      } else {
        await groupService.createGroup(formData as any);
      }
      handleCloseModal();
      fetchData();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde du groupe');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce groupe ?')) {
      try {
        await groupService.deleteGroup(id);
        fetchData();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression du groupe');
      }
    }
  };

  const categoryOptions = [
    { value: 'JUNIOR', label: 'Junior' },
    { value: 'SENIOR', label: 'Senior' },
    { value: 'VETERAN', label: 'Vétéran' },
  ];

  const levelOptions = [
    { value: 'BEGINNER', label: 'Débutant' },
    { value: 'INTERMEDIATE', label: 'Intermédiaire' },
    { value: 'ADVANCED', label: 'Avancé' },
    { value: 'EXPERT', label: 'Expert' },
  ];

  if (loading) {
    return (
      <MainLayout>
        <div style={styles.loading}>Chargement...</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div style={styles.header}>
        <h1 style={styles.title}><MdGroup style={{ verticalAlign: 'middle', marginRight: '8px' }} /> Groupes</h1>
        {(user?.role === 'ADMIN' || user?.role === 'COACH') && (
          <Button onClick={() => handleOpenModal()}>
            <MdAdd style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Nouveau groupe
          </Button>
        )}
      </div>

      <Card>
        {groups.length === 0 ? (
          <div style={styles.empty}>Aucun groupe créé</div>
        ) : (
          <div style={styles.grid}>
            {groups.map((group) => (
              <div key={group.id} style={styles.groupCard}>
                <div style={styles.groupHeader}>
                  <h3 style={styles.groupName}>{group.name}</h3>
                  <span style={styles.badge}>
                    {group.type}
                  </span>
                </div>
                <div style={styles.groupDetails}>
                  {(group as any).coach && (
                    <p style={styles.detail}>
                      <MdSportsMartialArts style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Coach: {(group as any).coach.firstName} {(group as any).coach.lastName}
                    </p>
                  )}
                  {group.description && (
                    <p style={styles.description}>{group.description}</p>
                  )}
                </div>
                {(user?.role === 'ADMIN' || user?.role === 'COACH') && (
                  <div style={styles.cardActions}>
                    <button
                      style={styles.actionButton}
                      onClick={() => handleOpenModal(group)}
                    >
                      <MdEdit style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Modifier
                    </button>
                    <button
                      style={{ ...styles.actionButton, color: '#ef4444' }}
                      onClick={() => handleDelete(group.id)}
                    >
                      <MdDelete style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Supprimer
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedGroup ? 'Modifier le groupe' : 'Nouveau groupe'}
      >
        <form onSubmit={handleSubmit}>
          <Input
            label="Nom du groupe"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ex: Équipe Elite 2024"
            required
          />
          <Input
            label="Catégorie"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            options={categoryOptions}
            required
          />
          <Input
            label="Niveau"
            value={formData.level}
            onChange={(e) => setFormData({ ...formData, level: e.target.value })}
            options={levelOptions}
            required
          />
          <Input
            label="Coach"
            value={formData.coachId}
            onChange={(e) => setFormData({ ...formData, coachId: e.target.value })}
            options={coaches.map(c => ({
              value: c.id,
              label: `${c.firstName} ${c.lastName}`,
            }))}
            required
          />
          <div style={styles.modalActions}>
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
              Annuler
            </Button>
            <Button type="submit">
              {selectedGroup ? 'Mettre à jour' : 'Créer'}
            </Button>
          </div>
        </form>
      </Modal>
    </MainLayout>
  );
};

const styles: Record<string, React.CSSProperties> = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  title: {
    margin: 0,
    fontSize: '28px',
    fontWeight: '700',
    color: '#333',
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    fontSize: '18px',
    color: '#999',
  },
  empty: {
    textAlign: 'center',
    padding: '40px',
    color: '#999',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '20px',
  },
  groupCard: {
    padding: '20px',
    border: '2px solid #f0f0f0',
    borderRadius: '12px',
    transition: 'all 0.2s',
  },
  groupHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px',
  },
  groupName: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  badge: {
    padding: '4px 12px',
    background: '#e3f2fd',
    color: '#1976d2',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
  },
  groupDetails: {
    marginBottom: '16px',
  },
  detail: {
    margin: '8px 0',
    fontSize: '14px',
    color: '#666',
  },
  description: {
    margin: '12px 0 0 0',
    fontSize: '13px',
    color: '#999',
    fontStyle: 'italic',
  },
  cardActions: {
    display: 'flex',
    gap: '8px',
  },
  actionButton: {
    flex: 1,
    padding: '8px 12px',
    background: 'transparent',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#667eea',
    fontWeight: '600',
    transition: 'all 0.2s',
  },
  modalActions: {
    display: 'flex',
    gap: '12px',
    marginTop: '24px',
  },
};

export default Groups;
