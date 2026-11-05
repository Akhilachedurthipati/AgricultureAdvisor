import React, { useState, useEffect } from 'react';
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
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Server,
  Layers,
  ArrowRight,
  LogIn,
  UserPlus
} from 'lucide-react';
import { checkBackendHealth } from '../services/api';
import { useAuth } from '../context/AuthContext';

const MODULES = [
  {
    id: 1,
    title: 'Crop Recommendation',
    desc: 'Intelligent single best-suited crop advisory based on climate and soil metrics.',
    icon: Sprout,
    status: 'Phase 4',
    color: 'from-emerald-500 to-green-600'
  },
  {
    id: 2,
    title: 'Fertilizer Recommendation',
    desc: 'Precision NPK and soil-tailored nutrient dosage with safety precautions.',
    icon: FlaskConical,
    status: 'Phase 5',
    color: 'from-amber-500 to-orange-600'
  },
  {
    id: 3,
    title: 'Crop Disease Detection',
    desc: 'Leaf image analysis via photo upload & live camera to detect pathologies.',
    icon: ScanSearch,
    status: 'Phase 6',
    color: 'from-rose-500 to-red-600'
  },
  {
    id: 4,
    title: 'Weather Monitoring & Alerts',
    desc: 'Real-time forecasts and automated warnings for heavy rain and extreme weather.',
    icon: CloudSun,
    status: 'Phase 7',
    color: 'from-sky-500 to-blue-600'
  },
  {
    id: 5,
    title: 'AI Farming Voice Assistant',
    desc: 'Multilingual conversational assistant with voice input and speech synthesis.',
    icon: Bot,
    status: 'Phase 9',
    color: 'from-purple-500 to-indigo-600'
  },
  {
    id: 6,
    title: 'Multilingual Interface',
    desc: 'Full localization in English, Telugu, Hindi, Tamil, Kannada, and more.',
    icon: Languages,
    status: 'Phase 8',
    color: 'from-teal-500 to-emerald-700'
  },
  {
    id: 7,
    title: 'Farmer Authentication',
    desc: 'Secure registration, login, JWT authorization, and profile management.',
    icon: ShieldCheck,
    status: 'Implemented (Phase 2)',
    color: 'from-blue-600 to-cyan-600'
  },
  {
    id: 8,
    title: 'Recommendation History',
    desc: 'Personal audit trail of past recommendations, diagnoses, and chats.',
    icon: History,
    status: 'Phase 10',
    color: 'from-stone-600 to-slate-700'
  }
];

export default function Home() {
  const { isAuthenticated, user } = useAuth();
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
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-agri-900 via-agri-800 to-agri-700 text-white p-8 md:p-14 shadow-xl shadow-agri-950/15">
        <div className="relative z-10 max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/10 backdrop-blur-md text-agri-200 border border-white/20">
            <Layers className="w-3.5 h-3.5" />
            B.Tech CSE (AI & ML) Major Project
          </div>

          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
            AI-Powered Multilingual <span className="text-agri-300">Agricultural Advisor</span>
          </h1>

          <p className="text-agri-100/90 text-sm md:text-base leading-relaxed">
            Welcome to Agriculture Advisor — an intelligent decision support platform assisting farmers with single-crop recommendation models, precision fertilizer guidance, dual-mode leaf disease detection, agro-meteorological warnings, and voice-enabled conversational AI.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-agri-500 hover:bg-agri-400 text-agri-950 font-bold text-sm shadow-lg shadow-agri-500/30 transition cursor-pointer"
              >
                <span>Go to Dashboard ({user?.name})</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-agri-500 hover:bg-agri-400 text-agri-950 font-bold text-sm shadow-lg shadow-agri-500/30 transition cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Register Farmer Account</span>
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 transition cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Farmer Sign In</span>
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="absolute -right-12 -bottom-12 w-80 h-80 rounded-full bg-agri-500/20 blur-3xl pointer-events-none"></div>
      </div>

      {/* API Connectivity & System Diagnostics */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-sm sm:text-base">MERN Backend API Status</h3>
              <p className="text-xs text-slate-500">Live operational status of Express REST API & Authentication</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={testBackend}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition"
              title="Ping API"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Ping</span>
            </button>

            {loading ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                Checking...
              </span>
            ) : health ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                API Online (HTTP 200)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
                <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                Server Offline
              </span>
            )}
          </div>
        </div>

        {health && (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
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
              <span className="text-slate-400 block">Database</span>
              <span className={`font-semibold capitalize ${health.database?.isConnected ? 'text-emerald-700' : 'text-amber-600'}`}>
                {health.database?.isConnected ? 'MongoDB Active' : 'Memory Resilient Fallback'}
              </span>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}. Ensure the Express server is running on port 5000.</span>
          </div>
        )}
      </div>

      {/* Eight Modules Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Eight Main Modules</h2>
            <p className="text-xs text-slate-500">Overview of the core architectural features</p>
          </div>
          <span className="text-xs font-semibold text-agri-700 bg-agri-50 px-3 py-1 rounded-full border border-agri-200">
            8 Modules
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {MODULES.map((mod) => {
            const Icon = mod.icon;
            const isPhase2 = mod.id === 7;
            return (
              <div 
                key={mod.id}
                className={`group relative bg-white rounded-2xl border p-5 shadow-sm transition-all flex flex-col justify-between ${
                  isPhase2 ? 'border-agri-400 ring-2 ring-agri-500/10' : 'border-slate-200/80 hover:border-slate-300'
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
                    isPhase2 
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {mod.status}
                  </span>
                  {isPhase2 && (
                    <Link to="/login" className="font-semibold text-agri-700 hover:text-agri-800 flex items-center gap-0.5">
                      <span>Test Auth</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
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

