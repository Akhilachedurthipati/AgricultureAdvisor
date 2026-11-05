import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Sprout, 
  User, 
  LogOut, 
  LogIn, 
  UserPlus, 
  LayoutDashboard, 
  Home, 
  Menu, 
  X,
  ChevronDown,
  Globe
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    setProfileDropdownOpen(false);
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-agri-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand / Logo */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-agri-600 text-white flex items-center justify-center shadow-md shadow-agri-600/30 group-hover:scale-105 transition-transform">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight text-agri-950 block leading-tight">
              AGRICULTURE ADVISOR
            </span>
            <span className="text-[10px] text-agri-700 font-semibold uppercase tracking-wider block">
              AI Agricultural Decision Support
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1">
          <Link
            to="/"
            className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
              isActive('/') 
                ? 'bg-agri-50 text-agri-800 font-semibold' 
                : 'text-slate-600 hover:text-agri-700 hover:bg-slate-50'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </Link>

          {isAuthenticated && (
            <Link
              to="/dashboard"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                isActive('/dashboard') 
                  ? 'bg-agri-50 text-agri-800 font-semibold' 
                  : 'text-slate-600 hover:text-agri-700 hover:bg-slate-50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
          )}
        </nav>

        {/* Right Section: Auth State / User Profile */}
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
                    {user?.email}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Profile Dropdown */}
              {profileDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in slide-in-from-top-2"
                  onMouseLeave={() => setProfileDropdownOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-800 truncate">{user?.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                    {user?.location?.state && (
                      <p className="text-[10px] text-agri-700 mt-0.5">
                        📍 {user.location.city ? `${user.location.city}, ` : ''}{user.location.state}
                      </p>
                    )}
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
                    <span>My Dashboard</span>
                  </Link>

                  <div className="border-t border-slate-100 my-1"></div>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition font-medium text-left"
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
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-agri-700 hover:bg-slate-100 transition"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-agri-600 hover:bg-agri-700 text-white shadow-md shadow-agri-600/20 transition"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Register Farmer</span>
              </Link>
            </div>
          )}

        </div>

        {/* Mobile menu toggle button */}
        <div className="flex md:hidden items-center space-x-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-3 space-y-2">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-agri-50"
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-agri-50"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-agri-50"
              >
                <User className="w-4 h-4" />
                <span>Profile ({user?.name})</span>
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </>
          ) : (
            <div className="pt-2 border-t border-slate-100 flex flex-col space-y-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-agri-600 text-white"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Register Farmer</span>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
