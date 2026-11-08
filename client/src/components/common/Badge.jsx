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
    agri: 'bg-[#F7F7F0] text-[#123D2A] border-[#D7DBC5]',
    forest: 'bg-[#123D2A]/10 text-[#123D2A] border-[#123D2A]/20',
    rich: 'bg-[#246B45]/10 text-[#246B45] border-[#246B45]/25',
    lime: 'bg-[#B6D957]/20 text-[#123D2A] border-[#B6D957]/40 font-semibold',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    fresh: 'bg-emerald-50 text-[#246B45] border-emerald-200',
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
    agri: 'bg-[#123D2A]',
    forest: 'bg-[#123D2A]',
    rich: 'bg-[#246B45]',
    lime: 'bg-[#B6D957]',
    success: 'bg-emerald-500',
    fresh: 'bg-[#246B45]',
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
