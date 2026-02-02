
import React from 'react';

interface TerminalButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'danger' | 'warning' | 'ghost';
  className?: string;
  disabled?: boolean;
}

export const TerminalButton: React.FC<TerminalButtonProps> = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  className = '',
  disabled = false
}) => {
  const baseStyles = "px-4 py-2 font-bold uppercase tracking-widest transition-all duration-200 border-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2";
  
  const variants = {
    primary: "border-emerald-500 text-emerald-500 hover:bg-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.3)]",
    danger: "border-red-500 text-red-500 hover:bg-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.3)]",
    warning: "border-amber-500 text-amber-500 hover:bg-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.3)]",
    ghost: "border-gray-700 text-gray-500 hover:border-emerald-500 hover:text-emerald-500"
  };

  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      <span className="relative z-10">{children}</span>
    </button>
  );
};
