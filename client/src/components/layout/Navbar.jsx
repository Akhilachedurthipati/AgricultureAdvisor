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
  Menu, 
  X,
  ChevronDown,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import LanguageSelector from '../common/LanguageSelector';

export default function Navbar() {
  const { t } = useTranslation();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  // Track scroll position for subtle background transitions
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setServicesDropdownOpen(false);
  }, [location.pathname]);

  const SERVICES = [
    { 
      name: t('nav.cropAdvisory', 'Crop Recommendation'), 
      path: '/crop-recommendation', 
      icon: Sprout,
      desc: 'Single optimal crop prediction'
    },
    { 
      name: t('nav.fertilizer', 'Fertilizer Recommendation'), 
      path: '/fertilizer-recommendation', 
      icon: FlaskConical,
      desc: 'Precision NPK and 50-kg commercial bags'
    },
    { 
      name: t('nav.diseaseDetection', 'Crop Disease Detection'), 
      path: '/disease-detection', 
      icon: ScanSearch,
      desc: 'Foliar pathology & organic remedies'
    },
    { 
      name: t('nav.weather', 'Weather Monitoring & Alerts'), 
      path: '/weather', 
      icon: CloudSun,
      desc: 'Agro-meteorology & spraying windows'
    },
    { 
      name: t('nav.aiAssistant', 'AI Farming Assistant'), 
      path: '/ai-assistant', 
      icon: Bot,
      desc: 'Multilingual voice & chat agronomic Q&A'
    },
    { 
      name: t('nav.history', 'Recommendation History'), 
      path: '/history', 
      icon: History,
      desc: 'Personalized advisory audit trail'
    },
    { 
      name: t('nav.farmerProfile', 'Farmer Profile'), 
      path: '/profile', 
      icon: User,
      desc: 'Account details and farm preferences'
    }
  ];

  return (
    <header 
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-subtle py-2.5' 
          : 'bg-[#F7F7F0]/90 backdrop-blur-sm border-b border-slate-200/60 py-3.5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* Brand Logo with Distinctive AgTech Identity */}
        <Link 
          to="/" 
          className="flex items-center space-x-3 group"
        >
          <div className="w-9 h-9 rounded-xl bg-[#123D2A] text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-200 shrink-0 border border-[#246B45]/30">
            <Sprout className="w-5 h-5 text-[#B6D957]" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-base tracking-tight text-[#123D2A] leading-tight flex items-center gap-1.5">
              <span>Agriculture Advisor</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#B6D957]" />
            </span>
            <span className="text-[10px] font-semibold tracking-wider uppercase text-slate-400 leading-none mt-0.5">
              Agritech Intelligence
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
          <Link
            to="/"
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              isActive('/') 
                ? 'text-[#123D2A] bg-white shadow-xs font-bold' 
                : 'text-slate-600 hover:text-[#123D2A] hover:bg-white/60'
            }`}
          >
            Home
          </Link>

          {/* Services Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setServicesDropdownOpen(!servicesDropdownOpen)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                servicesDropdownOpen 
                  ? 'text-[#123D2A] bg-white shadow-xs' 
                  : 'text-slate-600 hover:text-[#123D2A] hover:bg-white/60'
              }`}
            >
              <span>Services</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${servicesDropdownOpen ? 'rotate-180 text-[#246B45]' : 'text-slate-400'}`} />
            </button>

            {servicesDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl shadow-premium border border-slate-200/90 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    8 Intelligent Modules
                  </span>
                  <a href="/#services" onClick={() => setServicesDropdownOpen(false)} className="text-[10px] font-semibold text-[#246B45] hover:underline">
                    View All
                  </a>
                </div>
                <div className="p-1 space-y-0.5 max-h-[380px] overflow-y-auto">
                  {SERVICES.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setServicesDropdownOpen(false)}
                        className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-[#F7F7F0] transition group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-[#F7F7F0] group-hover:bg-[#123D2A] text-[#246B45] group-hover:text-white flex items-center justify-center shrink-0 transition-colors mt-0.5">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-xs font-bold text-[#202923] group-hover:text-[#123D2A] leading-tight">
                            {item.name}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">
                            {item.desc}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <a
            href="/#how-it-works"
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-[#123D2A] hover:bg-white/60 transition"
          >
            How It Works
          </a>

          <a
            href="/#scientific-foundation"
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-[#123D2A] hover:bg-white/60 transition"
          >
            About
          </a>
        </nav>

        {/* Right Controls: Language Selector & Auth CTAs */}
        <div className="hidden md:flex items-center space-x-3">
          <LanguageSelector compact />

          <div className="h-4 w-px bg-slate-300" />

          {isAuthenticated ? (
            <div className="flex items-center space-x-2">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#123D2A] hover:bg-[#1D5939] text-white shadow-xs transition"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-[#B6D957]" />
                <span>Dashboard</span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                to="/login"
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[#202923] hover:text-[#123D2A] hover:bg-white transition"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#123D2A] hover:bg-[#1D5939] text-white shadow-sm shadow-[#123D2A]/20 transition"
              >
                <span>Register</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#B6D957]" />
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center space-x-2">
          <LanguageSelector compact />
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-700 hover:bg-white transition cursor-pointer"
            aria-label="Toggle mobile navigation"
          >
            {mobileMenuOpen ? <X className="w-6 h-6 text-[#123D2A]" /> : <Menu className="w-6 h-6 text-[#123D2A]" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200/80 bg-white/98 backdrop-blur-md px-4 pt-3 pb-6 space-y-4 animate-in fade-in">
          <div className="space-y-1">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-xs font-bold text-[#123D2A] hover:bg-[#F7F7F0]"
            >
              Home
            </Link>
            <a
              href="/#services"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-[#F7F7F0]"
            >
              Services Showcase
            </a>
            <a
              href="/#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-[#F7F7F0]"
            >
              How It Works
            </a>
            <a
              href="/#scientific-foundation"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-[#F7F7F0]"
            >
              About & Science
            </a>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-3 mb-2">
              Direct Module Access
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {SERVICES.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-2.5 py-2 rounded-xl text-[11px] font-medium text-slate-700 hover:text-[#123D2A] hover:bg-[#F7F7F0] truncate block"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
            {isAuthenticated ? (
              <div className="w-full flex items-center justify-between">
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2.5 rounded-xl text-xs font-bold bg-[#123D2A] text-white"
                >
                  Go to Dashboard
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="ml-2 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-600 bg-rose-50"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="w-full grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 rounded-xl text-xs font-semibold border border-slate-200 text-slate-700"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 rounded-xl text-xs font-bold bg-[#123D2A] text-white"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
