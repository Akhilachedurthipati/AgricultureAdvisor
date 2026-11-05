import React from 'react';

export default function Card({
  title,
  subtitle,
  icon: Icon,
  action,
  children,
  footer,
  hoverable = false,
  className = '',
  headerClassName = '',
  bodyClassName = '',
  ...props
}) {
  return (
    <div
      className={`bg-white rounded-3xl border border-slate-200/80 shadow-sm ${
        hoverable ? 'hover:shadow-md hover:border-agri-300 transition-all duration-200' : ''
      } ${className}`}
      {...props}
    >
      {(title || Icon || action) && (
        <div className={`p-5 sm:p-6 pb-0 flex items-start justify-between gap-4 ${headerClassName}`}>
          <div className="flex items-center space-x-3">
            {Icon && (
              <div className="w-10 h-10 rounded-xl bg-agri-50 text-agri-700 flex items-center justify-center shrink-0 border border-agri-100 shadow-sm">
                <Icon className="w-5 h-5" />
              </div>
            )}
            <div>
              {title && <h3 className="font-bold text-slate-900 text-base sm:text-lg leading-tight">{title}</h3>}
              {subtitle && <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{subtitle}</p>}
            </div>
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}

      <div className={`p-5 sm:p-6 ${bodyClassName}`}>
        {children}
      </div>

      {footer && (
        <div className="px-5 sm:px-6 py-4 bg-slate-50/70 border-t border-slate-100 rounded-b-3xl">
          {footer}
        </div>
      )}
    </div>
  );
}
