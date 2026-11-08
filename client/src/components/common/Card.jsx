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
      className={`bg-white rounded-2xl border border-slate-200/80 shadow-subtle ${
        hoverable ? 'hover:shadow-card-hover hover:border-[#246B45]/40 transition-all duration-200' : ''
      } ${className}`}
      {...props}
    >
      {(title || Icon || action) && (
        <div className={`p-5 sm:p-6 pb-0 flex items-start justify-between gap-4 ${headerClassName}`}>
          <div className="flex items-center space-x-3">
            {Icon && (
              <div className="w-10 h-10 rounded-xl bg-[#F7F7F0] text-[#123D2A] flex items-center justify-center shrink-0 border border-[#D7DBC5] shadow-xs">
                <Icon className="w-5 h-5 text-[#246B45]" />
              </div>
            )}
            <div>
              {title && <h3 className="font-bold text-[#202923] text-base sm:text-lg leading-tight tracking-tight">{title}</h3>}
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
        <div className="px-5 sm:px-6 py-3.5 bg-[#F7F7F0]/60 border-t border-slate-100 rounded-b-2xl">
          {footer}
        </div>
      )}
    </div>
  );
}
