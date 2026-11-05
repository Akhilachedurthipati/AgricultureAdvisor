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
      bg: 'bg-emerald-950/5 border-agri-300/80 text-agri-950',
      iconColor: 'text-agri-700',
      defaultIcon: ShieldAlert,
      defaultTitle: 'Important Agronomic Disclaimer'
    }
  };

  const current = config[variant] || config.advisory;
  const DisplayIcon = icon || current.defaultIcon;

  return (
    <div
      role="alert"
      className={`relative p-4 rounded-2xl border text-xs leading-relaxed flex items-start gap-3 shadow-sm ${current.bg} ${className}`}
    >
      <DisplayIcon className={`w-5 h-5 shrink-0 mt-0.5 ${current.iconColor}`} />
      
      <div className="flex-1 space-y-0.5">
        {(title || current.defaultTitle) && (
          <p className="font-bold text-[13px]">{title || current.defaultTitle}</p>
        )}
        {message && <p className="opacity-90">{message}</p>}
        {children}
      </div>

      {dismissible && (
        <button
          type="button"
          onClick={() => setVisible(false)}
          className="p-1 rounded-lg hover:bg-black/5 opacity-60 hover:opacity-100 transition"
          aria-label="Dismiss notice"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

