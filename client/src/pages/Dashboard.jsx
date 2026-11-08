import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Sprout, 
  FlaskConical, 
  ScanSearch, 
  CloudSun, 
  Bot, 
  History, 
  User, 
  MapPin, 
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  Calendar,
  CheckCircle2,
  Thermometer,
  Droplets,
  Languages,
  Activity,
  FileText
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import AlertBanner from '../components/common/AlertBanner';
import { useAuth } from '../context/AuthContext';
import { fetchUnifiedHistory } from '../services/historyService';
import { fetchWeather } from '../services/weatherService';

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();

  const [recentRecords, setRecentRecords] = useState([]);
  const [historySummary, setHistorySummary] = useState(null);
  const [weatherSnippet, setWeatherSnippet] = useState(null);
  const [loading, setLoading] = useState(true);

  const farmerCity = user?.location?.city || user?.location?.district || 'Warangal';

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load recent history
      const histData = await fetchUnifiedHistory({ page: 1, limit: 4 });
      if (histData?.success && histData.data) {
        setRecentRecords(histData.data.records || []);
        setHistorySummary(histData.data.summary || null);
      }
    } catch {
      // Ignore background load error
    }

    try {
      // Load weather telemetry for farmer's location
      const wData = await fetchWeather({ city: farmerCity });
      if (wData?.success && wData.data) {
        setWeatherSnippet(wData.data);
      }
    } catch {
      // Weather fallback silent
    } finally {
      setLoading(false);
    }
  };

  const QUICK_ACTIONS = [
    {
      title: t('dashboard.cropCard', 'Crop Recommendation'),
      subtitle: t('dashboard.cropDesc', 'Find the single best-suited crop based on soil profile, season, and local climate.'),
      icon: Sprout,
      route: '/crop-recommendation',
      color: 'bg-emerald-50 text-[#176B45] group-hover:bg-[#176B45] group-hover:text-white',
      btnText: 'Get Crop Advice'
    },
    {
      title: t('dashboard.fertCard', 'Fertilizer Guidance'),
      subtitle: t('dashboard.fertDesc', 'Calculate precise N-P-K nutrient replenishment and standard 50-kg bag counts.'),
      icon: FlaskConical,
      route: '/fertilizer-recommendation',
      color: 'bg-amber-50 text-amber-700 group-hover:bg-amber-600 group-hover:text-white',
      btnText: 'Calculate Dosage'
    },
    {
      title: t('dashboard.diseaseCard', 'Crop Disease Detection'),
      subtitle: t('dashboard.diseaseDesc', 'Screen leaf photos or use camera to identify pathologies across 7 target crops.'),
      icon: ScanSearch,
      route: '/disease-detection',
      color: 'bg-rose-50 text-rose-700 group-hover:bg-rose-600 group-hover:text-white',
      btnText: 'Screen Leaf Photo'
    },
    {
      title: t('dashboard.weatherCard', 'Weather & Hazard Alerts'),
      subtitle: t('dashboard.weatherDesc', 'Track real-time rainfall, temperatures, and favorable spraying windows.'),
      icon: CloudSun,
      route: '/weather',
      color: 'bg-sky-50 text-sky-700 group-hover:bg-sky-600 group-hover:text-white',
      btnText: 'Check Forecast'
    },
    {
      title: t('nav.aiAssistant', 'AI Farming Assistant'),
      subtitle: 'Ask agricultural questions in English, Telugu, or Hindi using voice or text.',
      icon: Bot,
      route: '/ai-assistant',
      color: 'bg-purple-50 text-purple-700 group-hover:bg-purple-600 group-hover:text-white',
      btnText: 'Ask Question'
    },
    {
      title: t('nav.history', 'Recommendation History'),
      subtitle: 'Review, filter, and audit past crop recommendations, fertilizer plans, and scans.',
      icon: History,
      route: '/history',
      color: 'bg-slate-100 text-slate-700 group-hover:bg-slate-800 group-hover:text-white',
      btnText: 'View History'
    }
  ];

  return (
    <div className="space-y-8 pb-8">
      
      {/* Welcome Banner */}
      <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#22A06B] animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#176B45]">
              Farmer Command Dashboard
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1F2937] tracking-tight">
            {t('dashboard.welcome', 'Welcome back')}, <span className="text-[#176B45]">{user?.name || 'Farmer'}</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            {user?.location?.district ? `${user.location.district}, ` : ''}{user?.location?.state ? user.location.state : 'Your Farm'}. 
            {' '}{t('dashboard.subtitle', 'Access your crop prediction tools, fertilizer calculations, and localized agricultural advisories.')}
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-medium border border-slate-200">
              <MapPin className="w-3.5 h-3.5 text-[#176B45]" />
              <span>{user?.location?.district ? `${user.location.district}, ${user.location.state}` : 'Location Set'}</span>
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-medium border border-slate-200">
              <Languages className="w-3.5 h-3.5 text-[#176B45]" />
              <span className="uppercase">Language: {user?.preferredLanguage || i18n.language?.substring(0, 2) || 'en'}</span>
            </span>

            <Link
              to="/profile"
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold text-[#176B45] hover:text-[#114F33] hover:bg-[#E8F5EE] transition"
            >
              <span>Edit Profile</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Live Weather Quick Preview on Dashboard */}
        {weatherSnippet && (
          <div className="w-full md:w-auto p-4 rounded-2xl bg-gradient-to-br from-[#E8F5EE] to-white border border-[#C7E7D6] shadow-xs flex items-center justify-between md:justify-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-white text-[#176B45] flex items-center justify-center border border-[#C7E7D6] shadow-xs">
              <CloudSun className="w-6 h-6 text-[#22A06B]" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                {weatherSnippet.location?.name || farmerCity} Weather
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-[#1F2937]">
                  {weatherSnippet.current?.temperature}°C
                </span>
                <span className="text-xs text-slate-600 font-medium">
                  {weatherSnippet.current?.condition}
                </span>
              </div>
              <p className="text-[10px] text-slate-500">
                Humidity: {weatherSnippet.current?.humidity}% • Wind: {weatherSnippet.current?.windSpeed} km/h
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Advisory Quick Launchers */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-[#1F2937] tracking-tight">
            Agricultural Advisory Tools
          </h2>
          <p className="text-xs text-slate-500">
            Select a specialized advisory tool to calculate or analyze field conditions.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {QUICK_ACTIONS.map((action, i) => {
            const Icon = action.icon;
            return (
              <Link
                key={i}
                to={action.route}
                className="group bg-white rounded-2xl border border-slate-200/90 p-5 shadow-card hover:shadow-card-hover hover:border-[#22A06B]/60 transition-all duration-200 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center transition-colors shadow-xs" style={{}} >
                    <div className={`w-full h-full rounded-xl flex items-center justify-center ${action.color} transition-colors`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-[#1F2937] group-hover:text-[#176B45] transition-colors text-base leading-snug">
                      {action.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {action.subtitle}
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#176B45]">
                  <span>{action.btnText}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Recent Recommendations Preview */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#1F2937] tracking-tight">
              Recent Consultations & History
            </h2>
            <p className="text-xs text-slate-500">
              Audit trail of your most recent crop selections, fertilizer calculations, and leaf scans.
            </p>
          </div>

          <Link
            to="/history"
            className="inline-flex items-center gap-1 text-xs font-bold text-[#176B45] hover:text-[#114F33] transition"
          >
            <span>View Full History</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentRecords.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentRecords.map((item) => {
              const isCrop = item.module === 'crop';
              const isFert = item.module === 'fertilizer';
              const isDisease = item.module === 'disease';
              const Icon = isCrop ? Sprout : isFert ? FlaskConical : isDisease ? ScanSearch : Bot;
              const badgeColor = isCrop ? 'agri' : isFert ? 'warning' : isDisease ? 'danger' : 'info';

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-card flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant={badgeColor} size="sm">
                        {item.module.toUpperCase()}
                      </Badge>
                      <span className="text-[10px] text-slate-400">
                        {item.formattedDate || 'Recent'}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm line-clamp-1">
                      {item.title}
                    </h4>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {item.summary}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    {item.confidenceScore ? (
                      <span className="text-[11px] font-semibold text-[#176B45]">
                        Confidence: {(item.confidenceScore <= 1.0 ? Math.round(item.confidenceScore * 100) : Math.round(item.confidenceScore))}%
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400">Recorded</span>
                    )}

                    <Link
                      to="/history"
                      className="text-[#176B45] hover:underline font-semibold text-xs"
                    >
                      Inspect
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <Card className="text-center py-10 px-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <History className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm">No Recommendations Recorded Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              Use any of the advisory tools above to generate your first crop recommendation or fertilizer schedule.
            </p>
            <Link
              to="/crop-recommendation"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#176B45] text-white hover:bg-[#114F33] transition"
            >
              <Sprout className="w-3.5 h-3.5" />
              <span>Start with Crop Recommendation</span>
            </Link>
          </Card>
        )}
      </section>

    </div>
  );
}
