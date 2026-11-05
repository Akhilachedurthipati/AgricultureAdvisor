import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Sprout, 
  FlaskConical, 
  ScanSearch, 
  CloudSun, 
  Bot, 
  Languages, 
  ShieldCheck, 
  History, 
  MapPin, 
  Sparkles,
  ArrowRight,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();

  const MODULES = [
    {
      id: 1,
      title: 'Crop Recommendation',
      desc: 'Predict the single best-suited crop based on soil and seasonal conditions.',
      icon: Sprout,
      status: 'Phase 4',
      statusType: 'upcoming',
      color: 'from-emerald-500 to-green-600',
      route: '#'
    },
    {
      id: 2,
      title: 'Fertilizer Recommendation',
      desc: 'Calculate N-P-K nutrient requirements and safe application guidelines.',
      icon: FlaskConical,
      status: 'Phase 5',
      statusType: 'upcoming',
      color: 'from-amber-500 to-orange-600',
      route: '#'
    },
    {
      id: 3,
      title: 'Crop Disease Detection',
      desc: 'Scan leaf pictures or use camera to identify crop pathogens and remedies.',
      icon: ScanSearch,
      status: 'Phase 6',
      statusType: 'upcoming',
      color: 'from-rose-500 to-red-600',
      route: '#'
    },
    {
      id: 4,
      title: 'Weather Monitoring & Alerts',
      desc: 'Live agro-meteorology and extreme precipitation / temperature alerts.',
      icon: CloudSun,
      status: 'Phase 7',
      statusType: 'upcoming',
      color: 'from-sky-500 to-blue-600',
      route: '#'
    },
    {
      id: 5,
      title: 'AI Farming Voice Assistant',
      desc: 'Voice & text agricultural chatbot powered by AI and speech recognition.',
      icon: Bot,
      status: 'Phase 9',
      statusType: 'upcoming',
      color: 'from-purple-500 to-indigo-600',
      route: '#'
    },
    {
      id: 6,
      title: 'Multilingual Interface',
      desc: 'Full application translation across 8+ Indian regional languages.',
      icon: Languages,
      status: 'Phase 8',
      statusType: 'upcoming',
      color: 'from-teal-500 to-emerald-700',
      route: '#'
    },
    {
      id: 7,
      title: 'Farmer Authentication',
      desc: 'Secure account authorization, JWT session tokens, and farmer profile.',
      icon: ShieldCheck,
      status: 'Active & Verified',
      statusType: 'active',
      color: 'from-blue-600 to-cyan-600',
      route: '/profile'
    },
    {
      id: 8,
      title: 'Recommendation History',
      desc: 'Audit trail of past predictions, disease scans, and consultation chats.',
      icon: History,
      status: 'Phase 10',
      statusType: 'upcoming',
      color: 'from-stone-600 to-slate-700',
      route: '#'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Farmer Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-agri-900 via-agri-800 to-agri-700 text-white p-6 sm:p-10 shadow-xl shadow-agri-950/15">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 backdrop-blur-md text-agri-200 border border-white/15">
            <UserCheck className="w-3.5 h-3.5 text-agri-300" />
            <span>Authenticated Farmer Session</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            Namaste, <span className="text-agri-300">{user?.name || 'Farmer'}</span>! 🌾
          </h1>
          
          <p className="text-xs sm:text-sm text-agri-100/90 leading-relaxed">
            Welcome to your Agriculture Advisor command center. Choose an advisory service below or manage your farm profile settings.
          </p>

          {/* Farmer Quick Badges */}
          <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-agri-100 border border-white/10">
              <MapPin className="w-3.5 h-3.5 text-agri-300" />
              <span>
                {user?.location?.state 
                  ? `${user.location.district ? `${user.location.district}, ` : ''}${user.location.state}` 
                  : 'Location not set'}
              </span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-agri-100 border border-white/10">
              <Languages className="w-3.5 h-3.5 text-agri-300" />
              <span className="uppercase">{user?.preferredLanguage || 'en'}</span>
            </span>
          </div>
        </div>

        <div className="absolute -right-10 -bottom-10 w-72 h-72 rounded-full bg-agri-500/20 blur-3xl pointer-events-none"></div>
      </div>

      {/* Advisory Modules Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Agriculture Advisor Modules</h2>
            <p className="text-xs text-slate-500">Access all eight core agricultural advisory engines</p>
          </div>
          <span className="text-xs font-semibold text-agri-700 bg-agri-50 px-3 py-1 rounded-full border border-agri-200">
            8 Modules
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {MODULES.map((mod) => {
            const Icon = mod.icon;
            const isActive = mod.statusType === 'active';
            
            return (
              <div
                key={mod.id}
                className={`group relative bg-white rounded-2xl border p-5 shadow-sm transition-all flex flex-col justify-between ${
                  isActive 
                    ? 'border-agri-400 ring-2 ring-agri-500/10 hover:shadow-md' 
                    : 'border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${mod.color} text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                      Module 0{mod.id}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 group-hover:text-agri-700 transition-colors">
                      {mod.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {mod.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className={`font-semibold px-2.5 py-0.5 rounded-full text-[11px] ${
                    isActive 
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {mod.status}
                  </span>

                  {isActive ? (
                    <Link
                      to={mod.route}
                      className="inline-flex items-center gap-1 font-semibold text-agri-700 hover:text-agri-800 transition"
                    >
                      <span>Manage</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  ) : (
                    <span className="text-slate-400 text-[11px]">In Roadmap</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
