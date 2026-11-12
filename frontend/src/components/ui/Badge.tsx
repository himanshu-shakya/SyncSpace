import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'emerald' | 'cyan' | 'amber' | 'neutral' | 'error';
  size?: 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'emerald',
  size = 'md',
  dot = false,
  className = '',
}) => {
  const variantStyles = {
    emerald: 'bg-primary-container/15 text-primary-fixed-dim border-primary-container/30',
    cyan: 'bg-secondary-container/15 text-secondary border-secondary/30',
    amber: 'bg-tertiary-container/15 text-tertiary-fixed-dim border-tertiary-fixed/30',
    neutral: 'bg-surface-container-high text-on-surface-variant border-surface-container-highest',
    error: 'bg-error-container/20 text-error border-error/30',
  };

  const dotColors = {
    emerald: 'bg-primary-container',
    cyan: 'bg-secondary-container',
    amber: 'bg-tertiary-container',
    neutral: 'bg-outline',
    error: 'bg-error',
  };

  const sizeStyles = {
    sm: 'text-[10px] px-1.5 py-0.5',
    md: 'font-label-mono-sm text-label-mono-sm px-2.5 py-1',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-mono font-medium ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {dot && (
        <span className="relative flex h-1.5 w-1.5">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dotColors[variant]}`}></span>
          <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${dotColors[variant]}`}></span>
        </span>
      )}
      <span>{children}</span>
    </span>
  );
};

export default Badge;

