import React from 'react';

interface CreatorSignatureProps {
  compact?: boolean;
}

const CreatorSignature: React.FC<CreatorSignatureProps> = ({ compact = false }) => {
  return (
    <div style={compact ? styles.compactWrapper : styles.wrapper}>
      <span style={styles.label}>Créé par</span>
      <span style={styles.name}>Blaise</span>
      <span style={styles.separator}>·</span>
      <span style={styles.brand}>Blaise.dev</span>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    justifyContent: 'center',
    flexWrap: 'wrap',
    color: '#64748b',
    fontSize: '13px',
    letterSpacing: '0.02em',
  },
  compactWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    justifyContent: 'center',
    flexWrap: 'wrap',
    color: '#94a3b8',
    fontSize: '12px',
    letterSpacing: '0.03em',
  },
  label: {
    textTransform: 'uppercase',
    fontSize: '11px',
    fontWeight: '600',
  },
  name: {
    color: '#0f172a',
    fontWeight: '700',
  },
  separator: {
    opacity: 0.45,
  },
  brand: {
    color: '#2563eb',
    fontWeight: '700',
  },
};

export default CreatorSignature;