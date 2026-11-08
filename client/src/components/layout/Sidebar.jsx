import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Sprout, 
  LayoutDashboard, 
  FlaskConical, 
  ScanSearch, 
  CloudSun, 
  Bot, 
  History, 
  User, 
  LogOut, 
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import LanguageSelector from '../common/LanguageSelector';

export default function Sidebar({ isOpen, onClose }) {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    if (onClose) onClose();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const NAV_ITEMS = [
    {
      name: t('nav.dashboard', 'Dashboard'),
      path: '/dashboard',
      icon: LayoutDashboard
    },
    {
      name: t('nav.cropAdvisory', 'Crop Recommendation'),
      path: '/crop-recommendation',
      icon: Sprout
    },
    {
      name: t('nav.fertilizer', 'Fertilizer Recommendation'),
      path: '/fertilizer-recommendation',
      icon: FlaskConical
    },
    {
      name: t('nav.diseaseDetection', 'Disease Detection'),
      path: '/disease-detection',
      icon: ScanSearch
    },
    {
      name: t('nav.weather', 'Weather Monitoring'),
      path: '/weather',
      icon: CloudSun
    },
    {
      name: t('nav.aiAssistant', 'AI Farming Assistant'),
      path: '/ai-assistant',
      icon: Bot
    },
    {
      name: t('nav.history', 'Recommendation History'),
      path: '/history',
      icon: History
    },
    {
      name: t('nav.farmerProfile', 'Farmer Profile'),
      path: '/profile',
      icon: User
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 w-64 bg-white border-r border-slate-200 z-50 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top: Brand Header */}
        <div>
          <div className="h-16 px-5 border-b border-slate-100 flex items-center justify-between">
            <Link 
              to="/" 
              onClick={onClose}
              className="flex items-center space-x-2.5 group"
            >
              <div className="w-9 h-9 rounded-xl bg-[#176B45] text-white flex items-center justify-center shadow-xs shrink-0">
                <Sprout className="w-5 h-5 text-[#A3E635]" />
              </div>
              <div className="overflow-hidden">
                <span className="text-base font-extrabold tracking-tight text-[#176B45] block leading-tight truncate">
                  Agriculture Advisor
                </span>
                <span className="text-[10px] text-slate-400 font-medium block leading-none truncate">
                  Smart Farming Platform
                </span>
              </div>
            </Link>

            {/* Mobile Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 lg:hidden cursor-pointer"
              aria-label="Close Sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links List */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-12rem)]">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors duration-150 ${
                    active 
                      ? 'bg-[#E8F5EE] text-[#176B45] font-bold border-l-4 border-[#176B45]' 
                      : 'text-slate-600 hover:text-[#176B45] hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-[#176B45]' : 'text-slate-400'}`} />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom: Farmer Profile, Language & Logout */}
        <div className="p-3 border-t border-slate-100 space-y-2 bg-[#F7FAF7]/60">
          <div className="px-2 py-1 flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Language
            </span>
            <LanguageSelector compact />
          </div>

          {/* Farmer Card */}
          {user && (
            <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-xs flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-[#176B45] text-white flex items-center justify-center font-bold text-xs shrink-0">
                {user.name ? user.name.charAt(0).toUpperCase() : 'F'}
              </div>
              <div className="overflow-hidden flex-1 text-left">
                <p className="text-xs font-bold text-[#1F2937] truncate leading-tight">
                  {user.name || 'Farmer'}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {user.location?.district ? `${user.location.district}, ` : ''}{user.location?.state || user.email || 'Farm'}
                </p>
              </div>
            </div>
          )}

          {/* Logout Action */}
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-rose-500 shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
