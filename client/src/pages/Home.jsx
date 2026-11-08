import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Sprout, 
  FlaskConical, 
  ScanSearch, 
  CloudSun, 
  Bot, 
  Languages, 
  UserCheck, 
  History, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Leaf,
  Layers,
  HeartHandshake,
  TrendingUp,
  Sun,
  Compass
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import heroImg from '../assets/hero.png';

export default function Home() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();

  const SERVICES = [
    {
      id: 'crop',
      title: t('crop.title', 'Crop Recommendation'),
      desc: 'Predict the single most optimal crop for your land based on soil type, season, and regional climate.',
      icon: Sprout,
      link: '/crop-recommendation',
      color: 'bg-emerald-50 text-[#176B45] group-hover:bg-[#176B45] group-hover:text-white',
      accent: 'hover:border-[#22A06B]'
    },
    {
      id: 'fertilizer',
      title: t('fertilizer.title', 'Fertilizer Recommendation'),
      desc: 'Calculate exact N-P-K nutrient replenishment, 50-kg commercial bag counts, and 3-stage split application schedules.',
      icon: FlaskConical,
      link: '/fertilizer-recommendation',
      color: 'bg-amber-50 text-amber-700 group-hover:bg-amber-600 group-hover:text-white',
      accent: 'hover:border-amber-500'
    },
    {
      id: 'disease',
      title: t('disease.title', 'Crop Disease Detection'),
      desc: 'Analyze leaf photos or use your camera to identify pathologies across 7 target crops with organic remedies.',
      icon: ScanSearch,
      link: '/disease-detection',
      color: 'bg-rose-50 text-rose-700 group-hover:bg-rose-600 group-hover:text-white',
      accent: 'hover:border-rose-500'
    },
    {
      id: 'weather',
      title: t('weather.title', 'Weather Monitoring'),
      desc: 'Real-time forecasts and localized alerts for heavy rain, heatwaves, and favorable spraying windows.',
      icon: CloudSun,
      link: '/weather',
      color: 'bg-sky-50 text-sky-700 group-hover:bg-sky-600 group-hover:text-white',
      accent: 'hover:border-sky-500'
    },
    {
      id: 'ai-assistant',
      title: t('nav.aiAssistant', 'AI Farming Assistant'),
      desc: 'Ask questions in English, Telugu, or Hindi with speech recognition, voice readout, and agronomic knowledge.',
      icon: Bot,
      link: '/ai-assistant',
      color: 'bg-purple-50 text-purple-700 group-hover:bg-purple-600 group-hover:text-white',
      accent: 'hover:border-purple-500'
    },
    {
      id: 'language',
      title: t('nav.selectLanguage', 'Multilingual Support'),
      desc: 'Full translation into 8 Indian regional languages including English, Telugu, Hindi, Tamil, Kannada, Marathi, Malayalam, and Bengali.',
      icon: Languages,
      link: isAuthenticated ? '/profile' : '/register',
      color: 'bg-teal-50 text-teal-700 group-hover:bg-teal-600 group-hover:text-white',
      accent: 'hover:border-teal-500'
    },
    {
      id: 'profile',
      title: t('nav.farmerProfile', 'Farmer Profile'),
      desc: 'Personalized account with saved farm location, language preferences, and strict multi-tenant data privacy.',
      icon: UserCheck,
      link: isAuthenticated ? '/profile' : '/register',
      color: 'bg-blue-50 text-blue-700 group-hover:bg-blue-600 group-hover:text-white',
      accent: 'hover:border-blue-500'
    },
    {
      id: 'history',
      title: t('nav.history', 'Recommendation History'),
      desc: 'Comprehensive personal audit trail of your past crop recommendations, fertilizer schedules, and leaf scans.',
      icon: History,
      link: '/history',
      color: 'bg-slate-100 text-slate-700 group-hover:bg-slate-800 group-hover:text-white',
      accent: 'hover:border-slate-500'
    }
  ];

  return (
    <div className="space-y-16 pb-12">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#E8F5EE] via-[#F7FAF7] to-white border border-[#C7E7D6] p-6 sm:p-10 lg:p-14 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-white text-[#176B45] border border-[#C7E7D6] shadow-xs">
              <Sprout className="w-4 h-4 text-[#22A06B]" />
              <span>India's Intelligent Agricultural Platform</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#1F2937] leading-[1.12]">
              Grow Smarter. <br />
              <span className="text-[#176B45]">Farm Better.</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl">
              Empowering farmers with intelligent crop recommendations, precision fertilizer schedules, instant disease detection, and multilingual AI guidance tailored for your land.
            </p>

            <div className="flex flex-wrap items-center gap-3.5 pt-1">
              <Link
                to={isAuthenticated ? "/dashboard" : "/register"}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#176B45] hover:bg-[#114F33] text-white font-bold text-sm shadow-sm transition cursor-pointer"
              >
                <span>{isAuthenticated ? "Open Dashboard" : "Get Started"}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <a
                href="#services"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-[#1F2937] font-semibold text-sm border border-slate-200 shadow-xs transition cursor-pointer"
              >
                <span>Explore Services</span>
              </a>
            </div>

            {/* Quick trust metrics */}
            <div className="pt-3 grid grid-cols-3 gap-3 border-t border-[#C7E7D6]/60 text-xs text-slate-600">
              <div>
                <p className="font-extrabold text-[#176B45] text-base sm:text-lg">1 Single</p>
                <p className="text-[11px] text-slate-500">Optimal crop output</p>
              </div>
              <div>
                <p className="font-extrabold text-[#176B45] text-base sm:text-lg">8 Regional</p>
                <p className="text-[11px] text-slate-500">Indian languages</p>
              </div>
              <div>
                <p className="font-extrabold text-[#176B45] text-base sm:text-lg">100% Free</p>
                <p className="text-[11px] text-slate-500">For every farmer</p>
              </div>
            </div>
          </div>

          {/* Right Visual Column (Lush Green Farm Illustration) */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-md rounded-2xl overflow-hidden shadow-lg border border-[#C7E7D6] bg-white group">
              <div className="aspect-4/3 overflow-hidden bg-emerald-900 relative">
                {heroImg ? (
                  <img 
                    src={heroImg} 
                    alt="Lush green agricultural crop field" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#176B45] via-[#22A06B] to-emerald-800 flex items-center justify-center p-6 text-white text-center">
                    <Sprout className="w-16 h-16 text-[#A3E635]" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-5">
                  <div className="text-white">
                    <p className="font-bold text-sm sm:text-base">Science-Backed Precision Farming</p>
                    <p className="text-xs text-emerald-100">Tailored for Indian agro-climatic zones</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. SERVICES SECTION */}
      <section id="services" className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#176B45]">
            Comprehensive Advisory Suite
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#1F2937] tracking-tight">
            Everything Your Farm Needs
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Eight specialized tools designed to guide you through crop selection, nutrient management, disease screening, and daily weather decisions.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {SERVICES.map((service) => {
            const Icon = service.icon;
            return (
              <Link
                key={service.id}
                to={service.link}
                className={`group bg-white rounded-2xl border border-slate-200/90 p-5 shadow-card hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between ${service.accent}`}
              >
                <div className="space-y-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors shadow-xs ${service.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <div>
                    <h3 className="font-bold text-[#1F2937] group-hover:text-[#176B45] transition-colors text-base leading-snug">
                      {service.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                      {service.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#176B45]">
                  <span>Explore</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 3. HOW AGRICULTURE ADVISOR HELPS FARMERS */}
      <section className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-12 shadow-card space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#176B45]">
            Simple Step-by-Step Workflow
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1F2937] tracking-tight">
            How Agriculture Advisor Helps Farmers
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Four simple steps to transform scientific agricultural knowledge into greater crop productivity.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-5 rounded-2xl bg-[#F7FAF7] border border-slate-200/80 space-y-2.5">
            <div className="w-8 h-8 rounded-full bg-[#176B45] text-white font-extrabold text-sm flex items-center justify-center">
              1
            </div>
            <h3 className="font-bold text-[#1F2937] text-sm">Provide Field Metrics</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Enter your soil type, season, land area, or upload a photo of an affected plant leaf.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#F7FAF7] border border-slate-200/80 space-y-2.5">
            <div className="w-8 h-8 rounded-full bg-[#176B45] text-white font-extrabold text-sm flex items-center justify-center">
              2
            </div>
            <h3 className="font-bold text-[#1F2937] text-sm">Intelligent Evaluation</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Trained machine learning models and ICAR STCR agronomic formulas process your inputs.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#F7FAF7] border border-slate-200/80 space-y-2.5">
            <div className="w-8 h-8 rounded-full bg-[#176B45] text-white font-extrabold text-sm flex items-center justify-center">
              3
            </div>
            <h3 className="font-bold text-[#1F2937] text-sm">Actionable Advisory</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Get one optimal crop recommendation, exact 50-kg fertilizer bag counts, or disease remedies.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#F7FAF7] border border-slate-200/80 space-y-2.5">
            <div className="w-8 h-8 rounded-full bg-[#176B45] text-white font-extrabold text-sm flex items-center justify-center">
              4
            </div>
            <h3 className="font-bold text-[#1F2937] text-sm">Audit & Track Records</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Every consultation is securely saved to your personal history for seasonal farm recordkeeping.
            </p>
          </div>
        </div>
      </section>

      {/* 4. BENEFITS STRIP */}
      <section className="bg-gradient-to-br from-[#176B45] to-[#114F33] text-white rounded-3xl p-8 sm:p-12 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-xs">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-[#A3E635]" />
            </div>
            <h3 className="text-base font-bold text-white">Trustworthy & ICAR Aligned</h3>
            <p className="text-emerald-100/90 leading-relaxed">
              Formulations follow standard Soil Test Crop Response (STCR) principles to safeguard soil health and prevent over-application.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <Languages className="w-5 h-5 text-[#A3E635]" />
            </div>
            <h3 className="text-base font-bold text-white">Accessible in 8 Languages</h3>
            <p className="text-emerald-100/90 leading-relaxed">
              Farmers can ask questions through voice or text in their native regional language with instant bilingual speech playback.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <HeartHandshake className="w-5 h-5 text-[#A3E635]" />
            </div>
            <h3 className="text-base font-bold text-white">Farmer-First Privacy</h3>
            <p className="text-emerald-100/90 leading-relaxed">
              Strict multi-tenant security ensures your farm location, soil data, and diagnosis reports remain private to your account.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
