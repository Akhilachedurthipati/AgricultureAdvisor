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
  CloudRain,
  Sun,
  Activity
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LanguageSelector from '../components/common/LanguageSelector';

export default function Home() {
  const { t } = useTranslation();
  const { isAuthenticated, user } = useAuth();

  const MODULES = [
    {
      id: 'crop',
      title: t('crop.title', 'Crop Recommendation'),
      desc: t('crop.subtitle', 'Get the single most optimal crop recommendation for your land based on soil type, season, temperature, rainfall, and pH.'),
      icon: Sprout,
      link: '/crop-recommendation',
      tag: 'Machine Learning',
      accent: 'border-emerald-200 hover:border-[#22A06B]'
    },
    {
      id: 'fertilizer',
      title: t('fertilizer.title', 'Fertilizer Guidance'),
      desc: t('fertilizer.subtitle', 'Precision NPK nutrient replenishment dosages, standard 50-kg bag counts, and 3-stage split application schedules.'),
      icon: FlaskConical,
      link: '/fertilizer-recommendation',
      tag: 'Nutrient Engine',
      accent: 'border-amber-200 hover:border-amber-500'
    },
    {
      id: 'disease',
      title: t('disease.title', 'Crop Disease Detection'),
      desc: t('disease.subtitle', 'Visual foliar pathology screening across 7 major crops with instant severity assessment and organic/chemical remedies.'),
      icon: ScanSearch,
      link: '/disease-detection',
      tag: 'Visual Diagnosis',
      accent: 'border-rose-200 hover:border-rose-500'
    },
    {
      id: 'weather',
      title: t('weather.title', 'Weather & Farmer Alerts'),
      desc: t('weather.subtitle', 'Live meteorological data, 7-day agricultural forecasts, and automated warnings for heavy rainfall and spraying windows.'),
      icon: CloudSun,
      link: '/weather',
      tag: 'Forecast & Alerts',
      accent: 'border-sky-200 hover:border-sky-500'
    },
    {
      id: 'ai-assistant',
      title: t('nav.aiAssistant', 'AI Farming Assistant'),
      desc: 'Multilingual conversational farming assistant with voice input, speech readout, and curated agronomic knowledge base.',
      icon: Bot,
      link: '/ai-assistant',
      tag: 'Voice & Chat',
      accent: 'border-purple-200 hover:border-purple-500'
    },
    {
      id: 'language',
      title: t('nav.selectLanguage', 'Multilingual Support'),
      desc: 'Fully translated into 8 Indian regional languages including English, Telugu, Hindi, Tamil, Kannada, Marathi, Malayalam, and Bengali.',
      icon: Languages,
      link: isAuthenticated ? '/profile' : '/register',
      tag: '8 Languages',
      accent: 'border-teal-200 hover:border-teal-500'
    },
    {
      id: 'profile',
      title: t('nav.farmerProfile', 'Farmer Registration & Profile'),
      desc: 'Secure personalized accounts with localized district preferences, soil history context, and multi-tenant data isolation.',
      icon: UserCheck,
      link: isAuthenticated ? '/profile' : '/register',
      tag: 'Personalized',
      accent: 'border-blue-200 hover:border-blue-500'
    },
    {
      id: 'history',
      title: t('nav.history', 'Recommendation History'),
      desc: 'Comprehensive centralized audit trail of past crop plans, fertilizer dosages, leaf scans, and voice consultations.',
      icon: History,
      link: '/history',
      tag: 'Audit Trail',
      accent: 'border-slate-200 hover:border-slate-500'
    }
  ];

  return (
    <div className="space-y-12 pb-8">
      
      {/* Welcome Section */}
      <section className="relative overflow-hidden rounded-3xl bg-white border border-slate-200/90 shadow-card p-6 sm:p-10 lg:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Welcome Text Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#E8F5EE] text-[#176B45] border border-[#C7E7D6]">
                <Sparkles className="w-3.5 h-3.5 text-[#22A06B]" />
                Intelligent Agricultural Advisory
              </span>
              <div className="sm:hidden">
                <LanguageSelector compact />
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#1F2937] leading-[1.15]">
              Smart Farming <br className="hidden sm:inline" />
              <span className="text-[#176B45]">Starts Here</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl">
              Get intelligent crop recommendations, fertilizer guidance, crop disease detection and weather insights to make better farming decisions.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#176B45] hover:bg-[#114F33] text-white font-semibold text-sm shadow-sm transition cursor-pointer"
                >
                  <span>Open Farmer Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#176B45] hover:bg-[#114F33] text-white font-semibold text-sm shadow-sm transition cursor-pointer"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-[#1F2937] font-semibold text-sm border border-slate-200 shadow-xs transition cursor-pointer"
                  >
                    <span>Login</span>
                  </Link>
                </>
              )}
            </div>

            {/* Quick Feature Checklist */}
            <div className="pt-2 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-slate-600 border-t border-slate-100">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#22A06B] shrink-0" />
                <span>One Best Crop Output</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#22A06B] shrink-0" />
                <span>Precision STCR Fertilizer</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#22A06B] shrink-0" />
                <span>Voice in 8 Languages</span>
              </div>
            </div>
          </div>

          {/* Agricultural Graphic / Interactive Preview Column */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl bg-gradient-to-br from-[#E8F5EE] via-[#F7FAF7] to-white p-6 border border-[#C7E7D6]/60 shadow-sm space-y-4">
              
              <div className="flex items-center justify-between pb-3 border-b border-[#C7E7D6]/40">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-[#176B45] text-white flex items-center justify-center shadow-xs">
                    <Leaf className="w-4 h-4 text-[#A3E635]" />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-[#1F2937]">Farm Health Snapshot</h2>
                    <p className="text-[10px] text-slate-500">Live decision indicators</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-[#176B45]">
                  Active Telemetry
                </span>
              </div>

              {/* Sample Cards inside illustration */}
              <div className="space-y-2.5">
                <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 text-[#176B45] flex items-center justify-center">
                      <Sprout className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#1F2937]">Optimal Crop Match</p>
                      <p className="text-[10px] text-slate-500">Soil: Black Cotton • Kharif</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#176B45]">Pigeonpeas (99%)</span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                      <CloudSun className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#1F2937]">Spraying Window</p>
                      <p className="text-[10px] text-slate-500">Calm Winds &lt; 10 km/h</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-sky-700">Favorable</span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#1F2937]">AI Assistant</p>
                      <p className="text-[10px] text-slate-500">Voice in English, Telugu, Hindi</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-purple-700">Ready</span>
                </div>
              </div>

              <div className="pt-2 text-center">
                <span className="text-[11px] font-medium text-slate-500">
                  Reliable agronomic decision support for Indian agriculture
                </span>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* Services Grid (8 Main Modules) */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#176B45] block">
              Core Capabilities
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1F2937] tracking-tight mt-0.5">
              Agricultural Advisory Services
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md">
            Everything a farmer needs to plan, protect, and optimize crop yields across every season.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {MODULES.map((module) => {
            const Icon = module.icon;
            return (
              <Link
                key={module.id}
                to={module.link}
                className={`group bg-white rounded-2xl border p-5 shadow-card hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between ${module.accent}`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-11 h-11 rounded-xl bg-[#E8F5EE] text-[#176B45] flex items-center justify-center group-hover:bg-[#176B45] group-hover:text-white transition-colors shadow-xs">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                      {module.tag}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-[#1F2937] group-hover:text-[#176B45] transition-colors text-base leading-snug">
                      {module.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                      {module.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#176B45] group-hover:text-[#114F33]">
                  <span>Access Service</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Trust & Principles Strip */}
      <section className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-600">
          <div className="flex items-start space-x-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#176B45] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-sm">Agronomic Integrity</h4>
              <p className="text-slate-500 mt-0.5 leading-relaxed">
                Single-crop guarantees and ICAR-aligned Soil Test Crop Response (STCR) calculations designed to avoid farmer confusion.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
              <CloudSun className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-sm">Actionable Intelligence</h4>
              <p className="text-slate-500 mt-0.5 leading-relaxed">
                Weather alerts with specific operational advice for spraying, heatwaves, and moisture management.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Languages className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-sm">Inclusive & Accessible</h4>
              <p className="text-slate-500 mt-0.5 leading-relaxed">
                Complete regional language support and conversational speech recognition allowing farmers to ask questions naturally.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
