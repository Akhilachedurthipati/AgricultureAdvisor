import React from 'react';
import { RefreshCw } from 'lucide-react';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  loading = false,
  disabled = false,
  icon: Icon,
  iconPosition = 'left',
  onClick,
  className = '',
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed select-none cursor-pointer';

  const variants = {
    primary: 'bg-[#176B45] hover:bg-[#114F33] active:bg-[#0D3F28] text-white shadow-sm shadow-[#176B45]/20 focus:ring-[#176B45]',
    secondary: 'bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-800 border border-slate-200 shadow-sm focus:ring-slate-300',
    fresh: 'bg-[#22A06B] hover:bg-[#1B8255] active:bg-[#176B45] text-white shadow-sm shadow-[#22A06B]/20 focus:ring-[#22A06B]',
    outline: 'border border-[#176B45] hover:bg-agri-100/60 active:bg-agri-200/50 text-[#176B45] focus:ring-[#176B45]',
    danger: 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-sm shadow-rose-600/20 focus:ring-rose-500',
    ghost: 'text-slate-600 hover:text-[#176B45] hover:bg-slate-100/80 active:bg-slate-200/60 focus:ring-[#176B45]',
    earth: 'bg-[#7C5942] hover:bg-[#674A39] text-white shadow-sm focus:ring-[#7C5942]'
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-xs sm:text-sm px-4 py-2.5 gap-2',
    lg: 'text-sm sm:text-base px-6 py-3 gap-2.5'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
          <span>{children}</span>
        </>
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className="w-4 h-4 shrink-0" />}
          <span>{children}</span>
          {Icon && iconPosition === 'right' && <Icon className="w-4 h-4 shrink-0" />}
        </>
      )}
    </button>
  );
}
