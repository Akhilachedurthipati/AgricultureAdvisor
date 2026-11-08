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
    <div className="relative min-h-screen flex flex-col justify-between text-white overflow-hidden select-none">
      
      {/* Background Agricultural Image with Cinematic Nature Overlay */}
      <div className="absolute inset-0 -z-10">
        <img
          src={heroImg}
          alt="Vibrant lush green agricultural farm landscape at sunrise"
          className="w-full h-full object-cover object-center filter brightness-[0.88] contrast-[1.08] saturate-[1.12]"
        />
        {/* Soft cinematic gradient overlay to ensure crystal-clear text readability while showcasing the rich farm landscape */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/35 to-black/75" />
      </div>

      {/* Top Header Bar: Logo & Name (Top-Left) + Language Dropdown (Top-Right) */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between z-10">
        {/* Top-Left: Logo & Name */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md text-white flex items-center justify-center shadow-lg border border-white/20 group-hover:scale-105 transition-transform">
            <Sprout className="w-5 h-5 text-[#B6D957]" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white drop-shadow-md leading-tight">
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
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 py-12 max-w-4xl mx-auto z-10 animate-in fade-in duration-500">
        
        {/* Main Heading */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white drop-shadow-lg leading-[1.12]">
          {t('home.heroTitle', 'Grow Smarter. Farm Better.')}
        </h1>

        {/* Short Tagline */}
        <p className="mt-5 text-lg sm:text-2xl text-emerald-100 font-medium max-w-2xl leading-relaxed drop-shadow-md">
          {t('home.heroSubtitle', 'Smart farming guidance for a better harvest.')}
        </p>

        {/* One Prominent Get Started Button */}
        <div className="mt-8 sm:mt-10">
          <Link
            to={isAuthenticated ? "/dashboard" : "/get-started"}
            className="inline-flex items-center justify-center gap-2.5 px-8 sm:px-10 py-3.5 sm:py-4 rounded-2xl font-bold text-base sm:text-lg bg-[#22A06B] hover:bg-[#1B8357] active:bg-[#12603E] text-white shadow-2xl shadow-black/40 hover:shadow-black/60 transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] border border-white/20 cursor-pointer"
          >
            <span>{t('home.getStarted', 'Get Started')}</span>
            <ArrowRight className="w-5 h-5 text-[#B6D957]" />
          </Link>
        </div>

      </main>

      {/* Simple Footer with Copyright */}
      <footer className="w-full py-5 text-center text-xs text-white/70 z-10 border-t border-white/10 backdrop-blur-xs">
        <p>© {new Date().getFullYear()} Agriculture Advisor. All rights reserved.</p>
      </footer>

    </div>
  );
}
