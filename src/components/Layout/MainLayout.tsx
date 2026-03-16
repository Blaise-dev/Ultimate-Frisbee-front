import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import CreatorSignature from '../UI/CreatorSignature';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div style={styles.container}>
      <Sidebar />
      <div style={styles.main}>
        <Header />
        <div style={styles.content}>
          {children}
        </div>
        <div style={styles.footer}>
          <CreatorSignature />
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    background: '#f9fafb',
  },
  main: {
    flex: 1,
    marginLeft: '260px',
    display: 'flex',
    flexDirection: 'column',
  },
  content: {
    flex: 1,
    padding: '32px',
    maxWidth: '1600px',
  },
  footer: {
    padding: '0 32px 20px',
  },
};

export default MainLayout;
