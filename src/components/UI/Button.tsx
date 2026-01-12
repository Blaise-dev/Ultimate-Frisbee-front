import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  fullWidth?: boolean;
  style?: React.CSSProperties;
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  disabled = false,
  fullWidth = false,
  style,
}) => {
  const variantStyles = {
    primary: {
      background: '#4f9eff',
      color: 'white',
      border: 'none',
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    },
    secondary: {
      background: '#ffffff',
      color: '#374151',
      border: '1px solid #d1d5db',
    },
    danger: {
      background: '#ef4444',
      color: 'white',
      border: 'none',
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    },
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        ...styles.button,
        ...variantStyles[variant],
        ...(fullWidth ? styles.fullWidth : {}),
        ...(disabled ? styles.disabled : {}),
        ...style,
      }}
    >
      {children}
    </button>
  );
};

const styles: Record<string, React.CSSProperties> = {
  button: {
    padding: '10px 20px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    outline: 'none',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
};

export default Button;
