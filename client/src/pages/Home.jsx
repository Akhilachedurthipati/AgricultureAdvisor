import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sprout, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LanguageSelector from '../components/common/LanguageSelector';
import heroImg from '../assets/farming-hero.jpg';

export default function Home() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-hidden select-none isolate">
      
      {/* Background Agricultural Image (properly positioned with positive stacking context) */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          src={heroImg}
          alt="Lush green agricultural farm landscape at sunrise"
          className="w-full h-full object-cover object-center filter brightness-[0.96] contrast-[1.06]"
        />
        {/* Soft, natural overlay that highlights the lush farm landscape while keeping text 100% crisp and readable */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#F7F7F0]/80 via-[#F7F7F0]/50 to-[#F7F7F0]/85" />
      </div>

      {/* Top Header Bar: Logo & Name (Top-Left) + Language Dropdown (Top-Right) */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
        {/* Top-Left: Logo & Name */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-2xl bg-[#123D2A] text-white flex items-center justify-center shadow-md border border-[#246B45]/40 group-hover:scale-105 transition-transform">
            <Sprout className="w-5 h-5 text-[#B6D957]" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg sm:text-xl tracking-tight text-[#123D2A] leading-tight">
              Agriculture Advisor
            </span>
          </div>
        </Link>

        {/* Top-Right: Language Selection Dropdown */}
        <div className="flex items-center">
          <LanguageSelector compact />
        </div>
      </header>

      {/* Center Content: Heading, Tagline & Get Started Button */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 py-12 max-w-4xl mx-auto animate-in fade-in duration-300">
        
        {/* Main Heading */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#123D2A] leading-[1.12]">
          {t('home.heroTitle', 'Grow Smarter. Farm Better.')}
        </h1>

        {/* Short Tagline */}
        <p className="mt-5 text-lg sm:text-2xl text-slate-700 font-medium max-w-2xl leading-relaxed">
          {t('home.heroSubtitle', 'Smart farming guidance for a better harvest.')}
        </p>

        {/* One Prominent Get Started Button */}
        <div className="mt-8 sm:mt-10">
          <Link
            to={isAuthenticated ? "/dashboard" : "/get-started"}
            className="inline-flex items-center justify-center gap-2.5 px-8 sm:px-10 py-3.5 sm:py-4 rounded-2xl font-bold text-base sm:text-lg bg-[#123D2A] hover:bg-[#1D5939] active:bg-[#0B261A] text-white shadow-xl shadow-[#123D2A]/25 hover:shadow-[#123D2A]/35 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <span>{t('home.getStarted', 'Get Started')}</span>
            <ArrowRight className="w-5 h-5 text-[#B6D957]" />
          </Link>
        </div>

      </main>

      {/* Simple Footer with Copyright */}
      <footer className="relative z-10 w-full py-5 text-center text-xs text-slate-600 border-t border-slate-300/40">
        <p>© {new Date().getFullYear()} Agriculture Advisor. All rights reserved.</p>
      </footer>

    </div>
  );
}
