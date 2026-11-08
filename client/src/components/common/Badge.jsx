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
    agri: 'bg-[#E8F5EE] text-[#176B45] border-[#C7E7D6]',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    fresh: 'bg-emerald-50 text-[#22A06B] border-emerald-200',
    warning: 'bg-amber-50 text-amber-900 border-amber-200',
    info: 'bg-sky-50 text-sky-800 border-sky-200',
    danger: 'bg-rose-50 text-rose-800 border-rose-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
    earth: 'bg-amber-100/60 text-[#7C5942] border-[#E8DBCA]'
  };

  const sizes = {
    sm: 'text-[10px] px-2 py-0.5 gap-1 font-semibold',
    md: 'text-xs px-2.5 py-0.5 gap-1.5 font-medium',
    lg: 'text-sm px-3.5 py-1 gap-2 font-semibold'
  };

  const pulseColors = {
    agri: 'bg-[#176B45]',
    success: 'bg-emerald-500',
    fresh: 'bg-[#22A06B]',
    warning: 'bg-amber-500',
    info: 'bg-sky-500',
    danger: 'bg-rose-500',
    neutral: 'bg-slate-400',
    earth: 'bg-[#7C5942]'
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
