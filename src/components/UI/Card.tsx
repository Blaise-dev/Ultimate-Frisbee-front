import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: React.ReactNode;
  actions?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ children, title, actions }) => {
  return (
    <div style={styles.card}>
      {(title || actions) && (
        <div style={styles.header}>
          {title && <h3 style={styles.title}>{title}</h3>}
          {actions && <div style={styles.actions}>{actions}</div>}
        </div>
      )}
      <div style={styles.content}>{children}</div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  card: {
    background: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    overflow: 'hidden',
    border: '1px solid #e5e7eb',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '18px 24px',
    borderBottom: '1px solid #e5e7eb',
    background: '#fafafa',
  },
  title: {
    margin: 0,
    fontSize: '16px',
    fontWeight: '600',
    color: '#1f2937',
  },
  actions: {
    display: 'flex',
    gap: '8px',
  },
  content: {
    padding: '24px',
  },
};

export default Card;
