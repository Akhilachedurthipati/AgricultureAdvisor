import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Languages, Check, ChevronDown } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../../i18n';
import { useAuth } from '../../context/AuthContext';

export default function LanguageSelector({ compact = false }) {
  const { i18n, t } = useTranslation();
  const { user, updateProfile, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentLang = SUPPORTED_LANGUAGES.find(l => l.code === (i18n.language?.substring(0, 2) || 'en')) || SUPPORTED_LANGUAGES[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = async (code) => {
    try {
      await i18n.changeLanguage(code);
      localStorage.setItem('agri_preferred_language', code);
      setIsOpen(false);

      // If user is authenticated and updateProfile is available, update preference in background
      if (isAuthenticated && typeof updateProfile === 'function') {
        try {
          await updateProfile({ preferredLanguage: code });
        } catch {
          // Ignore background sync errors
        }
      }
    } catch (err) {
      console.warn('Failed to switch language:', err);
    }
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label={t('nav.selectLanguage', 'Select Language')}
        className={`flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition font-medium shadow-sm ${
          compact ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-xs'
        } ${isOpen ? 'ring-2 ring-agri-500/20 border-agri-500' : ''}`}
      >
        <Languages className="w-4 h-4 text-agri-600 shrink-0" />
        <span className="font-bold text-slate-800">{currentLang.nativeName}</span>
        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-64 rounded-2xl bg-white shadow-2xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 origin-top-right focus:outline-none"
          role="menu"
        >
          <div className="px-3.5 py-1.5 border-b border-slate-100 mb-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              {t('nav.selectLanguage', 'Select Language')} (8 Indian Languages)
            </span>
          </div>

          <div className="max-h-72 overflow-y-auto py-1 divide-y divide-slate-50">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = lang.code === currentLang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`w-full flex items-center justify-between px-3.5 py-2 text-left transition ${
                    isSelected
                      ? 'bg-agri-50/80 text-agri-900 font-bold'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-agri-700'
                  }`}
                  role="menuitem"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-bold leading-tight">
                      {lang.nativeName}
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      {lang.name} • {lang.region}
                    </span>
                  </div>

                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-agri-600 text-white flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

