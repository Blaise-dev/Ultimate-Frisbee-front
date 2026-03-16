import React from 'react';

interface CreatorSignatureProps {
  compact?: boolean;
  profileUrl?: string;
  repoUrl?: string;
}

const CreatorSignature: React.FC<CreatorSignatureProps> = ({
  compact = false,
  profileUrl = 'https://github.com/Blaise-dev',
  repoUrl = 'https://github.com/Blaise-dev/Ultimate-Frisbee',
}) => {
  return (
    <div style={compact ? styles.compactWrapper : styles.wrapper}>
      <a href={profileUrl} target="_blank" rel="noreferrer" style={styles.brandLink}>
        Blaise.dev
      </a>
      <span style={styles.separator}>·</span>
      <a href={repoUrl} target="_blank" rel="noreferrer" style={styles.repoLink}>
        Repo
      </a>
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
  separator: {
    opacity: 0.45,
  },
  brandLink: {
    color: '#2563eb',
    fontWeight: '700',
    textDecoration: 'none',
  },
  repoLink: {
    color: '#0f172a',
    fontWeight: '600',
    textDecoration: 'none',
  },
};

export default CreatorSignature;