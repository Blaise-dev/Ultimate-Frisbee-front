import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth <= 900;
      setIsMobile(mobile);
      if (!mobile) {
        setIsSidebarOpen(false);
      }
    };

    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobile && isSidebarOpen ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobile, isSidebarOpen]);

  return (
    <div style={styles.container}>
      <Sidebar
        isMobile={isMobile}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <div style={{ ...styles.main, marginLeft: isMobile ? 0 : '260px' }}>
        <Header isMobile={isMobile} onMenuClick={() => setIsSidebarOpen((prev) => !prev)} />
        <div style={{ ...styles.content, padding: isMobile ? '14px' : '32px' }}>
          {children}
        </div>
      </div>
      {isMobile && isSidebarOpen && <div style={styles.mobileBackdrop} onClick={() => setIsSidebarOpen(false)} />}
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
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },
  content: {
    flex: 1,
    padding: '32px',
    maxWidth: '1600px',
    width: '100%',
    minWidth: 0,
    overflowX: 'hidden',
  },
  mobileBackdrop: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.35)',
    zIndex: 1190,
  },
};

export default MainLayout;
