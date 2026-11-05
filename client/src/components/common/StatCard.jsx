import React from 'react';

export default function StatCard({
  label,
  value,
  subtext,
  icon: Icon,
  color = 'agri',
  className = ''
}) {
  const colorMap = {
    agri: {
      bg: 'bg-agri-50 text-agri-700 border-agri-200',
      badge: 'text-agri-800'
    },
    amber: {
      bg: 'bg-amber-50 text-amber-700 border-amber-200',
      badge: 'text-amber-800'
    },
    sky: {
      bg: 'bg-sky-50 text-sky-700 border-sky-200',
      badge: 'text-sky-800'
    },
    rose: {
      bg: 'bg-rose-50 text-rose-700 border-rose-200',
      badge: 'text-rose-800'
    },
    purple: {
      bg: 'bg-purple-50 text-purple-700 border-purple-200',
      badge: 'text-purple-800'
    }
  };

  const activeColor = colorMap[color] || colorMap.agri;

  return (
    <div className={`bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex items-center space-x-3.5 ${className}`}>
      {Icon && (
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${activeColor.bg}`}>
          <Icon className="w-5 h-5" />
        </div>
      )}
      <div className="overflow-hidden">
        <p className="text-xs font-medium text-slate-500 truncate">{label}</p>
        <p className="text-lg font-bold text-slate-900 leading-tight mt-0.5">{value}</p>
        {subtext && <p className="text-[11px] text-slate-400 mt-0.5 truncate">{subtext}</p>}
      </div>
    </div>
  );
}
