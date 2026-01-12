import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Modal from '../components/UI/Modal';
import Input from '../components/UI/Input';
import { athleteService } from '../services/athlete.service';
import { Athlete } from '../types';
import { MdPeople, MdAdd, MdEdit, MdDelete, MdSearch, MdFilterList, MdTrendingUp, MdEmojiEvents } from 'react-icons/md';

const Athletes: React.FC = () => {
  const navigate = useNavigate();
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAthlete, setSelectedAthlete] = useState<Athlete | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    category: '',
    level: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterLevel, setFilterLevel] = useState<string>('all');

  const fetchAthletes = async () => {
    try {
      setLoading(true);
      const data = await athleteService.getAllAthletes();
      setAthletes(data);
    } catch (error) {
      console.error('Erreur lors du chargement des athlètes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAthletes();
  }, []);

  const handleOpenModal = (athlete?: Athlete) => {
    if (athlete) {
      setSelectedAthlete(athlete);
      setFormData({
        email: '',
        password: '',
        firstName: athlete.firstName,
        lastName: athlete.lastName,
        category: athlete.category,
        level: athlete.level,
      });
    } else {
      setSelectedAthlete(null);
      setFormData({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        category: '',
        level: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAthlete(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedAthlete) {
        await athleteService.updateAthlete(selectedAthlete.id, {
          firstName: formData.firstName,
          lastName: formData.lastName,
          category: formData.category as any,
          level: formData.level as any,
        });
      } else {
        await athleteService.createAthlete(formData);
      }
      handleCloseModal();
      fetchAthletes();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde de l\'athlète');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet athlète ?')) {
      try {
        await athleteService.deleteAthlete(id);
        fetchAthletes();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression de l\'athlète');
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

  const filteredAthletes = athletes.filter(athlete => {
    const matchesSearch = 
      athlete.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      athlete.lastName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || athlete.category === filterCategory;
    const matchesLevel = filterLevel === 'all' || athlete.level === filterLevel;
    return matchesSearch && matchesCategory && matchesLevel;
  });

  const stats = {
    total: athletes.length,
    juniors: athletes.filter(a => a.category === 'JUNIOR').length,
    seniors: athletes.filter(a => a.category === 'SENIOR').length,
    veterans: athletes.filter(a => a.category === 'VETERAN').length,
  };

  return (
    <MainLayout>
      <div style={styles.header}>
        <h1 style={styles.title}><MdPeople style={{ verticalAlign: 'middle', marginRight: '8px' }} /> Athlètes</h1>
        <button onClick={() => handleOpenModal()} style={styles.addButton} title="Nouvel athlète">
          <MdAdd style={{ fontSize: '20px' }} />
        </button>
      </div>

      {/* Statistiques */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}><MdPeople /></div>
          <div>
            <div style={styles.statValue}>{stats.total}</div>
            <div style={styles.statLabel}>Total athlètes</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: '#dbeafe' }}><MdEmojiEvents style={{ color: '#1e40af' }} /></div>
          <div>
            <div style={styles.statValue}>{stats.juniors}</div>
            <div style={styles.statLabel}>Juniors</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: '#dcfce7' }}><MdTrendingUp style={{ color: '#15803d' }} /></div>
          <div>
            <div style={styles.statValue}>{stats.seniors}</div>
            <div style={styles.statLabel}>Seniors</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: '#fef3c7' }}><MdEmojiEvents style={{ color: '#a16207' }} /></div>
          <div>
            <div style={styles.statValue}>{stats.veterans}</div>
            <div style={styles.statLabel}>Vétérans</div>
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
              placeholder="Rechercher un athlète..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>
          <div style={styles.filters}>
            <MdFilterList style={{ marginRight: '8px', color: '#6b7280' }} />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="all">Toutes catégories</option>
              <option value="JUNIOR">Junior</option>
              <option value="SENIOR">Senior</option>
              <option value="VETERAN">Vétéran</option>
            </select>
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="all">Tous niveaux</option>
              <option value="BEGINNER">Débutant</option>
              <option value="INTERMEDIATE">Intermédiaire</option>
              <option value="ADVANCED">Avancé</option>
              <option value="EXPERT">Expert</option>
            </select>
          </div>
        </div>
      </Card>

      <Card>
        {filteredAthletes.length === 0 ? (
          <div style={styles.empty}>
            {athletes.length === 0 ? 'Aucun athlète enregistré' : 'Aucun résultat trouvé'}
          </div>
        ) : (
          <div style={styles.grid}>
            {filteredAthletes.map((athlete) => (
              <div key={athlete.id} style={styles.athleteCard}>
                <div 
                  style={styles.athleteHeader}
                  onClick={() => navigate(`/athletes/${athlete.id}`)}
                >
                  <div style={styles.avatar}>
                    {athlete.firstName[0]}{athlete.lastName[0]}
                  </div>
                  <div style={styles.athleteInfo}>
                    <h3 style={styles.athleteName}>
                      {athlete.firstName} {athlete.lastName}
                    </h3>
                    <p style={styles.athleteMeta}>
                      {athlete.category} • {athlete.level}
                    </p>
                  </div>
                </div>
                <div style={styles.cardActions}>
                  <button
                    style={styles.actionButton}
                    onClick={() => handleOpenModal(athlete)}
                    title="Modifier"
                  >
                    <MdEdit style={{ fontSize: '18px' }} />
                  </button>
                  <button
                    style={{ ...styles.actionButton, color: '#ef4444' }}
                    onClick={() => handleDelete(athlete.id)}
                    title="Supprimer"
                  >
                    <MdDelete style={{ fontSize: '18px' }} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedAthlete ? 'Modifier l\'athlète' : 'Nouvel athlète'}
      >
        <form onSubmit={handleSubmit}>
          {!selectedAthlete && (
            <>
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
              <Input
                label="Mot de passe"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </>
          )}
          <Input
            label="Prénom"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            required
          />
          <Input
            label="Nom"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
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
          <div style={styles.modalActions}>
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
              Annuler
            </Button>
            <Button type="submit">
              {selectedAthlete ? 'Mettre à jour' : 'Créer'}
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
    transition: 'all 0.2s ease',
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
    lineHeight: '1',
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
    marginBottom: '0',
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
    transition: 'all 0.2s ease',
  },
  filters: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
  },
  filterSelect: {
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    fontSize: '14px',
    outline: 'none',
    cursor: 'pointer',
    background: 'white',
    transition: 'all 0.2s ease',
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
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px',
  },
  athleteCard: {
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    background: 'white',
  },
  athleteHeader: {
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    borderBottom: '1px solid #f3f4f6',
  },
  avatar: {
    width: '56px',
    height: '56px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '20px',
    flexShrink: 0,
  },
  athleteInfo: {
    flex: 1,
  },
  athleteName: {
    margin: '0 0 4px 0',
    fontSize: '16px',
    fontWeight: '700',
    color: '#1a1f36',
  },
  athleteMeta: {
    margin: 0,
    fontSize: '14px',
    color: '#6b7280',
  },
  cardActions: {
    display: 'flex',
    gap: '8px',
    padding: '16px 20px',
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
  modalActions: {
    display: 'flex',
    gap: '12px',
    marginTop: '24px',
  },
};

export default Athletes;
