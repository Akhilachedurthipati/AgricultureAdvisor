import React, { useState } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X, ShieldAlert } from 'lucide-react';

export default function AlertBanner({
  title,
  message,
  variant = 'advisory',
  dismissible = false,
  icon,
  className = '',
  children
}) {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  const config = {
    advisory: {
      bg: 'bg-amber-50/90 border-amber-300 text-amber-900',
      iconColor: 'text-amber-600',
      defaultIcon: AlertTriangle,
      defaultTitle: 'Agricultural Advisory Notice'
    },
    info: {
      bg: 'bg-sky-50 border-sky-200 text-sky-900',
      iconColor: 'text-sky-600',
      defaultIcon: Info,
      defaultTitle: 'Information'
    },
    success: {
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-900',
      iconColor: 'text-emerald-600',
      defaultIcon: CheckCircle2,
      defaultTitle: 'Success'
    },
    danger: {
      bg: 'bg-rose-50 border-rose-200 text-rose-900',
      iconColor: 'text-rose-600',
      defaultIcon: AlertCircle,
      defaultTitle: 'Warning'
    },
    disclaimer: {
      bg: 'bg-[#F7F7F0] border-[#D7DBC5] text-[#123D2A]',
      iconColor: 'text-[#246B45]',
      defaultIcon: ShieldAlert,
      defaultTitle: 'Important Agronomic Advisory Notice'
    }
  };

  const current = config[variant] || config.advisory;
  const DisplayIcon = icon || current.defaultIcon;

  return (
    <div
      role="alert"
      className={`relative p-4 rounded-2xl border text-xs leading-relaxed flex items-start gap-3 shadow-subtle ${current.bg} ${className}`}
    >
      <DisplayIcon className={`w-5 h-5 shrink-0 mt-0.5 ${current.iconColor}`} />
      
      <div className="flex-1 space-y-0.5">
        {(title || current.defaultTitle) && (
          <p className="font-bold text-[13px] tracking-tight">{title || current.defaultTitle}</p>
        )}
        {message && <p className="opacity-90">{message}</p>}
        {children}
      </div>

      {dismissible && (
        <button
          type="button"
          onClick={() => setVisible(false)}
          className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-black/5 transition cursor-pointer"
          aria-label="Dismiss alert"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
