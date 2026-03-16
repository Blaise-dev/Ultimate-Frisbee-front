import React, { useEffect } from 'react';
import { MdCheckCircle, MdError, MdWarning, MdInfo, MdClose } from 'react-icons/md';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  onClose: () => void;
  duration?: number;
  index?: number;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose, duration = 5000, index = 0 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <MdCheckCircle size={24} />;
      case 'error':
        return <MdError size={24} />;
      case 'warning':
        return <MdWarning size={24} />;
      case 'info':
        return <MdInfo size={24} />;
    }
  };

  const getStyles = () => {
    const base = {
      position: 'fixed' as const,
      top: `${20 + (index * 80)}px`,
      right: '20px',
      minWidth: 'min(320px, calc(100vw - 40px))',
      maxWidth: '500px',
      padding: '16px 20px',
      borderRadius: '12px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      zIndex: 9999,
      animation: 'slideIn 0.3s ease-out',
      pointerEvents: 'auto' as const,
    };

    const colors = {
      success: {
        background: '#dcfce7',
        color: '#166534',
        border: '2px solid #16a34a',
      },
      error: {
        background: '#fee2e2',
        color: '#991b1b',
        border: '2px solid #dc2626',
      },
      warning: {
        background: '#fef3c7',
        color: '#92400e',
        border: '2px solid #f59e0b',
      },
      info: {
        background: '#dbeafe',
        color: '#1e40af',
        border: '2px solid #3b82f6',
      },
    };

    return { ...base, ...colors[type] };
  };

  return (
    <>
      <style>
        {`
          @keyframes slideIn {
            from {
              transform: translateX(400px);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}
      </style>
      <div style={getStyles()}>
        <div style={{ flexShrink: 0 }}>
          {getIcon()}
        </div>
        <div style={{ flex: 1, fontSize: '15px', fontWeight: '500', wordBreak: 'break-word' }}>
          {message}
        </div>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Toast close clicked');
            onClose();
          }}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            opacity: 0.7,
            transition: 'opacity 0.2s',
            flexShrink: 0,
            zIndex: 10000,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.7')}
          aria-label="Fermer"
        >
          <MdClose size={20} />
        </button>
      </div>
    </>
  );
};

export default Toast;
