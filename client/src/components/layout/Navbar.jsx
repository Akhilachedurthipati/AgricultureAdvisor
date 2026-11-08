import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Sprout, 
  FlaskConical, 
  ScanSearch, 
  CloudSun, 
  Bot, 
  History, 
  User, 
  LogOut, 
  LogIn, 
  UserPlus, 
  LayoutDashboard, 
  Home, 
  Menu, 
  X,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import LanguageSelector from '../common/LanguageSelector';

export default function Navbar() {
  const { t } = useTranslation();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setServicesDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const SERVICES = [
    { 
      name: t('nav.cropAdvisory', 'Crop Recommendation'), 
      path: '/crop-recommendation', 
      icon: Sprout,
      desc: 'Single optimal crop prediction'
    },
    { 
      name: t('nav.fertilizer', 'Fertilizer Guidance'), 
      path: '/fertilizer-recommendation', 
      icon: FlaskConical,
      desc: 'Precision NPK and dosage calculations'
    },
    { 
      name: t('nav.diseaseDetection', 'Disease Detection'), 
      path: '/disease-detection', 
      icon: ScanSearch,
      desc: 'Leaf pathology visual screening'
    },
    { 
      name: t('nav.weather', 'Weather & Alerts'), 
      path: '/weather', 
      icon: CloudSun,
      desc: 'Agro-meteorological forecasts'
    },
    { 
      name: t('nav.aiAssistant', 'AI Farming Assistant'), 
      path: '/ai-assistant', 
      icon: Bot,
      desc: 'Multilingual voice and chat Q&A'
    },
    { 
      name: t('nav.history', 'Recommendation History'), 
      path: '/history', 
      icon: History,
      desc: 'Personal advisory audit trail'
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link 
          to="/" 
          onClick={() => setMobileMenuOpen(false)}
          className="flex items-center space-x-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-[#176B45] text-white flex items-center justify-center shadow-sm group-hover:bg-[#114F33] transition-colors shrink-0">
            <Sprout className="w-6 h-6 text-[#A3E635]" />
          </div>
          <div>
            <span className="text-lg sm:text-xl font-extrabold tracking-tight text-[#176B45] block leading-tight">
              Agriculture Advisor
            </span>
            <span className="text-[10px] text-slate-500 font-medium tracking-wide block">
              Smart Farming Platform
            </span>
          </div>
        </Link>

        {/* Simplified Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-2">
          <Link
            to="/"
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
              isActive('/') 
                ? 'bg-[#E8F5EE] text-[#176B45]' 
                : 'text-slate-600 hover:text-[#176B45] hover:bg-slate-50'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>{t('nav.home', 'Home')}</span>
          </Link>

          {/* Services Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setServicesDropdownOpen(!servicesDropdownOpen)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1 cursor-pointer ${
                SERVICES.some((s) => isActive(s.path))
                  ? 'bg-[#E8F5EE] text-[#176B45] font-bold'
                  : 'text-slate-600 hover:text-[#176B45] hover:bg-slate-50'
              }`}
            >
              <span>{t('nav.modules', 'Services')}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${servicesDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {servicesDropdownOpen && (
              <div className="absolute left-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-1">
                <div className="px-4 py-1.5 pb-2 border-b border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Agricultural Advisory Services
                  </span>
                </div>
                <div className="py-1">
                  {SERVICES.map((service) => {
                    const Icon = service.icon;
                    return (
                      <Link
                        key={service.path}
                        to={service.path}
                        onClick={() => setServicesDropdownOpen(false)}
                        className={`flex items-start gap-3 px-4 py-2.5 transition text-left ${
                          isActive(service.path)
                            ? 'bg-[#E8F5EE] text-[#176B45]'
                            : 'text-slate-700 hover:bg-slate-50 hover:text-[#176B45]'
                        }`}
                      >
                        <div className="w-7 h-7 rounded-lg bg-slate-100 text-[#176B45] flex items-center justify-center shrink-0 mt-0.5">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold leading-tight">{service.name}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">{service.desc}</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {isAuthenticated && (
            <Link
              to="/dashboard"
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                isActive('/dashboard') 
                  ? 'bg-[#E8F5EE] text-[#176B45]' 
                  : 'text-slate-600 hover:text-[#176B45] hover:bg-slate-50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>{t('nav.dashboard', 'Dashboard')}</span>
            </Link>
          )}
        </nav>

        {/* Right Section: Language Selector + Auth Actions */}
        <div className="hidden md:flex items-center space-x-3">
          <LanguageSelector />

          {isAuthenticated ? (
            <div className="flex items-center space-x-2">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#176B45] hover:bg-[#114F33] text-white shadow-xs transition"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Go to Dashboard</span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-[#176B45] hover:bg-slate-100 transition"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{t('nav.login', 'Sign In')}</span>
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#176B45] hover:bg-[#114F33] text-white shadow-xs transition cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{t('nav.register', 'Get Started')}</span>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu right side */}
        <div className="flex lg:hidden items-center space-x-2">
          <LanguageSelector compact />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 focus:outline-none cursor-pointer"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="w-6 h-6 text-[#176B45]" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3 animate-in fade-in">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold ${
              isActive('/') ? 'bg-[#E8F5EE] text-[#176B45]' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Home className="w-4 h-4 text-[#176B45]" />
            <span>{t('nav.home', 'Home')}</span>
          </Link>

          {isAuthenticated && (
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold ${
                isActive('/dashboard') ? 'bg-[#E8F5EE] text-[#176B45]' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-[#176B45]" />
              <span>{t('nav.dashboard', 'Dashboard')}</span>
            </Link>
          )}

          <div className="pt-2 pb-1 border-t border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3">
              {t('nav.modules', 'Advisory Services')}
            </span>
          </div>

          {SERVICES.map((service) => {
            const Icon = service.icon;
            return (
              <Link
                key={service.path}
                to={service.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold ${
                  isActive(service.path) ? 'bg-[#E8F5EE] text-[#176B45]' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4 text-[#176B45]" />
                <span>{service.name}</span>
              </Link>
            );
          })}

          <div className="pt-2 border-t border-slate-100">
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50"
              >
                <LogOut className="w-4 h-4 text-rose-500" />
                <span>{t('nav.logout', 'Sign Out')}</span>
              </button>
            ) : (
              <div className="flex flex-col space-y-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{t('nav.login', 'Sign In')}</span>
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#176B45] text-white"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{t('nav.register', 'Get Started')}</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
