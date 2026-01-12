import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { MdDashboard, MdEventNote, MdGroup, MdSportsMartialArts, MdDirectionsRun, MdSportsBaseball, MdPeople } from 'react-icons/md';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();

  const menuItems = [
    { path: '/dashboard', label: 'Tableau de bord', icon: <MdDashboard />, roles: ['ADMIN', 'COACH', 'ATHLETE'] },
    { path: '/sessions', label: 'Séances', icon: <MdEventNote />, roles: ['ADMIN', 'COACH', 'ATHLETE'] },
    { path: '/groups', label: 'Mes Groupes', icon: <MdGroup />, roles: ['ATHLETE'] },
    { path: '/athletes', label: 'Athlètes', icon: <MdDirectionsRun />, roles: ['ADMIN', 'COACH'] },
    { path: '/groups', label: 'Groupes', icon: <MdGroup />, roles: ['ADMIN', 'COACH'] },
    { path: '/coaches', label: 'Coachs', icon: <MdSportsMartialArts />, roles: ['ADMIN'] },
    { path: '/users', label: 'Utilisateurs', icon: <MdPeople />, roles: ['ADMIN'] },
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user?.role || '')
  );

  return (
    <aside style={styles.sidebar}>
      <div style={styles.logo}>
        <MdSportsBaseball style={styles.logoIcon} />
        <span style={styles.logoText}>Ultimate</span>
      </div>
      <nav style={styles.nav}>
        {filteredMenuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            style={{
              ...styles.navItem,
              ...(location.pathname === item.path ? styles.navItemActive : {}),
            }}
          >
            <span style={styles.navIcon}>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
};

const styles: Record<string, React.CSSProperties> = {
  sidebar: {
    width: '260px',
    background: '#1a1f36',
    minHeight: '100vh',
    padding: '0',
    position: 'fixed',
    left: 0,
    top: 0,
    borderRight: '1px solid #2d3548',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '24px 20px',
    color: '#ffffff',
    borderBottom: '1px solid #2d3548',
    background: '#151a2e',
  },
  logoIcon: {
    fontSize: '28px',
  },
  logoText: {
    fontSize: '20px',
    fontWeight: '600',
    letterSpacing: '-0.5px',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    padding: '16px 12px',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 14px',
    color: '#8b92a7',
    textDecoration: 'none',
    borderRadius: '6px',
    transition: 'all 0.2s',
    fontSize: '14px',
    fontWeight: '500',
  },
  navItemActive: {
    background: '#2d3548',
    color: '#4f9eff',
    fontWeight: '600',
  },
  navIcon: {
    fontSize: '18px',
  },
};

export default Sidebar;
