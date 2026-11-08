import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sprout } from 'lucide-react';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="mt-auto border-t border-slate-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-6 border-b border-slate-100 text-xs">
          {/* Brand Info */}
          <div className="space-y-2 md:col-span-1">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-[#176B45] text-white flex items-center justify-center">
                <Sprout className="w-4 h-4 text-[#A3E635]" />
              </div>
              <span className="font-extrabold text-sm tracking-tight text-[#176B45]">
                Agriculture Advisor
              </span>
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Smart farming decision platform providing crop recommendations, fertilizer schedules, disease screening, and weather insights.
            </p>
          </div>

          {/* Advisory Services */}
          <div className="space-y-1.5">
            <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px] block">
              Advisory Services
            </span>
            <ul className="space-y-1 text-slate-600 text-[11px]">
              <li><Link to="/crop-recommendation" className="hover:text-[#176B45] transition">Crop Recommendation</Link></li>
              <li><Link to="/fertilizer-recommendation" className="hover:text-[#176B45] transition">Fertilizer Guidance</Link></li>
              <li><Link to="/disease-detection" className="hover:text-[#176B45] transition">Foliar Disease Detection</Link></li>
              <li><Link to="/weather" className="hover:text-[#176B45] transition">Weather & Alerts</Link></li>
            </ul>
          </div>

          {/* Smart Features */}
          <div className="space-y-1.5">
            <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px] block">
              Smart Tools
            </span>
            <ul className="space-y-1 text-slate-600 text-[11px]">
              <li><Link to="/ai-assistant" className="hover:text-[#176B45] transition">AI Farming Assistant</Link></li>
              <li><Link to="/history" className="hover:text-[#176B45] transition">Recommendation History</Link></li>
              <li><Link to="/dashboard" className="hover:text-[#176B45] transition">Farmer Dashboard</Link></li>
              <li><Link to="/profile" className="hover:text-[#176B45] transition">Farmer Profile</Link></li>
            </ul>
          </div>

          {/* Languages */}
          <div className="space-y-1.5">
            <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px] block">
              Languages
            </span>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Available in English, Telugu, Hindi, Tamil, Kannada, Marathi, Malayalam, and Bengali.
            </p>
            <div className="pt-0.5 flex flex-wrap gap-1 text-[10px] text-slate-600">
              <span className="px-1.5 py-0.5 bg-slate-100 rounded">EN</span>
              <span className="px-1.5 py-0.5 bg-slate-100 rounded">తెలుగు</span>
              <span className="px-1.5 py-0.5 bg-slate-100 rounded">हिन्दी</span>
              <span className="px-1.5 py-0.5 bg-slate-100 rounded">தமிழ்</span>
              <span className="px-1.5 py-0.5 bg-slate-100 rounded">मराठी</span>
            </div>
          </div>
        </div>

        {/* Disclaimer Notice */}
        <div className="text-[11px] text-slate-500 space-y-2">
          <p className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 leading-relaxed text-[11px]">
            <strong>⚠️ Agricultural Advisory Notice:</strong> All recommendations are computational agronomic advisories based on agricultural science and meteorological models. Cross-verify critical decisions with local agricultural extension officers or certified testing laboratories.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-slate-400 text-[11px] pt-1">
            <p>© {new Date().getFullYear()} Agriculture Advisor. All rights reserved.</p>
            <p className="font-medium text-slate-500">Smart Farming Decision Support Platform</p>
          </div>
        </div>

      </div>
    </footer>
  );
}
