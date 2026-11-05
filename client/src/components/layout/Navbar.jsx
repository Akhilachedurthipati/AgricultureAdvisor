import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [modulesDropdownOpen, setModulesDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const NAV_LINKS = [
    { name: 'Crop Advisory', path: '/crop-recommendation', icon: Sprout },
    { name: 'Fertilizer', path: '/fertilizer-recommendation', icon: FlaskConical },
    { name: 'Disease Detection', path: '/disease-detection', icon: ScanSearch },
    { name: 'Weather', path: '/weather', icon: CloudSun },
    { name: 'AI Assistant', path: '/ai-assistant', icon: Bot },
    { name: 'History', path: '/history', icon: History },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-agri-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link 
          to="/" 
          onClick={() => setMobileMenuOpen(false)}
          className="flex items-center space-x-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-agri-600 text-white flex items-center justify-center shadow-md shadow-agri-600/30 group-hover:scale-105 transition-transform shrink-0">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <span className="text-lg sm:text-xl font-extrabold tracking-tight text-agri-950 block leading-tight">
              AGRICULTURE ADVISOR
            </span>
            <span className="text-[10px] text-agri-700 font-semibold uppercase tracking-wider block">
              AI Agricultural Decision Support
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-1">
          <Link
            to="/"
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
              isActive('/') 
                ? 'bg-agri-50 text-agri-800' 
                : 'text-slate-600 hover:text-agri-700 hover:bg-slate-50'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>

          {isAuthenticated && (
            <>
              <Link
                to="/dashboard"
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                  isActive('/dashboard') 
                    ? 'bg-agri-50 text-agri-800' 
                    : 'text-slate-600 hover:text-agri-700 hover:bg-slate-50'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </Link>

              {/* Advisory Modules Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setModulesDropdownOpen(!modulesDropdownOpen)}
                  onBlur={() => setTimeout(() => setModulesDropdownOpen(false), 200)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1 ${
                    NAV_LINKS.some((l) => isActive(l.path))
                      ? 'bg-agri-100/80 text-agri-900 font-bold'
                      : 'text-slate-600 hover:text-agri-700 hover:bg-slate-50'
                  }`}
                >
                  <Sprout className="w-3.5 h-3.5 text-agri-600" />
                  <span>Modules</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {modulesDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    {NAV_LINKS.map((link) => {
                      const Icon = link.icon;
                      return (
                        <Link
                          key={link.path}
                          to={link.path}
                          onClick={() => setModulesDropdownOpen(false)}
                          className={`flex items-center gap-2.5 px-4 py-2 text-xs transition ${
                            isActive(link.path)
                              ? 'bg-agri-50 text-agri-800 font-bold'
                              : 'text-slate-700 hover:bg-slate-50 hover:text-agri-700'
                          }`}
                        >
                          <Icon className="w-4 h-4 text-agri-600 shrink-0" />
                          <span>{link.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Direct Quick Shortcuts */}
              <Link
                to="/crop-recommendation"
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                  isActive('/crop-recommendation') 
                    ? 'bg-agri-50 text-agri-800' 
                    : 'text-slate-600 hover:text-agri-700 hover:bg-slate-50'
                }`}
              >
                <span>Crops</span>
              </Link>

              <Link
                to="/fertilizer-recommendation"
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                  isActive('/fertilizer-recommendation') 
                    ? 'bg-agri-50 text-agri-800' 
                    : 'text-slate-600 hover:text-agri-700 hover:bg-slate-50'
                }`}
              >
                <span>Fertilizer</span>
              </Link>

              <Link
                to="/weather"
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                  isActive('/weather') 
                    ? 'bg-agri-50 text-agri-800' 
                    : 'text-slate-600 hover:text-agri-700 hover:bg-slate-50'
                }`}
              >
                <span>Weather</span>
              </Link>
            </>
          )}
        </nav>

        {/* Right Section: Auth State / Farmer Profile */}
        <div className="hidden md:flex items-center space-x-3">
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center space-x-2.5 p-1.5 pr-3 rounded-full hover:bg-slate-100 transition border border-slate-200"
              >
                <div className="w-8 h-8 rounded-full bg-agri-700 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'F'}
                </div>
                <div className="text-left text-xs">
                  <span className="font-semibold text-slate-800 block leading-tight truncate max-w-[120px]">
                    {user?.name || 'Farmer'}
                  </span>
                  <span className="text-[10px] text-slate-500 block leading-none">
                    {user?.location?.district ? `${user.location.district}, ` : ''}{user?.location?.state || 'Verified'}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Profile Dropdown */}
              {profileDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in slide-in-from-top-2"
                  onMouseLeave={() => setProfileDropdownOpen(false)}
                >
                  <div className="px-4 py-2.5 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-800 truncate">{user?.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                    <p className="text-[10px] font-medium text-agri-700 mt-0.5">
                      Language: <span className="uppercase">{user?.preferredLanguage || 'en'}</span>
                    </p>
                  </div>

                  <Link
                    to="/profile"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-agri-50 hover:text-agri-800 transition"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    <span>Farmer Profile</span>
                  </Link>

                  <Link
                    to="/dashboard"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-agri-50 hover:text-agri-800 transition"
                  >
                    <LayoutDashboard className="w-4 h-4 text-slate-400" />
                    <span>Farmer Dashboard</span>
                  </Link>

                  <div className="border-t border-slate-100 my-1"></div>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition font-semibold text-left cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-agri-700 hover:bg-slate-100 transition"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-agri-600 hover:bg-agri-700 text-white shadow-md shadow-agri-600/20 transition cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Register Farmer</span>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu hamburger button */}
        <div className="flex lg:hidden items-center space-x-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 focus:outline-none"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-100 bg-white px-4 py-4 space-y-3 animate-in fade-in">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold ${
              isActive('/') ? 'bg-agri-50 text-agri-800' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Home className="w-4 h-4 text-agri-600" />
            <span>Home</span>
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold ${
                  isActive('/dashboard') ? 'bg-agri-50 text-agri-800' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-agri-600" />
                <span>Dashboard</span>
              </Link>

              <div className="pt-2 pb-1 border-t border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3">
                  Advisory Modules
                </span>
              </div>

              {NAV_LINKS.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold ${
                      isActive(link.path) ? 'bg-agri-50 text-agri-800' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-agri-600" />
                    <span>{link.name}</span>
                  </Link>
                );
              })}

              <div className="pt-2 border-t border-slate-100 space-y-2">
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <User className="w-4 h-4 text-slate-500" />
                  <span>Farmer Profile ({user?.name})</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  <span>Sign Out</span>
                </button>
              </div>
            </>
          ) : (
            <div className="pt-3 border-t border-slate-100 flex flex-col space-y-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-agri-600 text-white shadow-md shadow-agri-600/20"
              >
                <UserPlus className="w-4 h-4" />
                <span>Register Farmer Account</span>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
