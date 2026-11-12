import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'font-label-ui inline-flex items-center justify-center rounded font-semibold transition-all duration-200 active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100';

  const variantStyles = {
    primary:
      'bg-primary-container text-on-primary-container hover:bg-secondary-container hover:text-on-secondary shadow-[0_0_20px_rgba(0,245,160,0.25)] hover:shadow-[0_0_25px_rgba(0,215,244,0.35)]',
    secondary:
      'bg-surface-container-high hover:bg-surface-container-highest text-on-surface shadow-sm backdrop-blur-md border border-surface-container-highest',
    outline:
      'bg-transparent hover:bg-surface-container text-on-surface border border-surface-container-high hover:border-primary-container/50',
    ghost:
      'bg-transparent hover:bg-surface-container text-on-surface-variant hover:text-on-surface',
    danger:
      'bg-error-container/20 hover:bg-error-container/30 text-error border border-error/30',
  };

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-1 gap-1.5',
    md: 'text-label-ui px-4 py-2 gap-2',
    lg: 'text-sm px-6 py-2.5 gap-2.5',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        icon && <span className="flex-shrink-0">{icon}</span>
      )}
      <span>{children}</span>
    </button>
  );
};

export default Button;

