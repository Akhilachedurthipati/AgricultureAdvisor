import React, { useState, useEffect } from 'react';
import { 
  Sprout, 
  FlaskConical, 
  ScanSearch, 
  CloudSun, 
  Bot, 
  Languages, 
  ShieldCheck, 
  History, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Server,
  Layers,
  ArrowRight
} from 'lucide-react';
import { checkBackendHealth } from './services/api';

const MODULES = [
  {
    id: 1,
    title: 'Crop Recommendation',
    desc: 'Intelligent single best-suited crop advisory based on climate and soil metrics.',
    icon: Sprout,
    status: 'Planned (Phase 4)',
    color: 'from-emerald-500 to-green-600'
  },
  {
    id: 2,
    title: 'Fertilizer Recommendation',
    desc: 'Precision NPK and soil-tailored nutrient dosage with safety precautions.',
    icon: FlaskConical,
    status: 'Planned (Phase 5)',
    color: 'from-amber-500 to-orange-600'
  },
  {
    id: 3,
    title: 'Crop Disease Detection',
    desc: 'Leaf image analysis via photo upload & live camera to detect pathologies.',
    icon: ScanSearch,
    status: 'Planned (Phase 6)',
    color: 'from-rose-500 to-red-600'
  },
  {
    id: 4,
    title: 'Weather Monitoring & Alerts',
    desc: 'Real-time forecasts and automated warnings for heavy rain and extreme weather.',
    icon: CloudSun,
    status: 'Planned (Phase 7)',
    color: 'from-sky-500 to-blue-600'
  },
  {
    id: 5,
    title: 'AI Farming Voice Assistant',
    desc: 'Multilingual conversational assistant with voice input and speech synthesis.',
    icon: Bot,
    status: 'Planned (Phase 9)',
    color: 'from-purple-500 to-indigo-600'
  },
  {
    id: 6,
    title: 'Multilingual Interface',
    desc: 'Full localization in English, Telugu, Hindi, Tamil, Kannada, and more.',
    icon: Languages,
    status: 'Planned (Phase 8)',
    color: 'from-teal-500 to-emerald-700'
  },
  {
    id: 7,
    title: 'Farmer Authentication',
    desc: 'Secure registration, login, JWT authorization, and profile management.',
    icon: ShieldCheck,
    status: 'Next Up (Phase 2)',
    color: 'from-blue-600 to-cyan-600'
  },
  {
    id: 8,
    title: 'Recommendation History',
    desc: 'Personal audit trail of past recommendations, diagnoses, and chats.',
    icon: History,
    status: 'Planned (Phase 10)',
    color: 'from-stone-600 to-slate-700'
  }
];

export default function App() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const testBackend = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await checkBackendHealth();
      setHealth(data);
    } catch (err) {
      setError(err.message || 'Could not connect to backend server');
      setHealth(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testBackend();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-agri-50/70 via-white to-slate-50 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-agri-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-agri-600 text-white flex items-center justify-center shadow-md shadow-agri-600/30">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-agri-950 block">
                AGRICULTURE ADVISOR
              </span>
              <span className="text-xs text-agri-700 font-medium block">
                AI Multilingual Agricultural Decision Support
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-agri-100 text-agri-800 border border-agri-200">
              <span className="w-2 h-2 rounded-full bg-agri-500 animate-pulse"></span>
              Phase 1 Active
            </span>
            <button 
              onClick={testBackend}
              disabled={loading}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition"
              title="Ping Backend API"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Ping Server</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-agri-800 via-agri-700 to-agri-900 text-white p-8 md:p-12 shadow-xl shadow-agri-950/10">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 backdrop-blur-md text-agri-100 border border-white/20">
              <Layers className="w-3.5 h-3.5" />
              B.Tech CSE (AI & ML) Major Project
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
              Empowering Farmers with <span className="text-agri-300">Intelligent Agriculture</span>
            </h1>
            <p className="text-agri-100/90 text-sm md:text-base leading-relaxed">
              AGRICULTURE ADVISOR combines machine learning for crop and fertilizer advisories, computer vision for plant disease detection, agro-meteorological forecasting, and a voice-interactive multilingual conversational assistant.
            </p>
          </div>
          
          <div className="absolute -right-12 -bottom-12 w-80 h-80 rounded-full bg-agri-500/20 blur-3xl pointer-events-none"></div>
        </div>

        {/* System & Connectivity Status Banner */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Backend API Connectivity</h3>
                <p className="text-xs text-slate-500">MERN Stack Health-Check (Node.js + Express + MongoDB)</p>
              </div>
            </div>

            <div>
              {loading ? (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Checking connection...
                </div>
              ) : health ? (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  API Online (HTTP 200 OK)
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  Server Offline
                </div>
              )}
            </div>
          </div>

          {/* Diagnostic Details */}
          {health && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block">Service</span>
                <span className="font-semibold text-slate-800">{health.service}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block">Server Uptime</span>
                <span className="font-semibold text-slate-800">{health.uptime}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block">Environment</span>
                <span className="font-semibold text-slate-800 capitalize">{health.environment}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block">Database Status</span>
                <span className={`font-semibold capitalize ${health.database?.isConnected ? 'text-emerald-700' : 'text-amber-600'}`}>
                  {health.database?.stateDescription || 'Not Connected'}
                </span>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Backend Unreachable</p>
                <p className="text-rose-600 mt-0.5">{error}. Ensure the Express server is running on port 5000.</p>
              </div>
            </div>
          )}
        </div>

        {/* Eight Modules Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Eight Main Modules</h2>
              <p className="text-xs text-slate-500">Core architectural components of the Agriculture Advisor platform</p>
            </div>
            <span className="text-xs font-medium text-agri-700 bg-agri-50 px-2.5 py-1 rounded-md border border-agri-100">
              8 Modules
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {MODULES.map((mod) => {
              const Icon = mod.icon;
              return (
                <div 
                  key={mod.id}
                  className="group relative bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md hover:border-agri-300 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${mod.color} text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
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
                    <span className="font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md text-[11px]">
                      {mod.status}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-agri-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <p>© {new Date().getFullYear()} AGRICULTURE ADVISOR. Major Project.</p>
          <p className="flex items-center gap-2">
            <span>MERN Stack</span>
            <span>•</span>
            <span>Machine Learning</span>
            <span>•</span>
            <span>Computer Vision</span>
            <span>•</span>
            <span>Multilingual AI</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
