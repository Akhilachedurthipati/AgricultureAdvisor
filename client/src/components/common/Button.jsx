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
    primary: 'bg-[#123D2A] hover:bg-[#1D5939] active:bg-[#0B261A] text-white shadow-sm shadow-[#123D2A]/20 focus:ring-[#123D2A]',
    secondary: 'bg-white hover:bg-[#F7F7F0] active:bg-[#EBECE1] text-[#202923] border border-slate-200/90 shadow-sm focus:ring-slate-300',
    fresh: 'bg-[#246B45] hover:bg-[#1D5939] active:bg-[#123D2A] text-white shadow-sm shadow-[#246B45]/20 focus:ring-[#246B45]',
    lime: 'bg-[#B6D957] hover:bg-[#A6CB43] active:bg-[#93B43C] text-[#123D2A] font-bold shadow-sm focus:ring-[#B6D957]',
    outline: 'border border-[#123D2A] hover:bg-[#123D2A]/5 active:bg-[#123D2A]/10 text-[#123D2A] focus:ring-[#123D2A]',
    danger: 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-sm shadow-rose-600/20 focus:ring-rose-500',
    ghost: 'text-slate-600 hover:text-[#123D2A] hover:bg-slate-100/80 active:bg-slate-200/60 focus:ring-[#123D2A]',
    earth: 'bg-[#7C5942] hover:bg-[#674A39] text-white shadow-sm focus:ring-[#7C5942]'
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-xs sm:text-sm px-4 py-2.5 gap-2',
    lg: 'text-sm sm:text-base px-6 py-3.5 gap-2.5'
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
