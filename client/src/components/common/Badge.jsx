import React from 'react';

export default function Badge({
  children,
  variant = 'agri',
  size = 'md',
  pulse = false,
  icon: Icon,
  className = '',
  ...props
}) {
  const variants = {
    agri: 'bg-agri-100 text-agri-800 border-agri-200',
    success: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    warning: 'bg-amber-100 text-amber-900 border-amber-200',
    info: 'bg-sky-100 text-sky-800 border-sky-200',
    danger: 'bg-rose-100 text-rose-800 border-rose-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
    earth: 'bg-earth-100 text-earth-800 border-earth-200'
  };

  const sizes = {
    sm: 'text-[10px] px-2 py-0.5 gap-1 font-semibold',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-semibold'
  };

  const pulseColors = {
    agri: 'bg-agri-500',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    info: 'bg-sky-500',
    danger: 'bg-rose-500',
    neutral: 'bg-slate-400',
    earth: 'bg-earth-500'
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border ${variants[variant] || variants.agri} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {pulse && (
        <span className={`w-1.5 h-1.5 rounded-full ${pulseColors[variant] || pulseColors.agri} animate-pulse`} />
      )}
      {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
      <span>{children}</span>
    </span>
  );
}
