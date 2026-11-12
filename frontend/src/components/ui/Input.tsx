import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, leftIcon, rightIcon, error, className = '', id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={id} className="font-label-ui text-label-ui text-on-surface-variant font-medium">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <span className="absolute left-3 text-outline flex items-center pointer-events-none">
              {leftIcon}
            </span>
          )}
          <input
            id={id}
            ref={ref}
            className={`w-full bg-surface-container-lowest text-on-surface font-body-md text-body-md py-2 rounded-lg border border-surface-container-high transition-all placeholder:text-outline/60 focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container ${
              leftIcon ? 'pl-10' : 'pl-3'
            } ${rightIcon ? 'pr-10' : 'pr-3'} ${
              error ? 'border-error focus:border-error focus:ring-error' : ''
            } ${className}`}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3 flex items-center text-outline">
              {rightIcon}
            </span>
          )}
        </div>
        {error && <span className="text-[11px] font-mono text-error mt-0.5">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;

