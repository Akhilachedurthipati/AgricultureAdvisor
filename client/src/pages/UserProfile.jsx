import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Languages, 
  Calendar, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'te', name: 'తెలుగు (Telugu)' },
  { code: 'hi', name: 'हिन्दी (Hindi)' },
  { code: 'ta', name: 'தமிழ் (Tamil)' },
  { code: 'kn', name: 'ಕನ್ನಡ (Kannada)' },
  { code: 'ml', name: 'മലയാളം (Malayalam)' },
  { code: 'mr', name: 'मराठी (Marathi)' },
  { code: 'bn', name: 'বাংলা (Bengali)' },
];

export default function UserProfile() {
  const { user, updateProfile } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    preferredLanguage: user?.preferredLanguage || 'en',
    state: user?.location?.state || '',
    district: user?.location?.district || '',
    city: user?.location?.city || ''
  });

  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');
    setSaving(true);

    try {
      await updateProfile({
        name: formData.name,
        phone: formData.phone,
        preferredLanguage: formData.preferredLanguage,
        location: {
          state: formData.state,
          district: formData.district,
          city: formData.city
        }
      });
      setSuccessMessage('Profile information saved successfully!');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Farmer Profile
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your personal farm details, preferred language, and geographical location
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Verified Account</span>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Profile Overview Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex flex-col items-center text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-agri-600 text-white flex items-center justify-center font-bold text-3xl shadow-lg shadow-agri-600/30">
            {formData.name ? formData.name.charAt(0).toUpperCase() : 'F'}
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-900">{formData.name || 'Farmer'}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{user?.email}</p>
          </div>

          <div className="w-full pt-4 border-t border-slate-100 space-y-2.5 text-xs text-left">
            <div className="flex items-center text-slate-600 gap-2">
              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="truncate">{user?.email}</span>
            </div>
            <div className="flex items-center text-slate-600 gap-2">
              <Phone className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{formData.phone || 'No phone added'}</span>
            </div>
            <div className="flex items-center text-slate-600 gap-2">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <span>
                {formData.state 
                  ? `${formData.city ? `${formData.city}, ` : ''}${formData.state}` 
                  : 'Location not configured'}
              </span>
            </div>
            <div className="flex items-center text-slate-600 gap-2">
              <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Active'}</span>
            </div>
          </div>
        </div>

        {/* Right Form Card */}
        <div className="md:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            <h3 className="text-sm font-bold text-slate-800 pb-2 border-b border-slate-100">
              Personal & Farm Information
            </h3>

            {/* Name & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-agri-500 focus:ring-2 focus:ring-agri-500/20 text-xs sm:text-sm text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email Address (Immutable)
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-400 text-xs sm:text-sm cursor-not-allowed"
                />
              </div>
            </div>

            {/* Phone & Preferred Language */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Contact Mobile Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="10-digit number"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-agri-500 focus:ring-2 focus:ring-agri-500/20 text-xs sm:text-sm text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Default Advisory Language
                </label>
                <select
                  name="preferredLanguage"
                  value={formData.preferredLanguage}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-agri-500 focus:ring-2 focus:ring-agri-500/20 text-xs sm:text-sm bg-white text-slate-800"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Location Details */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Farm Geographic Location
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <span className="text-[11px] text-slate-400 block mb-1">State</span>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="e.g. Telangana"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-agri-500 text-xs text-slate-800"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block mb-1">District</span>
                  <input
                    type="text"
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    placeholder="e.g. Karimnagar"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-agri-500 text-xs text-slate-800"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block mb-1">Village / City</span>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="e.g. Sircilla"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-agri-500 text-xs text-slate-800"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-agri-600 hover:bg-agri-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-agri-600/30 transition disabled:opacity-70 cursor-pointer"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>

          </form>
        </div>

      </div>

    </div>
  );
}
