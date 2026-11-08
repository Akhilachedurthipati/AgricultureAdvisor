import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sprout, LogIn, UserPlus, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LanguageSelector from '../components/common/LanguageSelector';

export default function GetStarted() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();

  // If already authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#F7F7F0] text-[#202923] select-none">
      
      {/* Top Header Bar: Logo on Left, Language Dropdown on Right */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between border-b border-slate-200/80 bg-white/70 backdrop-blur-sm">
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-9 h-9 rounded-xl bg-[#123D2A] text-white flex items-center justify-center shadow-xs border border-[#246B45]/30">
            <Sprout className="w-5 h-5 text-[#B6D957]" />
          </div>
          <span className="font-extrabold text-base tracking-tight text-[#123D2A] leading-tight">
            Agriculture Advisor
          </span>
        </Link>

        <div className="flex items-center">
          <LanguageSelector compact />
        </div>
      </header>

      {/* Main Selection Area */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-12 max-w-4xl mx-auto w-full animate-in fade-in duration-300">
        
        {/* Title & Subtitle */}
        <div className="text-center space-y-2 mb-10 max-w-xl">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#202923]">
            {t('getStartedPage.title', 'Get Started with Agriculture Advisor')}
          </h1>
          <p className="text-sm sm:text-base text-slate-600">
            {t('getStartedPage.subtitle', 'Choose how you would like to proceed')}
          </p>
        </div>

        {/* 2 Clean Options: Login vs Register */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
          
          {/* Option 1: Existing Farmer Login */}
          <Link
            to="/login"
            className="bg-white rounded-3xl border border-slate-200/90 p-8 shadow-subtle hover:shadow-premium hover:border-[#123D2A]/40 transition-all duration-200 flex flex-col justify-between group cursor-pointer text-left"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#123D2A]/10 text-[#123D2A] flex items-center justify-center group-hover:bg-[#123D2A] group-hover:text-white transition-colors">
                <LogIn className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h2 className="text-xl font-extrabold text-[#202923] group-hover:text-[#123D2A] transition-colors">
                  {t('getStartedPage.loginTitle', 'Farmer Login')}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {t('getStartedPage.loginDesc', 'Already registered? Sign in to access your farm dashboard and advisory records.')}
                </p>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex items-center justify-between mt-6">
              <span className="text-xs font-bold text-[#123D2A] group-hover:underline">
                Sign In to Account
              </span>
              <ArrowRight className="w-4 h-4 text-[#246B45] group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Option 2: New Farmer Registration */}
          <Link
            to="/register"
            className="bg-white rounded-3xl border border-slate-200/90 p-8 shadow-subtle hover:shadow-premium hover:border-[#123D2A]/40 transition-all duration-200 flex flex-col justify-between group cursor-pointer text-left"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#B6D957]/30 text-[#123D2A] flex items-center justify-center group-hover:bg-[#123D2A] group-hover:text-white transition-colors">
                <UserPlus className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h2 className="text-xl font-extrabold text-[#202923] group-hover:text-[#123D2A] transition-colors">
                  {t('getStartedPage.registerTitle', 'Farmer Registration')}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {t('getStartedPage.registerDesc', 'New farmer? Create an account to get personalized crop and fertilizer recommendations.')}
                </p>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex items-center justify-between mt-6">
              <span className="text-xs font-bold text-[#123D2A] group-hover:underline">
                Create New Account
              </span>
              <ArrowRight className="w-4 h-4 text-[#246B45] group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

        </div>

        {/* Back Link to Home */}
        <div className="mt-8 text-center">
          <Link to="/" className="text-xs font-semibold text-slate-500 hover:text-[#123D2A] transition">
            ← Back to Homepage
          </Link>
        </div>

      </main>

      {/* Simple Footer */}
      <footer className="w-full py-5 text-center text-xs text-slate-500 border-t border-slate-200/80">
        <p>© {new Date().getFullYear()} Agriculture Advisor. All rights reserved.</p>
      </footer>

    </div>
  );
}

