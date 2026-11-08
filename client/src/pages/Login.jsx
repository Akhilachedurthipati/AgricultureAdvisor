import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Sprout, 
  LogIn, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '../components/common/LanguageSelector';

export default function Login() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState(location.state?.defaultIdentifier || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const from = location.state?.from?.pathname || '/dashboard';
  const successNotice = location.state?.successMessage || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !password) {
      setErrorMessage('Please enter both your mobile number or email and password.');
      return;
    }

    setLoading(true);
    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch (err) {
      setErrorMessage(err.message || 'Invalid credentials. Please verify and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('ramesh.farmer@example.com');
    setPassword('FarmerPassword123!');
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#F7F7F0] text-[#202923] select-none">
      
      {/* Top Header Bar: Logo on Left, Language Dropdown on Right */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between border-b border-slate-200/80 bg-white/70 backdrop-blur-sm">
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-9 h-9 rounded-xl bg-[#123D2A] text-white flex items-center justify-center shadow-xs border border-[#246B45]/30">
            <Sprout className="w-5 h-5 text-[#B6D957]" />
          </div>
          <span className="font-extrabold text-base tracking-tight text-[#123D2A] leading-tight">
            Agriculture Advisor
          </span>
        </Link>

        <div className="flex items-center">
          <LanguageSelector compact />
        </div>
      </header>

      {/* Main Login Form Container */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 w-full max-w-md mx-auto">
        <div className="w-full space-y-5 animate-in fade-in duration-300">
          
          {/* Header Title */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#123D2A] text-white shadow-premium mb-1 border border-[#246B45]/30">
              <Sprout className="w-7 h-7 text-[#B6D957]" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#202923] tracking-tight">
              {t('auth.loginTitle', 'Farmer Sign In')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              {t('auth.loginSubtitle', 'Sign in to access your farm recommendations and records')}
            </p>
          </div>

          {/* Quick Demo Credentials */}
          <div className="bg-white border border-[#D7DBC5] rounded-2xl p-4 flex items-center justify-between text-xs text-[#123D2A] shadow-xs">
            <div className="flex items-center space-x-2.5">
              <Sparkles className="w-4 h-4 text-[#246B45] shrink-0" />
              <div>
                <p className="font-bold text-[#123D2A]">Quick Demo Credentials</p>
                <p className="text-[11px] text-slate-500">Pre-fill demo farmer account</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleFillDemo}
              className="px-3 py-1.5 rounded-xl bg-[#123D2A] hover:bg-[#1D5939] text-white font-medium text-xs shadow-xs transition cursor-pointer"
            >
              Auto-Fill
            </button>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-premium p-6 sm:p-8">
            
            {/* Registration Success Banner */}
            {successNotice && (
              <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-[#246B45] shrink-0 mt-0.5" />
                <span className="font-medium">{successNotice}</span>
              </div>
            )}

            {/* Error Banner */}
            {errorMessage && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Email Field */}
              {/* Phone or Email Field */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {t('auth.phoneOrEmail', 'Mobile Number or Email')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. 9876543210 or farmer@example.com"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#123D2A] focus:ring-1 focus:ring-[#123D2A] text-xs sm:text-sm text-[#202923] placeholder-slate-400 outline-none transition"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    {t('auth.password', 'Password')}
                  </label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 focus:border-[#123D2A] focus:ring-1 focus:ring-[#123D2A] text-xs sm:text-sm text-[#202923] placeholder-slate-400 outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-[#123D2A] hover:bg-[#1D5939] text-white font-semibold text-xs sm:text-sm shadow-premium flex items-center justify-center space-x-2 transition disabled:opacity-70 cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Verifying account...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 text-[#B6D957]" />
                    <span>Sign In</span>
                  </>
                )}
              </button>
            </form>

            {/* Registration Redirect */}
            <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-500">
              <span>{t('auth.noAccount', "Don't have an account?")} </span>
              <Link 
                to="/register" 
                className="font-bold text-[#123D2A] hover:underline"
              >
                {t('auth.registerTitle', 'Register Farmer Account')}
              </Link>
            </div>

          </div>

          {/* Back Link */}
          <div className="text-center pt-2">
            <Link to="/get-started" className="text-xs font-semibold text-slate-500 hover:text-[#123D2A] transition">
              ← Back to Get Started
            </Link>
          </div>

        </div>
      </main>

      {/* Simple Footer */}
      <footer className="w-full py-5 text-center text-xs text-slate-500 border-t border-slate-200/80">
        <p>© {new Date().getFullYear()} Agriculture Advisor. All rights reserved.</p>
      </footer>

    </div>
  );
}
