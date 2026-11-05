import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Sprout, 
  FlaskConical, 
  ScanSearch, 
  CloudSun, 
  Bot, 
  History, 
  ShieldCheck, 
  Languages, 
  MapPin, 
  ArrowRight,
  UserCheck,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  Layers,
  Thermometer,
  Droplets
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import AlertBanner from '../components/common/AlertBanner';
import StatCard from '../components/common/StatCard';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();

  const QUICK_ACTIONS = [
    {
      title: 'Recommend Best Crop',
      subtitle: 'Analyze soil, climate, pH & rainfall for single optimal crop',
      icon: Sprout,
      route: '/crop-recommendation',
      color: 'from-emerald-600 to-green-700',
      badge: 'Module 01'
    },
    {
      title: 'Calculate Fertilizer',
      subtitle: 'Nutrient-deficit N-P-K calculation with safety precautions',
      icon: FlaskConical,
      route: '/fertilizer-recommendation',
      color: 'from-amber-500 to-orange-600',
      badge: 'Module 02'
    },
    {
      title: 'Diagnose Crop Disease',
      subtitle: 'Upload leaf photo or capture via camera for pathogen diagnosis',
      icon: ScanSearch,
      route: '/disease-detection',
      color: 'from-rose-500 to-red-600',
      badge: 'Module 03'
    },
    {
      title: 'Weather & Storm Alerts',
      subtitle: 'Real-time forecasts and localized heavy precipitation warnings',
      icon: CloudSun,
      route: '/weather',
      color: 'from-sky-500 to-blue-600',
      badge: 'Module 04'
    },
    {
      title: 'AI Farming Assistant',
      subtitle: 'Voice & text conversational chatbot for general farming Q&A',
      icon: Bot,
      route: '/ai-assistant',
      color: 'from-purple-500 to-indigo-600',
      badge: 'Module 05'
    },
    {
      title: 'Recommendation History',
      subtitle: 'Review and audit past crop recommendations & disease scans',
      icon: History,
      route: '/history',
      color: 'from-slate-700 to-slate-900',
      badge: 'Module 08'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      
      {/* Farmer Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-agri-900 via-agri-800 to-agri-700 text-white p-6 sm:p-10 shadow-xl shadow-agri-950/15">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 backdrop-blur-md text-agri-200 border border-white/15">
            <UserCheck className="w-3.5 h-3.5 text-agri-300" />
            <span>Authenticated Farmer Command Center</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            Namaste, <span className="text-agri-300">{user?.name || 'Farmer'}</span>! 🌾
          </h1>

          <p className="text-xs sm:text-sm text-agri-100/90 leading-relaxed">
            Welcome to Agriculture Advisor. Access real-time agricultural machine learning models, weather alerts, and multilingual AI assistance tailored for your fields.
          </p>

          {/* Quick Badges */}
          <div className="pt-2 flex flex-wrap items-center gap-2.5 text-xs">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-agri-100 border border-white/10 font-medium">
              <MapPin className="w-3.5 h-3.5 text-agri-300" />
              <span>
                {user?.location?.state 
                  ? `${user.location.district ? `${user.location.district}, ` : ''}${user.location.state}` 
                  : 'Farm location not set'}
              </span>
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-agri-100 border border-white/10 font-medium">
              <Languages className="w-3.5 h-3.5 text-agri-300" />
              <span>Preferred Language: <strong className="uppercase">{user?.preferredLanguage || 'en'}</strong></span>
            </span>

            <Link
              to="/profile"
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-agri-500/80 hover:bg-agri-500 text-white text-xs font-bold transition ml-auto"
            >
              <span>Edit Profile</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        <div className="absolute -right-10 -bottom-10 w-72 h-72 rounded-full bg-agri-500/20 blur-3xl pointer-events-none"></div>
      </div>

      {/* Advisory Notice Banner */}
      <AlertBanner
        variant="disclaimer"
        title="Official Agricultural Advisory Disclaimer"
        message="All models and recommendations provided on this platform are computational agronomic advisories. They do not constitute guaranteed agricultural yield. Always verify critical decisions with local agricultural extension officers or certified testing laboratories."
      />

      {/* Farm Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Advisory Engines"
          value="8 Modules"
          subtext="Crop, Fertilizer, Vision & AI"
          icon={Layers}
          color="agri"
        />
        <StatCard
          label="Farm Climate Zone"
          value={user?.location?.state ? user.location.state : 'Semi-Arid'}
          subtext={user?.location?.district ? `District: ${user.location.district}` : 'Tropical / Subtropical'}
          icon={Thermometer}
          color="amber"
        />
        <StatCard
          label="Soil Moisture Status"
          value="Adequate"
          subtext="Based on regional climate"
          icon={Droplets}
          color="sky"
        />
        <StatCard
          label="Authentication Security"
          value="JWT Active"
          subtext="Session token protected"
          icon={ShieldCheck}
          color="purple"
        />
      </div>

      {/* Quick Action Advisory Launchers */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Advisory Quick Launchers</h2>
            <p className="text-xs text-slate-500">Jump directly into specialized agricultural advisory tools</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {QUICK_ACTIONS.map((action, i) => {
            const Icon = action.icon;
            return (
              <Link
                key={i}
                to={action.route}
                className="group relative bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-lg hover:border-agri-300 transition-all duration-200 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${action.color} text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <Badge variant="neutral" size="sm">
                      {action.badge}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 group-hover:text-agri-700 transition-colors text-base">
                      {action.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {action.subtitle}
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-agri-700 group-hover:text-agri-800">
                  <span>Launch Engine</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

    </div>
  );
}
