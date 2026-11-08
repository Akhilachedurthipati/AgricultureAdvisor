import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Sprout, 
  UserPlus, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  MapPin, 
  Languages, 
  Eye, 
  EyeOff, 
  AlertCircle 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES } from '../i18n';
import LanguageSelector from '../components/common/LanguageSelector';

export default function Register() {
  const { t, i18n } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    preferredLanguage: i18n.language || 'en',
    state: '',
    district: '',
    city: '',
    password: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    if (name === 'preferredLanguage') {
      i18n.changeLanguage(value);
      localStorage.setItem('agri_preferred_language', value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify.');
      return;
    }

    if (formData.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        preferredLanguage: formData.preferredLanguage,
        location: {
          state: formData.state,
          district: formData.district,
          city: formData.city
        },
        password: formData.password
      });

      // Redirect to Login after successful registration as required
      navigate('/login', { 
        replace: true,
        state: { successMessage: 'Registration successful! Please sign in with your credentials.' }
      });
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed. Please check your information.');
    } finally {
      setLoading(false);
    }
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

      {/* Main Form Area */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 w-full max-w-xl mx-auto">
        <div className="w-full space-y-5 animate-in fade-in duration-300">
          
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#123D2A] text-white shadow-premium mb-1 border border-[#246B45]/30">
              <Sprout className="w-7 h-7 text-[#B6D957]" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#202923] tracking-tight">
              {t('auth.registerTitle', 'Register Farmer Account')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              {t('auth.registerSubtitle', 'Join Agriculture Advisor for personalized crop and fertilizer recommendations')}
            </p>
          </div>

          {/* Form Container */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-premium p-6 sm:p-8">
            
            {errorMessage && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Full Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    {t('auth.name', 'Farmer Full Name')} *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Ramesh Patel"
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#123D2A] focus:ring-1 focus:ring-[#123D2A] text-xs sm:text-sm outline-none transition text-[#202923]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    {t('auth.phone', 'Phone Number')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="9876543210"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#123D2A] focus:ring-1 focus:ring-[#123D2A] text-xs sm:text-sm outline-none transition text-[#202923]"
                    />
                  </div>
                </div>
              </div>

              {/* Email & Preferred Language */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    {t('auth.email', 'Email Address')} *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="farmer@example.com"
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#123D2A] focus:ring-1 focus:ring-[#123D2A] text-xs sm:text-sm outline-none transition text-[#202923]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    {t('auth.preferredLanguage', 'Preferred Language')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Languages className="w-4 h-4" />
                    </div>
                    <select
                      name="preferredLanguage"
                      value={formData.preferredLanguage}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#123D2A] focus:ring-1 focus:ring-[#123D2A] text-xs sm:text-sm bg-white outline-none transition text-[#202923]"
                    >
                      {SUPPORTED_LANGUAGES.map((lang) => (
                        <option key={lang.code} value={lang.code}>
                          {lang.nativeName} ({lang.name})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Location (State, District, City) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Farm Location Details ({t('auth.state', 'State')}, {t('auth.district', 'District')}, {t('auth.city', 'Town/Village')})
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder={t('auth.state', 'State')}
                    className="py-2.5 px-3 rounded-xl border border-slate-200 focus:border-[#123D2A] focus:ring-1 focus:ring-[#123D2A] text-xs outline-none transition text-[#202923]"
                  />
                  <input
                    type="text"
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    placeholder={t('auth.district', 'District')}
                    className="py-2.5 px-3 rounded-xl border border-slate-200 focus:border-[#123D2A] focus:ring-1 focus:ring-[#123D2A] text-xs outline-none transition text-[#202923]"
                  />
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder={t('auth.city', 'Town / Village')}
                    className="py-2.5 px-3 rounded-xl border border-slate-200 focus:border-[#123D2A] focus:ring-1 focus:ring-[#123D2A] text-xs outline-none transition text-[#202923]"
                  />
                </div>
              </div>

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    {t('auth.password', 'Password')} (min 6 chars) *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      required
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 focus:border-[#123D2A] focus:ring-1 focus:ring-[#123D2A] text-xs sm:text-sm outline-none transition text-[#202923]"
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

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Confirm {t('auth.password', 'Password')} *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#123D2A] focus:ring-1 focus:ring-[#123D2A] text-xs sm:text-sm outline-none transition text-[#202923]"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 py-3 px-4 rounded-xl bg-[#123D2A] hover:bg-[#1D5939] text-white font-semibold text-xs sm:text-sm shadow-premium flex items-center justify-center space-x-2 transition disabled:opacity-70 cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Creating your account...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 text-[#B6D957]" />
                    <span>Create Farmer Account</span>
                  </>
                )}
              </button>
            </form>

            {/* Login Redirect */}
            <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-500">
              <span>{t('auth.haveAccount', 'Already registered?')} </span>
              <Link 
                to="/login" 
                className="font-bold text-[#123D2A] hover:underline"
              >
                {t('auth.loginBtn', 'Sign In to Your Account')}
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
