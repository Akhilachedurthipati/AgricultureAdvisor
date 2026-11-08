import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sprout, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../../i18n';

export default function Footer() {
  const { t, i18n } = useTranslation();

  return (
    <footer className="mt-auto border-t border-slate-200/80 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        
        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-8 border-b border-slate-100 text-xs">
          
          {/* Brand Column (Span 2) */}
          <div className="space-y-4 lg:col-span-2">
            <Link to="/" className="flex items-center space-x-3 group inline-block">
              <div className="w-9 h-9 rounded-xl bg-[#123D2A] text-white flex items-center justify-center shadow-xs shrink-0">
                <Sprout className="w-5 h-5 text-[#B6D957]" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-base tracking-tight text-[#123D2A] leading-tight">
                  Agriculture Advisor
                </span>
                <span className="text-[10px] font-semibold tracking-wider uppercase text-slate-400">
                  Precision Agritech Platform
                </span>
              </div>
            </Link>

            <p className="text-slate-500 text-xs leading-relaxed max-w-sm">
              An intelligent agricultural decision-support platform delivering science-backed crop recommendations, precision ICAR/STCR fertilizer calculations, plant foliar disease detection, and multilingual assistance for Indian farmers.
            </p>

            <div className="flex items-center space-x-2 text-[11px] text-slate-400">
              <ShieldCheck className="w-4 h-4 text-[#246B45]" />
              <span>Multi-Tenant Security • Zero Cross-Account Leakage</span>
            </div>
          </div>

          {/* Advisory Services */}
          <div className="space-y-3">
            <span className="font-bold text-[#202923] uppercase tracking-wider text-[11px] block">
              Advisory Services
            </span>
            <ul className="space-y-2 text-slate-600 text-xs">
              <li>
                <Link to="/crop-recommendation" className="hover:text-[#123D2A] transition">
                  Crop Recommendation
                </Link>
              </li>
              <li>
                <Link to="/fertilizer-recommendation" className="hover:text-[#123D2A] transition">
                  Fertilizer Guidance (STCR)
                </Link>
              </li>
              <li>
                <Link to="/disease-detection" className="hover:text-[#123D2A] transition">
                  Foliar Disease Screening
                </Link>
              </li>
              <li>
                <Link to="/weather" className="hover:text-[#123D2A] transition">
                  Weather & Spray Alerts
                </Link>
              </li>
            </ul>
          </div>

          {/* Smart Tools */}
          <div className="space-y-3">
            <span className="font-bold text-[#202923] uppercase tracking-wider text-[11px] block">
              Smart Tools
            </span>
            <ul className="space-y-2 text-slate-600 text-xs">
              <li>
                <Link to="/ai-assistant" className="hover:text-[#123D2A] transition">
                  AI Farming Assistant
                </Link>
              </li>
              <li>
                <Link to="/history" className="hover:text-[#123D2A] transition">
                  Recommendation History
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-[#123D2A] transition">
                  Farmer Dashboard
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-[#123D2A] transition">
                  Farmer Profile & Settings
                </Link>
              </li>
            </ul>
          </div>

          {/* Languages Supported */}
          <div className="space-y-3">
            <span className="font-bold text-[#202923] uppercase tracking-wider text-[11px] block">
              Languages
            </span>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Available in 8 Indian regional languages. Click to switch:
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={async () => {
                    await i18n.changeLanguage(lang.code);
                    localStorage.setItem('agri_preferred_language', lang.code);
                  }}
                  className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition cursor-pointer ${
                    (i18n.language?.substring(0, 2) || 'en') === lang.code
                      ? 'bg-[#123D2A] text-white'
                      : 'bg-[#F7F7F0] hover:bg-[#EBECE1] text-[#202923] border border-slate-200'
                  }`}
                >
                  {lang.nativeName}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Regulatory & Disclaimer Notice */}
        <div className="space-y-4 text-xs text-slate-500">
          <div className="p-4 rounded-2xl bg-[#F7F7F0] border border-[#D7DBC5]/80 text-[#202923] leading-relaxed">
            <p className="font-bold text-[12px] text-[#123D2A] mb-1">
              ⚠️ Official Agricultural Decision-Support System Notice:
            </p>
            <p className="text-[11px] text-slate-600">
              All recommendations generated by Agriculture Advisor—including crop predictions, STCR nutrient formulations, leaf pathology classifications, and meteorological advisories—are computational decision supports based on agro-climatic boundaries and verified reference data. Because micro-climates, soil chemistry, and seed genetics vary across individual fields, farmers are strongly encouraged to cross-reference critical capital or spraying decisions with local agricultural extension officers (Krishi Vigyan Kendras / KVK) and certified soil testing laboratories.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-400 text-xs pt-2">
            <p>© {new Date().getFullYear()} Agriculture Advisor. All rights reserved.</p>
            <div className="flex items-center space-x-6">
              <a href="#about" className="hover:text-[#123D2A] transition">Privacy Policy</a>
              <a href="#about" className="hover:text-[#123D2A] transition">Data Stewardship</a>
              <a href="#scientific-foundation" className="hover:text-[#123D2A] transition">Scientific Models</a>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}
