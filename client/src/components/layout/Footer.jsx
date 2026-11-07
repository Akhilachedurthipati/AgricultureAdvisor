import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sprout, ShieldCheck, Heart } from 'lucide-react';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="mt-auto border-t border-slate-200/80 bg-white/90 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="space-y-1.5 max-w-sm">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-agri-600 text-white flex items-center justify-center shadow-sm">
                <Sprout className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-base tracking-tight text-agri-950">
                {t('common.appName', 'AGRICULTURE ADVISOR')}
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              {t('home.heroSubtitle', 'AI-powered multilingual agricultural decision support platform. B.Tech Computer Science and Engineering (Artificial Intelligence and Machine Learning) Major Project.')}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-xs">
            <div className="space-y-2">
              <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block">
                {t('nav.modules', 'Advisory Engines')}
              </span>
              <ul className="space-y-1.5 text-slate-500">
                <li><Link to="/crop-recommendation" className="hover:text-agri-700 transition">{t('nav.cropAdvisory', 'Crop Advisory')}</Link></li>
                <li><Link to="/fertilizer-recommendation" className="hover:text-agri-700 transition">{t('nav.fertilizer', 'Fertilizer Advisory')}</Link></li>
                <li><Link to="/disease-detection" className="hover:text-agri-700 transition">{t('nav.diseaseDetection', 'Disease Detection')}</Link></li>
              </ul>
            </div>

            <div className="space-y-2">
              <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block">
                {t('home.features.title', 'Intelligence')}
              </span>
              <ul className="space-y-1.5 text-slate-500">
                <li><Link to="/weather" className="hover:text-agri-700 transition">{t('nav.weather', 'Weather Alerts')}</Link></li>
                <li><Link to="/ai-assistant" className="hover:text-agri-700 transition">{t('nav.aiAssistant', 'AI Farming Assistant')}</Link></li>
                <li><Link to="/history" className="hover:text-agri-700 transition">{t('nav.history', 'Recommendation History')}</Link></li>
              </ul>
            </div>

            <div className="space-y-2 col-span-2 sm:col-span-1">
              <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block">
                {t('nav.farmerProfile', 'Account')}
              </span>
              <ul className="space-y-1.5 text-slate-500">
                <li><Link to="/dashboard" className="hover:text-agri-700 transition">{t('nav.dashboard', 'Dashboard')}</Link></li>
                <li><Link to="/profile" className="hover:text-agri-700 transition">{t('nav.farmerProfile', 'Farmer Profile')}</Link></li>
                <li><Link to="/login" className="hover:text-agri-700 transition">{t('nav.login', 'Sign In')}</Link></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Disclaimer Notice */}
        <div className="text-[11px] text-slate-400 leading-relaxed text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            ⚠️ <strong>{t('common.preliminaryNotice', 'Agronomic Disclaimer')}:</strong> {t('common.disclaimer', 'All recommendations are computational advisories and do not guarantee agricultural yields. Always confirm with certified local agricultural officers or soil testing laboratories.')}
          </p>
          <p className="shrink-0 font-medium text-slate-500">
            © {new Date().getFullYear()} {t('common.appName', 'AGRICULTURE ADVISOR')}
          </p>
        </div>

      </div>
    </footer>
  );
}

