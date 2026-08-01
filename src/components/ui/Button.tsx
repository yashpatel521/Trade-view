import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  isLoading,
  disabled,
  ...props
}) => {
  return (
    <button
      disabled={disabled || isLoading}
      className={twMerge(
        clsx(
          "relative inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-150 outline-none disabled:opacity-40 disabled:pointer-events-none cursor-pointer",
          {
            'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 font-bold active:scale-[0.98]': variant === 'primary' || variant === 'success',
            'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 active:scale-[0.98]': variant === 'secondary',
            'bg-red-600/10 text-red-400 hover:bg-red-600/20 border border-red-600/20 active:scale-[0.98]': variant === 'danger',
            'bg-transparent hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200': variant === 'ghost',
          }
        ),
        className
      )}
      {...props}
    >
      {isLoading ? (
        <>
          <span className="opacity-0">{children}</span>
          <span className="absolute flex items-center justify-center">
            <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </span>
        </>
      ) : (
        children
      )}
    </button>
  );
};
export default Button;
