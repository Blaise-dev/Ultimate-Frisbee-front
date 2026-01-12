import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import Card from '../components/UI/Card';
import Modal from '../components/UI/Modal';
import Toast from '../components/UI/Toast';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/useToast';
import { groupService } from '../services/group.service';
import { coachService } from '../services/coach.service';
import { Group, Coach } from '../types';
import { MdGroup, MdAdd, MdEdit, MdDelete, MdSportsMartialArts, MdSearch, MdFilterList, MdEmojiEvents, MdBeachAccess, MdLogin, MdLogout, MdPeople } from 'react-icons/md';

const Groups: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
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
      console.log('📦 Groupes récupérés:', groupsData);
      console.log('👥 Nombre de groupes:', groupsData.length);
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
      // Si l'utilisateur est un coach, on remplit automatiquement son coachId
      const defaultCoachId = user?.role === 'COACH' ? (user.profile as any)?.id || '' : '';
      console.log('🎯 Coach par défaut:', defaultCoachId, 'User profile:', user?.profile);
      setFormData({
        name: '',
        type: '',
        description: '',
        coachId: defaultCoachId,
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
        toast.success('Groupe modifié avec succès');
      } else {
        console.log('Données envoyées:', formData);
        await groupService.createGroup(formData as any);
        toast.success('Groupe créé avec succès');
      }
      handleCloseModal();
      fetchData();
    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde:', error);
      console.error('Response:', error.response);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Erreur lors de la sauvegarde du groupe';
      toast.error(errorMessage);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce groupe ?')) {
      try {
        await groupService.deleteGroup(id);
        toast.success('Groupe supprimé avec succès');
        fetchData();
      } catch (error: any) {
        console.error('Erreur lors de la suppression:', error);
        const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Erreur lors de la suppression du groupe';
        toast.error(errorMessage);
      }
    }
  };

  const handleJoinGroup = async (groupId: string) => {
    try {
      const athleteId = (user?.profile as any)?.id;
      if (!athleteId) {
        toast.error('Profil athlète non trouvé');
        return;
      }
      
      await groupService.joinGroup(groupId, athleteId);
      toast.success('Inscription au groupe réussie !');
      fetchData();
    } catch (error: any) {
      console.error('Erreur lors de l\'inscription:', error);
      const errorMessage = error.response?.data?.error || 'Erreur lors de l\'inscription';
      toast.error(errorMessage);
    }
  };

  const handleLeaveGroup = async (groupId: string) => {
    try {
      const athleteId = (user?.profile as any)?.id;
      if (!athleteId) {
        toast.error('Profil athlète non trouvé');
        return;
      }
      
      await groupService.leaveGroup(groupId, athleteId);
      toast.success('Désinscription du groupe réussie !');
      fetchData();
    } catch (error: any) {
      console.error('Erreur lors de la désinscription:', error);
      const errorMessage = error.response?.data?.error || 'Erreur lors de la désinscription';
      toast.error(errorMessage);
    }
  };

  const isInGroup = (group: Group): boolean => {
    const athleteId = (user?.profile as any)?.id;
    if (!athleteId) return false;
    return (group as any).athletes?.some((a: any) => a.athleteId === athleteId) || false;
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
          <button onClick={() => handleOpenModal()} style={styles.addButton} title="Nouveau groupe">
            <MdAdd style={{ fontSize: '24px' }} />
          </button>
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
          <div style={{ ...styles.statIcon, background: '#fef3c7' }}><MdEmojiEvents style={{ color: '#a16207' }} /></div>
          <div>
            <div style={styles.statValue}>{stats.competition}</div>
            <div style={styles.statLabel}>Compétition</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: '#dbeafe' }}><MdBeachAccess style={{ color: '#1e40af' }} /></div>
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
              <div 
                key={group.id} 
                style={styles.groupCard}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-6px)';
                  e.currentTarget.style.boxShadow = '0 12px 32px rgba(102, 126, 234, 0.2)';
                  e.currentTarget.style.borderColor = '#667eea';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
                  e.currentTarget.style.borderColor = '#f0f0f0';
                }}
              >
                <div 
                  style={{ cursor: 'pointer', flex: 1 }}
                  onClick={() => navigate(`/groups/${group.id}`)}
                >
                  <div style={styles.groupHeader}>
                    <div style={styles.groupIconWrapper}>
                      <MdGroup style={styles.groupMainIcon} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={styles.groupName}>{group.name}</h3>
                      <span style={styles.badge}>{group.type}</span>
                    </div>
                  </div>
                  <div style={styles.groupDetails}>
                    {group.coach && !group.coach.user?.isDeleted && (
                      <p style={styles.detail}>
                        <MdSportsMartialArts style={{ verticalAlign: 'middle', marginRight: '4px' }} /> 
                        Coach: {group.coach.firstName} {group.coach.lastName}
                      </p>
                    )}
                    {!group.coach && (
                      <p style={styles.detailMuted}>
                        <MdSportsMartialArts style={{ verticalAlign: 'middle', marginRight: '4px' }} /> 
                        Aucun coach assigné
                      </p>
                    )}
                    {group.description && (
                      <p style={styles.description}>{group.description}</p>
                    )}
                    {/* Nombre de membres */}
                    {(group as any).athletes?.length > 0 && (
                      <div style={styles.membersInfo}>
                        <MdPeople style={{ fontSize: '18px', color: '#667eea' }} />
                        <span>{(group as any).athletes.length} membre{(group as any).athletes.length > 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Boutons d'action selon le rôle */}
                {user?.role === 'ATHLETE' ? (
                  <div style={styles.cardActions}>
                    {isInGroup(group) ? (
                      <button
                        style={styles.leaveButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLeaveGroup(group.id);
                        }}
                      >
                        <MdLogout style={{ fontSize: '18px', marginRight: '6px' }} />
                        Quitter
                      </button>
                    ) : (
                      <button
                        style={styles.joinButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleJoinGroup(group.id);
                        }}
                      >
                        <MdLogin style={{ fontSize: '18px', marginRight: '6px' }} />
                        Rejoindre
                      </button>
                    )}
                  </div>
                ) : (
                  (user?.role === 'ADMIN' || user?.role === 'COACH') && (
                    <div style={styles.cardActions}>
                      <button
                        style={styles.actionButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenModal(group);
                        }}
                        title="Modifier"
                      >
                        <MdEdit style={{ fontSize: '18px' }} />
                      </button>
                      <button
                        style={{ ...styles.actionButton, color: '#ef4444' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(group.id);
                        }}
                        title="Supprimer"
                      >
                        <MdDelete style={{ fontSize: '18px' }} />
                      </button>
                    </div>
                  )
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Toast notifications */}
      {toast.toasts.map((t, index) => (
        <Toast
          key={t.id}
          message={t.message}
          type={t.type}
          onClose={() => toast.removeToast(t.id)}
          index={index}
        />
      ))}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedGroup ? 'Modifier le groupe' : 'Nouveau groupe'}
      >
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="modal-form-group">
            <label className="modal-form-label">
              <MdGroup size={18} />
              Nom du groupe
            </label>
            <input
              className="modal-form-input"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Équipe Elite 2024"
              required
            />
          </div>
          <div className="modal-form-group">
            <label className="modal-form-label">
              <MdFilterList size={18} />
              Type de groupe
            </label>
            <select
              className="modal-form-select"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              required
            >
              <option value="">Sélectionner un type</option>
              {groupTypeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="modal-form-group">
            <label className="modal-form-label">
              Description
            </label>
            <textarea
              className="modal-form-textarea"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Description du groupe (optionnel)"
              rows={3}
            />
          </div>
          <div className="modal-form-group">
            <label className="modal-form-label">
              <MdSportsMartialArts size={18} />
              Coach
            </label>
            <select
              className="modal-form-select"
              value={formData.coachId}
              onChange={(e) => setFormData({ ...formData, coachId: e.target.value })}
            >
              <option value="">Sélectionner un coach</option>
              {coaches.map(c => (
                <option key={c.id} value={c.id}>
                  {c.firstName} {c.lastName}
                </option>
              ))}
            </select>
          </div>
          <div className="modal-form-actions">
            <button 
              type="button" 
              className="modal-form-button modal-form-button-secondary" 
              onClick={handleCloseModal}
            >
              Annuler
            </button>
            <button 
              type="submit" 
              className="modal-form-button modal-form-button-primary"
            >
              {selectedGroup ? 'Mettre à jour' : 'Créer le groupe'}
            </button>
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
  addButton: {
    padding: '14px 18px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '16px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    boxShadow: '0 8px 20px rgba(102, 126, 234, 0.4)',
    transition: 'all 0.3s ease',
    minWidth: '50px',
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
    padding: '24px',
    border: '2px solid #f0f0f0',
    borderRadius: '16px',
    transition: 'all 0.3s ease',
    overflow: 'hidden',
    background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(249,250,251,0.9) 100%)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
  },
  groupHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '16px',
  },
  groupIconWrapper: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  groupMainIcon: {
    fontSize: '24px',
    color: 'white',
  },
  groupName: {
    margin: '0 0 4px 0',
    fontSize: '18px',
    fontWeight: '600',
    color: '#333',
  },
  badge: {
    padding: '4px 12px',
    background: '#e3f2fd',
    color: '#1976d2',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'uppercase',
  } as React.CSSProperties,
  groupDetails: {
    marginBottom: '16px',
  },
  detail: {
    margin: '8px 0',
    fontSize: '14px',
    color: '#666',
  },
  detailMuted: {
    margin: '8px 0',
    fontSize: '14px',
    color: '#999',
    fontStyle: 'italic',
  },
  description: {
    margin: '12px 0 0 0',
    fontSize: '13px',
    color: '#999',
    fontStyle: 'italic',
  },
  membersInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '12px',
    paddingTop: '12px',
    borderTop: '1px solid #f0f0f0',
    fontSize: '14px',
    color: '#666',
    fontWeight: '500',
  },
  cardActions: {
    display: 'flex',
    gap: '8px',
  },
  actionButton: {
    flex: 1,
    padding: '12px',
    background: 'white',
    border: '2px solid #e5e7eb',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '16px',
    color: '#667eea',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
  },
  joinButton: {
    flex: 1,
    padding: '12px 20px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '16px',
    color: 'white',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
  } as React.CSSProperties,
  leaveButton: {
    flex: 1,
    padding: '12px 20px',
    background: 'white',
    border: '2px solid #ef4444',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '16px',
    color: '#ef4444',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
  } as React.CSSProperties,
  modalActions: {
    display: 'flex',
    gap: '12px',
    marginTop: '24px',
  },
};

export default Groups;
