import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sprout, ShieldAlert, Heart } from 'lucide-react';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="mt-auto border-t border-slate-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-100">
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#176B45] text-white flex items-center justify-center shadow-xs">
                <Sprout className="w-5 h-5 text-[#A3E635]" />
              </div>
              <span className="font-bold text-base tracking-tight text-[#176B45]">
                Agriculture Advisor
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Smart agricultural decision platform empowering farmers with AI-driven crop selection, fertilizer scheduling, foliar disease detection, and real-time weather alerts.
            </p>
          </div>

          {/* Advisory Services */}
          <div className="space-y-2.5">
            <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block">
              Advisory Services
            </span>
            <ul className="space-y-2 text-xs text-slate-600">
              <li><Link to="/crop-recommendation" className="hover:text-[#176B45] transition">Crop Recommendation</Link></li>
              <li><Link to="/fertilizer-recommendation" className="hover:text-[#176B45] transition">Fertilizer Guidance</Link></li>
              <li><Link to="/disease-detection" className="hover:text-[#176B45] transition">Foliar Disease Detection</Link></li>
              <li><Link to="/weather" className="hover:text-[#176B45] transition">Weather & Alerts</Link></li>
            </ul>
          </div>

          {/* Smart Features */}
          <div className="space-y-2.5">
            <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block">
              Smart Tools
            </span>
            <ul className="space-y-2 text-xs text-slate-600">
              <li><Link to="/ai-assistant" className="hover:text-[#176B45] transition">AI Farming Assistant</Link></li>
              <li><Link to="/history" className="hover:text-[#176B45] transition">Recommendation History</Link></li>
              <li><Link to="/dashboard" className="hover:text-[#176B45] transition">Farmer Dashboard</Link></li>
              <li><Link to="/profile" className="hover:text-[#176B45] transition">Farmer Profile</Link></li>
            </ul>
          </div>

          {/* Language & Support */}
          <div className="space-y-2.5">
            <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block">
              Multilingual Access
            </span>
            <p className="text-xs text-slate-500 leading-relaxed">
              Available in English, Telugu, Hindi, Tamil, Kannada, Malayalam, Marathi, and Bengali to assist farmers across diverse agricultural regions.
            </p>
            <div className="pt-1 flex flex-wrap gap-1 text-[10px] text-slate-600 font-medium">
              <span className="px-2 py-0.5 bg-slate-100 rounded-md">English</span>
              <span className="px-2 py-0.5 bg-slate-100 rounded-md">తెలుగు</span>
              <span className="px-2 py-0.5 bg-slate-100 rounded-md">हिन्दी</span>
              <span className="px-2 py-0.5 bg-slate-100 rounded-md">தமிழ்</span>
              <span className="px-2 py-0.5 bg-slate-100 rounded-md">मराठी</span>
            </div>
          </div>
        </div>

        {/* Disclaimer Notice */}
        <div className="text-[11px] text-slate-500 leading-relaxed space-y-2">
          <p className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <strong>⚠️ Agricultural Advisory Notice:</strong> All models, disease screenings, and nutrient calculations provided by Agriculture Advisor are decision-support advisories based on agricultural science and meteorological modeling. Always cross-verify critical field decisions with certified local agricultural extension officers or soil testing laboratories.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 text-slate-400">
            <p>© {new Date().getFullYear()} Agriculture Advisor. All rights reserved.</p>
            <p className="font-medium text-slate-500">Smart Farming Decision Support Platform</p>
          </div>
        </div>

      </div>
    </footer>
  );
}
