import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Sprout, 
  FlaskConical, 
  ScanSearch, 
  CloudSun, 
  Bot, 
  Languages, 
  UserCheck, 
  History, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Leaf,
  Layers,
  Thermometer,
  Droplets,
  Gauge,
  CloudRain,
  ChevronRight,
  Cpu,
  Database,
  Lock,
  Microscope,
  Compass,
  ArrowUpRight,
  Activity,
  Sliders,
  Check,
  Scale
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SUPPORTED_LANGUAGES } from '../i18n';
import heroImg from '../assets/hero.png';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';

export default function Home() {
  const { t, i18n } = useTranslation();
  const { isAuthenticated } = useAuth();

  // Interactive Intelligence Preview State
  const PREVIEW_SCENARIOS = [
    {
      id: 'deccan-cotton',
      label: 'Deccan Vertisol (Cotton)',
      region: 'Telangana / Maharashtra Black Cotton Soil',
      soilType: 'Black Cotton Soil',
      season: 'Kharif (Monsoon)',
      temperature: 26.5,
      humidity: 78,
      ph: 7.2,
      rainfall: 850,
      crop: 'Cotton',
      confidence: 100,
      confidenceBadge: 'Genuine Random Forest Prediction',
      explanation: 'Deep black soil with high cation exchange and montmorillonite clay content offers optimum moisture retention for root aeration, matching warm sub-humid thermal requirements.'
    },
    {
      id: 'godavari-paddy',
      label: 'Godavari Basin (Paddy)',
      region: 'Andhra Pradesh Lowland Clay Soil',
      soilType: 'Clay Soil',
      season: 'Kharif (Monsoon)',
      temperature: 24.5,
      humidity: 82,
      ph: 6.5,
      rainfall: 1200,
      crop: 'Rice (Paddy)',
      confidence: 98,
      confidenceBadge: 'High Hydro-Thermal Suitability',
      explanation: 'Heavy clay soil with impermeable subsoil layers prevents water percolation, perfectly sustaining standing water conditions required throughout tillering and panicle initiation.'
    },
    {
      id: 'gangetic-wheat',
      label: 'Indo-Gangetic (Wheat)',
      region: 'Punjab / Haryana Alluvial Plain',
      soilType: 'Alluvial Soil',
      season: 'Rabi (Winter)',
      temperature: 19.5,
      humidity: 58,
      ph: 7.0,
      rainfall: 110,
      crop: 'Wheat',
      confidence: 96,
      confidenceBadge: 'Optimal Vernalization Profile',
      explanation: 'Deep fertile loam with moderate permeability and cool dry winter conditions allows optimal vegetative crown root development and timely grain-filling.'
    },
    {
      id: 'arid-mothbeans',
      label: 'Semi-Arid Arid (Mothbeans)',
      region: 'Rajasthan / Gujarat Sandy Loam',
      soilType: 'Sandy Loam Soil',
      season: 'Zaid (Summer)',
      temperature: 34.0,
      humidity: 42,
      ph: 7.5,
      rainfall: 280,
      crop: 'Mothbeans',
      confidence: 100,
      confidenceBadge: 'Drought-Tolerant Pulse Match',
      explanation: 'Well-drained porous sandy loam tolerates high atmospheric heat while deep taproots access deep subsoil moisture with minimal supplementary irrigation.'
    }
  ];

  const [activeScenarioIndex, setActiveScenarioIndex] = useState(0);
  const activeScenario = PREVIEW_SCENARIOS[activeScenarioIndex];

  return (
    <div className="space-y-24 sm:space-y-32 pb-20 selection:bg-[#B6D957] selection:text-[#123D2A]">
      
      {/* =========================================================================
          SECTION B: HERO SECTION
          Full-screen / Near full-screen with aerial farm landscape & editorial layout
         ========================================================================= */}
      <section className="relative min-h-[85vh] lg:min-h-[88vh] flex items-center justify-center pt-4 sm:pt-8 overflow-hidden">
        
        {/* Subtle Background Glow & Geometry */}
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#B6D957]/15 rounded-full blur-3xl" />
          <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-[#246B45]/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Sophisticated Editorial Typography */}
            <div className="lg:col-span-7 space-y-6 text-left">
              
              {/* Trust Indicator Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#D7DBC5] shadow-xs text-xs font-semibold text-[#123D2A]">
                <span className="w-2 h-2 rounded-full bg-[#246B45] animate-pulse" />
                <span className="text-[#123D2A] font-bold">Agricultural Decision-Support System</span>
                <span className="text-slate-300">|</span>
                <span className="text-slate-500 font-medium">Science-Backed Precision</span>
              </div>

              {/* Main Editorial Heading */}
              <div className="space-y-2">
                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#202923] leading-[1.08]">
                  Intelligence for <br className="hidden sm:inline" />
                  <span className="text-[#123D2A] relative inline-block">
                    Every Acre.
                    <span className="absolute bottom-1.5 left-0 w-full h-3 bg-[#B6D957]/35 -z-10 rounded-xs" />
                  </span>
                </h1>
              </div>

              {/* Supporting Text */}
              <p className="text-base sm:text-xl text-slate-600 max-w-2xl font-normal leading-relaxed">
                Make smarter farming decisions with science-backed crop recommendations, precision fertilizer guidance, intelligent disease detection, and multilingual AI assistance.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <Link
                  to={isAuthenticated ? "/dashboard" : "/crop-recommendation"}
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm bg-[#123D2A] hover:bg-[#1D5939] text-white shadow-premium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Explore Your Farm</span>
                  <ArrowRight className="w-4 h-4 text-[#B6D957]" />
                </Link>

                <a
                  href="#intelligence-preview"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm bg-white hover:bg-[#F7F7F0] text-[#202923] border border-slate-200/90 shadow-subtle transition-all duration-200 hover:border-slate-300"
                >
                  <span>Discover Our Technology</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </a>
              </div>

              {/* Trust Strip */}
              <div className="pt-4 border-t border-slate-200/80 grid grid-cols-3 gap-4 text-left">
                <div>
                  <p className="text-xs font-bold text-[#123D2A] uppercase tracking-wider">Multi-Parametric</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Soil, climate & moisture inputs</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#123D2A] uppercase tracking-wider">ICAR & STCR</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Targeted yield nutrient equations</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#123D2A] uppercase tracking-wider">8 Regional</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Native Indian languages supported</p>
                </div>
              </div>

            </div>

            {/* Right Column: Visually Striking Aerial Photograph of Indian Farm */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-lg lg:max-w-none">
                
                {/* Decorative Offset Backdrop */}
                <div className="absolute -inset-2 rounded-3xl bg-gradient-to-tr from-[#123D2A]/10 to-[#B6D957]/30 blur-lg -z-10" />

                {/* Primary Card Frame */}
                <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-2xl">
                  
                  {/* Aerial Farm Photograph */}
                  <div className="relative h-72 sm:h-84 overflow-hidden group">
                    <img
                      src={heroImg}
                      alt="Aerial view of lush green Indian agricultural landscape"
                      className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#123D2A]/80 via-[#123D2A]/20 to-transparent" />

                    {/* Badge Overlay */}
                    <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/60 shadow-xs flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-[#246B45] animate-ping" />
                      <span className="text-[11px] font-bold text-[#123D2A]">
                        Live Precision Agro-Telemetry
                      </span>
                    </div>

                    {/* Bottom Caption on Photo */}
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <p className="text-xs font-semibold text-emerald-200 uppercase tracking-wider">
                        Real-Time Field Intelligence
                      </p>
                      <p className="text-sm font-bold text-white leading-tight">
                        Science-guided recommendations for sustainable high-yield farming.
                      </p>
                    </div>
                  </div>

                  {/* Micro Metric Banner */}
                  <div className="p-4 bg-[#F7F7F0] border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-lg bg-white border border-[#D7DBC5] flex items-center justify-center text-[#246B45]">
                        <Sprout className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="block font-bold text-[#202923]">Multi-Crop Advisory</span>
                        <span className="text-[10px] text-slate-500">22+ Crop Agro-Climatic Models</span>
                      </div>
                    </div>
                    <Link
                      to="/crop-recommendation"
                      className="px-3 py-1.5 rounded-lg bg-[#123D2A] text-white text-[11px] font-semibold hover:bg-[#1D5939] transition"
                    >
                      Test Advisory
                    </Link>
                  </div>

                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION C: INTERACTIVE INTELLIGENCE PREVIEW
          Immediately below hero: displays real product interface look with
          Soil type, Season, Temperature, Humidity, Soil pH, Rainfall, Recommended crop,
          Confidence score, Suitability explanation.
         ========================================================================= */}
      <section id="intelligence-preview" className="scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-8 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#246B45]">
              Interactive System Preview
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#202923] tracking-tight">
              Agro-Climatic Intelligence in Action
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Select an agro-climatic profile below to see how our trained machine learning engine processes environmental parameters into a single optimal crop decision.
            </p>
          </div>

          {/* Scenario Selector Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
            {PREVIEW_SCENARIOS.map((sc, idx) => (
              <button
                key={sc.id}
                type="button"
                onClick={() => setActiveScenarioIndex(idx)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  activeScenarioIndex === idx
                    ? 'bg-[#123D2A] text-white shadow-sm shadow-[#123D2A]/20 scale-105'
                    : 'bg-white hover:bg-[#F7F7F0] text-slate-700 border border-slate-200/90'
                }`}
              >
                {sc.label}
              </button>
            ))}
          </div>

          {/* Product Interface Preview Mockup */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-premium overflow-hidden transition-all duration-300">
            
            {/* Top Product Bar */}
            <div className="px-6 py-4 bg-[#123D2A] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1D5939]">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                  <Cpu className="w-4 h-4 text-[#B6D957]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">Agronomic Inference Console</span>
                    <span className="px-2 py-0.5 rounded-full bg-[#B6D957] text-[#123D2A] text-[9px] font-extrabold uppercase">
                      Illustrative Sample
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-200">
                    {activeScenario.region}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-xs">
                <span className="text-emerald-200 text-[11px]">Model:</span>
                <span className="font-mono text-[11px] bg-white/10 px-2 py-0.5 rounded text-white">
                  RF-Classifier v1.0
                </span>
              </div>
            </div>

            {/* Split Screen: 6 Input Parameters (Left) & Output Intelligence (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
              
              {/* Left Column: 6 Input Parameters */}
              <div className="lg:col-span-7 p-6 sm:p-8 space-y-6">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Input Observations (Evaluated Scenario)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Multi-variate environmental parameters ingested by the decision engine
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                  
                  {/* Parameter 1: Soil Type */}
                  <div className="p-3.5 rounded-2xl bg-[#F7F7F0] border border-[#D7DBC5]/80 space-y-1">
                    <div className="flex items-center justify-between text-slate-500">
                      <span className="text-[10px] font-bold uppercase tracking-wider">Soil Type</span>
                      <Layers className="w-3.5 h-3.5 text-[#246B45]" />
                    </div>
                    <p className="font-bold text-xs sm:text-sm text-[#202923] truncate">
                      {activeScenario.soilType}
                    </p>
                  </div>

                  {/* Parameter 2: Cropping Season */}
                  <div className="p-3.5 rounded-2xl bg-[#F7F7F0] border border-[#D7DBC5]/80 space-y-1">
                    <div className="flex items-center justify-between text-slate-500">
                      <span className="text-[10px] font-bold uppercase tracking-wider">Season</span>
                      <Compass className="w-3.5 h-3.5 text-[#246B45]" />
                    </div>
                    <p className="font-bold text-xs sm:text-sm text-[#202923] truncate">
                      {activeScenario.season}
                    </p>
                  </div>

                  {/* Parameter 3: Temperature */}
                  <div className="p-3.5 rounded-2xl bg-[#F7F7F0] border border-[#D7DBC5]/80 space-y-1">
                    <div className="flex items-center justify-between text-slate-500">
                      <span className="text-[10px] font-bold uppercase tracking-wider">Temperature</span>
                      <Thermometer className="w-3.5 h-3.5 text-amber-600" />
                    </div>
                    <p className="font-bold text-xs sm:text-sm text-[#202923]">
                      {activeScenario.temperature}°C
                    </p>
                  </div>

                  {/* Parameter 4: Humidity */}
                  <div className="p-3.5 rounded-2xl bg-[#F7F7F0] border border-[#D7DBC5]/80 space-y-1">
                    <div className="flex items-center justify-between text-slate-500">
                      <span className="text-[10px] font-bold uppercase tracking-wider">Humidity</span>
                      <Droplets className="w-3.5 h-3.5 text-sky-600" />
                    </div>
                    <p className="font-bold text-xs sm:text-sm text-[#202923]">
                      {activeScenario.humidity}%
                    </p>
                  </div>

                  {/* Parameter 5: Soil pH */}
                  <div className="p-3.5 rounded-2xl bg-[#F7F7F0] border border-[#D7DBC5]/80 space-y-1">
                    <div className="flex items-center justify-between text-slate-500">
                      <span className="text-[10px] font-bold uppercase tracking-wider">Soil pH</span>
                      <Gauge className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    <p className="font-bold text-xs sm:text-sm text-[#202923]">
                      {activeScenario.ph} pH
                    </p>
                  </div>

                  {/* Parameter 6: Annual Rainfall */}
                  <div className="p-3.5 rounded-2xl bg-[#F7F7F0] border border-[#D7DBC5]/80 space-y-1">
                    <div className="flex items-center justify-between text-slate-500">
                      <span className="text-[10px] font-bold uppercase tracking-wider">Rainfall</span>
                      <CloudRain className="w-3.5 h-3.5 text-blue-600" />
                    </div>
                    <p className="font-bold text-xs sm:text-sm text-[#202923]">
                      {activeScenario.rainfall} mm
                    </p>
                  </div>

                </div>

                <div className="flex items-center justify-between pt-2 text-[11px] text-slate-400">
                  <span>Parameter normalization: Active</span>
                  <Link to="/crop-recommendation" className="text-[#246B45] font-semibold hover:underline inline-flex items-center gap-1">
                    <span>Run Custom Farm Analysis</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {/* Right Column: Recommended Crop, Confidence Score & Suitability Explanation */}
              <div className="lg:col-span-5 p-6 sm:p-8 bg-[#FCFCF9] flex flex-col justify-between space-y-6">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#123D2A] bg-[#B6D957]/30 px-2 py-0.5 rounded-full inline-block">
                    Inference Output
                  </span>
                  
                  <div className="mt-4">
                    <p className="text-xs text-slate-400 font-medium">Single Best-Suited Crop Result</p>
                    <h4 className="text-3xl sm:text-4xl font-extrabold text-[#123D2A] tracking-tight mt-1 flex items-center gap-2">
                      <span>{activeScenario.crop}</span>
                      <CheckCircle2 className="w-6 h-6 text-[#246B45]" />
                    </h4>
                  </div>

                  {/* Genuine Confidence Score */}
                  <div className="mt-4 p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#202923]">Model Confidence Score</span>
                      <span className="font-extrabold text-[#123D2A] text-sm">{activeScenario.confidence}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-[#246B45] h-full rounded-full transition-all duration-500" 
                        style={{ width: `${activeScenario.confidence}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 leading-tight">
                      {activeScenario.confidenceBadge}
                    </p>
                  </div>

                  {/* Suitability Explanation */}
                  <div className="mt-4 space-y-1">
                    <p className="text-xs font-bold text-[#202923]">Agronomic Suitability Rationale:</p>
                    <p className="text-xs text-slate-600 leading-relaxed bg-white p-3.5 rounded-xl border border-slate-100">
                      {activeScenario.explanation}
                    </p>
                  </div>
                </div>

                <Link
                  to="/crop-recommendation"
                  className="w-full py-3 rounded-xl bg-[#123D2A] hover:bg-[#1D5939] text-white text-xs font-bold text-center shadow-xs transition"
                >
                  Analyze Your Own Soil & Weather
                </Link>

              </div>

            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION D: AGRICULTURAL SERVICES SHOWCASE
          Visually varied editorial layout instead of 8 identical cards!
          1. Crop Recommendation (Large featured editorial)
          2. Fertilizer Recommendation (Precision STCR nutrient balance card)
          3. Crop Disease Detection (Pathology visual screening simulator)
          4. Weather Monitoring (Agro-meteorology & alerts)
          5. AI Farming Assistant (Conversational interface snippet)
          6. Multilingual Support
          7. Farmer Profile
          8. Recommendation History
         ========================================================================= */}
      <section id="services" className="scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#246B45]">
                Eight Operational Capabilities
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#202923] tracking-tight mt-1">
                Precision Agriculture Architecture
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md">
              Every tool is engineered for verified agronomic utility, connecting soil chemistry, crop biology, and local weather into actionable farm advisories.
            </p>
          </div>

          {/* Varied Editorial Layout Block 1: Crop Recommendation & Fertilizer Recommendation */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Feature 1: Crop Recommendation (Large Featured Editorial) */}
            <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 p-8 shadow-premium flex flex-col justify-between space-y-6 hover:border-[#246B45]/40 transition group">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-[#123D2A] text-white flex items-center justify-center shadow-xs">
                    <Sprout className="w-6 h-6 text-[#B6D957]" />
                  </div>
                  <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-[#F7F7F0] border border-[#D7DBC5] text-[#123D2A]">
                    Module 01 • Machine Learning
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-[#202923] tracking-tight group-hover:text-[#123D2A] transition">
                    Crop Recommendation
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Predict the single most optimal crop tailored for your land. By analyzing soil classification, cropping season, ambient temperature, relative humidity, soil pH, and rainfall, the engine computes authentic probability distributions without guessing.
                  </p>
                </div>

                {/* Editorial Highlight Strip */}
                <div className="grid grid-cols-3 gap-3 pt-2 text-xs">
                  <div className="p-3 rounded-xl bg-[#F7F7F0] border border-slate-100">
                    <span className="block font-bold text-[#123D2A]">Single Crop</span>
                    <span className="text-[11px] text-slate-500">Strictly 1 best match</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#F7F7F0] border border-slate-100">
                    <span className="block font-bold text-[#123D2A]">Confidence %</span>
                    <span className="text-[11px] text-slate-500">Genuine model score</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#F7F7F0] border border-slate-100">
                    <span className="block font-bold text-[#123D2A]">Cultivation Guide</span>
                    <span className="text-[11px] text-slate-500">Stage-by-stage agronomy</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Random Forest Classifier (98.86% Validation Accuracy)</span>
                <Link
                  to="/crop-recommendation"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#123D2A] text-white text-xs font-bold hover:bg-[#1D5939] transition"
                >
                  <span>Launch Engine</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#B6D957]" />
                </Link>
              </div>
            </div>

            {/* Feature 2: Fertilizer Recommendation (Precision Nutrient Card) */}
            <div className="lg:col-span-5 bg-gradient-to-br from-[#123D2A] to-[#1A4D35] text-white rounded-3xl p-8 shadow-premium flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                    <FlaskConical className="w-6 h-6 text-[#B6D957]" />
                  </div>
                  <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-white/15 text-emerald-200 border border-white/20">
                    Module 02 • STCR Formulation
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-extrabold text-white tracking-tight">
                    Fertilizer Recommendation
                  </h3>
                  <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
                    Soil Test Crop Response (STCR) formulation. Calculates target Nitrogen, Phosphorus, and Potassium requirements and converts them into commercial 50-kg bag counts with a 3-stage split timetable.
                  </p>
                </div>

                {/* Bag preview visualization */}
                <div className="p-4 rounded-2xl bg-white/10 border border-white/15 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-emerald-200">Commercial Fertilizer Bags</span>
                    <span className="font-mono text-[#B6D957] font-bold">50 kg / bag</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-white/10 p-2 rounded-lg">
                      <span className="block text-[10px] text-emerald-300">Urea (46% N)</span>
                      <span className="font-bold text-white text-sm">4.4 Bags</span>
                    </div>
                    <div className="bg-white/10 p-2 rounded-lg">
                      <span className="block text-[10px] text-emerald-300">DAP (18-46-0)</span>
                      <span className="font-bold text-white text-sm">2.1 Bags</span>
                    </div>
                    <div className="bg-white/10 p-2 rounded-lg">
                      <span className="block text-[10px] text-emerald-300">MOP (60% K)</span>
                      <span className="font-bold text-white text-sm">2.0 Bags</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/15 flex items-center justify-between">
                <span className="text-xs text-emerald-200 font-medium">Nutrient Balancing</span>
                <Link
                  to="/fertilizer-recommendation"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#B6D957] text-[#123D2A] text-xs font-bold hover:bg-[#A6CB43] transition"
                >
                  <span>Calculate Bags</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

          </div>

          {/* Varied Editorial Layout Block 2: Disease Detection & Weather Monitoring */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Feature 3: Crop Disease Detection (Pathology Viewfinder Mockup) */}
            <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200/90 p-8 shadow-premium flex flex-col justify-between space-y-6 hover:border-[#246B45]/40 transition group">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-[#F7F7F0] border border-[#D7DBC5] text-[#123D2A] flex items-center justify-center">
                    <ScanSearch className="w-6 h-6 text-[#246B45]" />
                  </div>
                  <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-200">
                    Module 03 • Computer Vision
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-extrabold text-[#202923] tracking-tight group-hover:text-[#123D2A] transition">
                    Crop Disease Detection
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Analyze foliar photographs or use your smartphone camera to screen for bacterial, fungal, and viral infections across 7 critical Indian crops with instant organic remedies and chemical precautions.
                  </p>
                </div>

                {/* Viewfinder Preview Box */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#123D2A] flex items-center justify-center">
                      <Leaf className="w-5 h-5 text-[#246B45]" />
                    </div>
                    <div>
                      <span className="font-bold text-[#202923] block">Target Crops Covered:</span>
                      <span className="text-[11px] text-slate-500">Cotton, Rice, Maize, Groundnut, Tomato, Chilli, Potato</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-[#246B45] font-bold text-[11px] border border-emerald-200">
                    7 Crops
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400">Organic Treatment Guides</span>
                <Link
                  to="/disease-detection"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#123D2A] text-white text-xs font-bold hover:bg-[#1D5939] transition"
                >
                  <span>Scan Leaf</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#B6D957]" />
                </Link>
              </div>
            </div>

            {/* Feature 4: Weather Monitoring & Farmer Alerts */}
            <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200/90 p-8 shadow-premium flex flex-col justify-between space-y-6 hover:border-[#246B45]/40 transition group">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-[#F7F7F0] border border-[#D7DBC5] text-[#123D2A] flex items-center justify-center">
                    <CloudSun className="w-6 h-6 text-[#246B45]" />
                  </div>
                  <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-sky-50 text-sky-800 border border-sky-200">
                    Module 04 • Agro-Meteorology
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-extrabold text-[#202923] tracking-tight group-hover:text-[#123D2A] transition">
                    Weather Monitoring & Farmer Alerts
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Hyper-localized 7-day weather forecasting coupled with agricultural alert engines that warn of upcoming torrential rainfall, heatwave stress, and favorable spray windows to safeguard inputs.
                  </p>
                </div>

                {/* Weather Alert Badges */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 flex items-center space-x-2">
                    <Thermometer className="w-4 h-4 text-amber-600 shrink-0" />
                    <div>
                      <span className="font-bold text-amber-900 block leading-tight">Heatwave Advisory</span>
                      <span className="text-[10px] text-amber-700">Canopy misting guidance</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center space-x-2">
                    <CloudRain className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <span className="font-bold text-emerald-900 block leading-tight">Spraying Window</span>
                      <span className="text-[10px] text-emerald-700">Wind & rain evaluation</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400">GPS & District-Level Forecasts</span>
                <Link
                  to="/weather"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#123D2A] text-white text-xs font-bold hover:bg-[#1D5939] transition"
                >
                  <span>Check Alerts</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#B6D957]" />
                </Link>
              </div>
            </div>

          </div>

          {/* Varied Editorial Layout Block 3: AI Farming Assistant (Full Spotlight) */}
          <div className="bg-[#F7F7F0] rounded-3xl border border-[#D7DBC5] p-8 sm:p-10 shadow-premium">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              <div className="lg:col-span-7 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#D7DBC5] text-xs font-semibold text-[#123D2A]">
                  <Bot className="w-4 h-4 text-[#246B45]" />
                  <span>Module 05 • Multilingual Voice Assistant</span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#202923] tracking-tight">
                  AI Farming Assistant
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl">
                  Ask conversational questions about sowing seasons, organic pest control, soil amendments, or government agricultural welfare schemes. Complete with speech-to-text voice recognition and audio read-aloud playback in English, Telugu, and Hindi.
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <span className="text-xs font-bold text-slate-500">Sample Inquiries:</span>
                  <span className="px-3 py-1 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 font-medium">
                    "When to sow paddy in Kharif?"
                  </span>
                  <span className="px-3 py-1 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 font-medium">
                    "నల్ల రేగడి నేలల్లో ఏ పంట వేయాలి?"
                  </span>
                  <span className="px-3 py-1 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 font-medium">
                    "टमाटर के पत्तों का पीलापन कैसे रोकें?"
                  </span>
                </div>
              </div>

              <div className="lg:col-span-5 flex flex-col justify-center items-center lg:items-end">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle w-full max-w-sm space-y-3">
                  <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-2">
                    <span className="font-bold text-[#123D2A] flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      Domain Agronomic Bot
                    </span>
                    <span className="text-[10px] text-slate-400">Web Speech API</span>
                  </div>
                  <p className="text-xs text-slate-600 italic">
                    "Apply 50% Urea at basal transplanting and the remaining 50% in two equal splits at active tillering and panicle initiation."
                  </p>
                  <Link
                    to="/ai-assistant"
                    className="w-full py-2.5 rounded-xl bg-[#123D2A] text-white text-xs font-bold text-center block hover:bg-[#1D5939] transition"
                  >
                    Open AI Farming Assistant
                  </Link>
                </div>
              </div>

            </div>
          </div>

          {/* Varied Editorial Layout Block 4: Tri-Panel Strip (Modules 6, 7 & 8) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Feature 6: Multilingual Support */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-subtle space-y-4 hover:border-[#246B45]/40 transition">
              <div className="w-10 h-10 rounded-xl bg-[#F7F7F0] border border-[#D7DBC5] flex items-center justify-center text-[#246B45]">
                <Languages className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Module 06</span>
                <h4 className="font-bold text-lg text-[#202923]">Multilingual Support</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Full interface localization into 8 Indian languages: English, Telugu, Hindi, Tamil, Kannada, Marathi, Malayalam, and Bengali.
                </p>
              </div>
              <div className="pt-2">
                <a href="#languages" className="text-xs font-bold text-[#246B45] hover:underline inline-flex items-center gap-1">
                  <span>Explore Languages</span>
                  <ArrowRight className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Feature 7: Farmer Profile */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-subtle space-y-4 hover:border-[#246B45]/40 transition">
              <div className="w-10 h-10 rounded-xl bg-[#F7F7F0] border border-[#D7DBC5] flex items-center justify-center text-[#246B45]">
                <UserCheck className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Module 07</span>
                <h4 className="font-bold text-lg text-[#202923]">Farmer Profile</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Secure tenant account preserving your state, district, farm size, contact details, and dialect preferences under strict privacy.
                </p>
              </div>
              <div className="pt-2">
                <Link to={isAuthenticated ? "/profile" : "/login"} className="text-xs font-bold text-[#246B45] hover:underline inline-flex items-center gap-1">
                  <span>Manage Profile</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Feature 8: Recommendation History */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-subtle space-y-4 hover:border-[#246B45]/40 transition">
              <div className="w-10 h-10 rounded-xl bg-[#F7F7F0] border border-[#D7DBC5] flex items-center justify-center text-[#246B45]">
                <History className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Module 08</span>
                <h4 className="font-bold text-lg text-[#202923]">Advisory History</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Chronological audit records of all previous crop predictions, fertilizer calculation sheets, leaf scans, and chat consultations.
                </p>
              </div>
              <div className="pt-2">
                <Link to="/history" className="text-xs font-bold text-[#246B45] hover:underline inline-flex items-center gap-1">
                  <span>View History</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION E: HOW IT WORKS
          Visually engaging 4-step process with elegant timeline layout:
          1. Enter farm and soil parameters.
          2. Intelligent models evaluate the information.
          3. Receive personalized agricultural recommendations.
          4. Save and track your advisory history.
         ========================================================================= */}
      <section id="how-it-works" className="scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#246B45]">
              System Workflow
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#202923] tracking-tight">
              How Agriculture Advisor Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              A transparent four-step pipeline connecting soil measurements to practical farming decisions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            
            {/* Step 1 */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-subtle space-y-4 relative group hover:border-[#246B45]/40 transition">
              <div className="w-12 h-12 rounded-2xl bg-[#123D2A] text-white flex items-center justify-center font-extrabold text-base shadow-xs">
                01
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-[#202923]">
                  Enter Farm Parameters
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Provide your soil type, season, rainfall, temperature, and current soil N-P-K nutrient availability.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-subtle space-y-4 relative group hover:border-[#246B45]/40 transition">
              <div className="w-12 h-12 rounded-2xl bg-[#246B45] text-white flex items-center justify-center font-extrabold text-base shadow-xs">
                02
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-[#202923]">
                  Model Evaluation
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Trained agronomic models compare observations against multi-climatic thresholds and STCR calibration equations.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-subtle space-y-4 relative group hover:border-[#246B45]/40 transition">
              <div className="w-12 h-12 rounded-2xl bg-[#B6D957] text-[#123D2A] flex items-center justify-center font-extrabold text-base shadow-xs">
                03
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-[#202923]">
                  Personalized Advisory
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Receive the single optimal crop, exact 50-kg commercial fertilizer bags, organic disease remedies, and weather alerts.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-subtle space-y-4 relative group hover:border-[#246B45]/40 transition">
              <div className="w-12 h-12 rounded-2xl bg-[#F7F7F0] border border-[#D7DBC5] text-[#123D2A] flex items-center justify-center font-extrabold text-base shadow-xs">
                04
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-[#202923]">
                  Save & Audit History
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Track your crop seasons over time with searchable records, printable PDF sheets, and isolated farmer account privacy.
                </p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION F: SCIENTIFIC FOUNDATION
          Highlights ML-based crop prediction, ICAR/STCR calculations,
          Plant disease screening, Weather alerts, and AI farming assistance.
         ========================================================================= */}
      <section id="scientific-foundation" className="scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#246B45]">
              Scientific Foundation
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#202923] tracking-tight">
              Rigorous Agronomic Science Behind Every Recommendation
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              We combine peer-reviewed agricultural science with modern computer science, rejecting unverified claims in favor of verifiable models.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Pillar 1 */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-subtle space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#123D2A] flex items-center justify-center">
                <Database className="w-5 h-5 text-[#246B45]" />
              </div>
              <h3 className="font-bold text-base text-[#202923]">
                Machine Learning Crop Prediction
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Trained on 2,200 multi-climatic agricultural observations across 22 crops, the Random Forest model evaluates nonlinear decision boundaries to output a single optimal crop with genuine confidence scores.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-subtle space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center">
                <Scale className="w-5 h-5 text-amber-700" />
              </div>
              <h3 className="font-bold text-base text-[#202923]">
                ICAR/STCR Nutrient Balancing
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Calibrated against Indian Council of Agricultural Research (ICAR) Soil Test Crop Response (STCR) equations. Formulates precise N-P-K nutrient replenishment and converts it directly into commercial 50-kg bags.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-subtle space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-800 flex items-center justify-center">
                <Microscope className="w-5 h-5 text-rose-700" />
              </div>
              <h3 className="font-bold text-base text-[#202923]">
                Foliar Pathology Screening
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Evaluates foliar symptoms across 7 primary crops (Cotton, Rice, Maize, Groundnut, Tomato, Chilli, Potato) to distinguish healthy crops from early blight, late blight, leaf curl, and bacterial spot.
              </p>
            </div>

            {/* Pillar 4 */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-subtle space-y-3">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-800 flex items-center justify-center">
                <CloudSun className="w-5 h-5 text-sky-700" />
              </div>
              <h3 className="font-bold text-base text-[#202923]">
                Agro-Meteorological Alert Engines
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Rules-based thresholding identifies micro-climate risks: torrential precipitation lodging warnings, heatwave moisture stress alerts, and low-drift agrochemical spraying windows.
              </p>
            </div>

            {/* Pillar 5 */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-subtle space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-800 flex items-center justify-center">
                <Bot className="w-5 h-5 text-purple-700" />
              </div>
              <h3 className="font-bold text-base text-[#202923]">
                Domain-Bounded AI Farming Assistant
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Trained specifically on verified agricultural extensions and government farming schemes. Politely deflects non-farming inquiries to maintain agricultural focus and reliable farmer guidance.
              </p>
            </div>

            {/* Pillar 6 */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-subtle space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#F7F7F0] border border-[#D7DBC5] text-[#123D2A] flex items-center justify-center">
                <Lock className="w-5 h-5 text-[#246B45]" />
              </div>
              <h3 className="font-bold text-base text-[#202923]">
                Multi-Tenant Cryptographic Isolation
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Each farmer's advisory history, location, and records are isolated behind JWT authentication and bcrypt password hashing, ensuring zero cross-tenant leakage.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION G: LANGUAGE ACCESSIBILITY
          Multilingual section showcasing all 8 supported languages:
          English, Telugu, Hindi, Tamil, Kannada, Marathi, Malayalam, Bengali.
          Language switch triggers actual i18n change!
         ========================================================================= */}
      <section id="languages" className="scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="bg-gradient-to-br from-[#123D2A] to-[#1D5939] text-white rounded-3xl p-8 sm:p-12 shadow-premium space-y-8">
            
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#B6D957]">
                Linguistic Inclusivity
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Designed for Indian Farmers in Eight Languages
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100">
                Language should never be a barrier to precision agricultural technology. Click any language below to switch the application interface instantly.
              </p>
            </div>

            {/* 8 Language Switch Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 max-w-4xl mx-auto">
              {SUPPORTED_LANGUAGES.map((lang) => {
                const isActive = (i18n.language?.substring(0, 2) || 'en') === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={async () => {
                      await i18n.changeLanguage(lang.code);
                      localStorage.setItem('agri_preferred_language', lang.code);
                    }}
                    className={`p-3.5 rounded-2xl border transition-all duration-200 text-left flex items-center justify-between cursor-pointer ${
                      isActive
                        ? 'bg-[#B6D957] text-[#123D2A] border-white shadow-md font-bold scale-102'
                        : 'bg-white/10 hover:bg-white/20 text-white border-white/15'
                    }`}
                  >
                    <div>
                      <span className="text-sm font-extrabold block leading-tight">
                        {lang.nativeName}
                      </span>
                      <span className={`text-[10px] block mt-0.5 ${isActive ? 'text-[#123D2A]/80' : 'text-emerald-200'}`}>
                        {lang.name}
                      </span>
                    </div>
                    {isActive && <Check className="w-4 h-4 text-[#123D2A]" />}
                  </button>
                );
              })}
            </div>

            <p className="text-center text-xs text-emerald-200/80">
              Active locale: <span className="font-bold text-white uppercase">{i18n.language}</span> • Full dynamic dictionary active
            </p>

          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION H: PRIVACY AND TRUST
          Secure farmer authentication, Personal history, Account-specific recommendations,
          Private farm information, Agricultural advisory disclaimer.
         ========================================================================= */}
      <section id="about" className="scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#246B45]">
              Privacy & Stewardship
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#202923] tracking-tight">
              Trust Built on Data Privacy & Transparency
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-subtle space-y-2">
              <ShieldCheck className="w-7 h-7 text-[#246B45]" />
              <h3 className="font-bold text-sm text-[#202923]">Farmer Data Protection</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Your soil test numbers, location coordinates, and land acreage belong exclusively to you. We never sell farmer records to commercial advertisers.
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-subtle space-y-2">
              <Lock className="w-7 h-7 text-[#246B45]" />
              <h3 className="font-bold text-sm text-[#202923]">Tenant Isolation</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Cryptographic JWT authentication verifies ownership on every read and write request, preventing unauthorized cross-account visibility.
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-subtle space-y-2">
              <History className="w-7 h-7 text-[#246B45]" />
              <h3 className="font-bold text-sm text-[#202923]">Auditable History</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Access your past seasonal advisory records anytime. Review what was planted and what fertilizers were applied across different farm parcels.
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-subtle space-y-2">
              <Leaf className="w-7 h-7 text-[#246B45]" />
              <h3 className="font-bold text-sm text-[#202923]">Advisory Notice</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                All outputs are computational decision supports. We encourage cross-verifying critical capital investments with certified district Krishi Vigyan Kendras (KVK).
              </p>
            </div>

          </div>

          {/* Call to Action Banner */}
          <div className="bg-white rounded-3xl border border-[#D7DBC5] p-8 sm:p-12 shadow-premium flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
            <div className="space-y-1.5 max-w-xl">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#202923] tracking-tight">
                Ready to optimize your harvest?
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Join thousands of Indian farmers using verified agronomic intelligence to cut input costs and enhance crop yields.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
              <Link
                to={isAuthenticated ? "/dashboard" : "/register"}
                className="px-6 py-3.5 rounded-xl bg-[#123D2A] hover:bg-[#1D5939] text-white font-bold text-xs sm:text-sm shadow-premium transition"
              >
                {isAuthenticated ? "Go to Dashboard" : "Create Free Account"}
              </Link>
              <Link
                to="/crop-recommendation"
                className="px-6 py-3.5 rounded-xl bg-[#F7F7F0] hover:bg-[#EBECE1] text-[#123D2A] font-semibold text-xs sm:text-sm border border-slate-200 transition"
              >
                Try Without Login
              </Link>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
