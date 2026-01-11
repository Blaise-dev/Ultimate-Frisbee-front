import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Modal from '../components/UI/Modal';
import Input from '../components/UI/Input';
import { useAuth } from '../contexts/AuthContext';
import { groupService } from '../services/group.service';
import { coachService } from '../services/coach.service';
import { Group, Coach } from '../types';
import { MdGroup, MdAdd, MdEdit, MdDelete, MdSportsMartialArts, MdSearch, MdFilterList, MdPeople } from 'react-icons/md';

const Groups: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [groups, setGroups] = useState<Group[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    description: '',
    coachId: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

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
        type: group.type || '',
        description: group.description || '',
        coachId: (group as any).coachId || '',
      });
    } else {
      setSelectedGroup(null);
      setFormData({
        name: '',
        type: '',
        description: '',
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

  const groupTypeOptions = [
    { value: 'TRAINING', label: 'Entraînement' },
    { value: 'COMPETITION', label: 'Compétition' },
    { value: 'LEISURE', label: 'Loisir' },
  ];

  if (loading) {
    return (
      <MainLayout>
        <div style={styles.loading}>Chargement...</div>
      </MainLayout>
    );
  }

  const filteredGroups = groups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || group.type === filterType;
    return matchesSearch && matchesType;
  });

  const stats = {
    total: groups.length,
    training: groups.filter(g => g.type === 'TRAINING').length,
    competition: groups.filter(g => g.type === 'COMPETITION').length,
    leisure: groups.filter(g => g.type === 'LEISURE').length,
  };

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

      {/* Statistiques */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}><MdGroup /></div>
          <div>
            <div style={styles.statValue}>{stats.total}</div>
            <div style={styles.statLabel}>Total groupes</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: '#dcfce7' }}><MdSportsMartialArts style={{ color: '#15803d' }} /></div>
          <div>
            <div style={styles.statValue}>{stats.training}</div>
            <div style={styles.statLabel}>Entraînement</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: '#fef3c7' }}><MdPeople style={{ color: '#a16207' }} /></div>
          <div>
            <div style={styles.statValue}>{stats.competition}</div>
            <div style={styles.statLabel}>Compétition</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: '#dbeafe' }}><MdPeople style={{ color: '#1e40af' }} /></div>
          <div>
            <div style={styles.statValue}>{stats.leisure}</div>
            <div style={styles.statLabel}>Loisir</div>
          </div>
        </div>
      </div>

      {/* Recherche et filtres */}
      <Card>
        <div style={styles.filterBar}>
          <div style={styles.searchBox}>
            <MdSearch style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Rechercher un groupe..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>
          <div style={styles.filters}>
            <MdFilterList style={{ marginRight: '8px', color: '#6b7280' }} />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="all">Tous les types</option>
              <option value="TRAINING">Entraînement</option>
              <option value="COMPETITION">Compétition</option>
              <option value="LEISURE">Loisir</option>
            </select>
          </div>
        </div>
      </Card>

      <Card>
        {filteredGroups.length === 0 ? (
          <div style={styles.empty}>
            {groups.length === 0 ? 'Aucun groupe créé' : 'Aucun résultat trouvé'}
          </div>
        ) : (
          <div style={styles.grid}>
            {filteredGroups.map((group) => (
              <div key={group.id} style={styles.groupCard}>
                <div 
                  style={styles.groupHeader}
                  onClick={() => navigate(`/groups/${group.id}`)}
                >
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
            label="Type de groupe"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            options={groupTypeOptions}
            required
          />
          <Input
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Description du groupe (optionnel)"
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
    color: '#1a1f36',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  statCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb',
  },
  statIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '10px',
    background: '#eff6ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    color: '#2563eb',
  },
  statValue: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1a1f36',
  },
  statLabel: {
    fontSize: '13px',
    color: '#6b7280',
    marginTop: '4px',
  },
  filterBar: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  searchBox: {
    flex: '1',
    minWidth: '250px',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
    color: '#9ca3af',
    fontSize: '20px',
    pointerEvents: 'none',
  },
  searchInput: {
    width: '100%',
    padding: '10px 12px 10px 40px',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    fontSize: '14px',
    outline: 'none',
  },
  filters: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  filterSelect: {
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    fontSize: '14px',
    outline: 'none',
    cursor: 'pointer',
    background: 'white',
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
    cursor: 'pointer',
    transition: 'opacity 0.2s',
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
