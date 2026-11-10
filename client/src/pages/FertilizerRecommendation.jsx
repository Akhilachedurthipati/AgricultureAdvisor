import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { 
  FlaskConical, 
  Sparkles, 
  ShieldAlert, 
  Layers, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Scale, 
  SlidersHorizontal, 
  BookmarkCheck, 
  Package, 
  Clock, 
  Info,
  Check,
  ChevronDown,
  ChevronUp,
  Sprout,
  ArrowRight,
  ExternalLink,
  History,
  RotateCcw
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import AlertBanner from '../components/common/AlertBanner';
import { getRecommendedFertilizer, fetchFertilizerHistory } from '../services/fertilizerService';

const SOIL_TYPES = [
  'Alluvial Soil',
  'Black Cotton Soil',
  'Red Soil',
  'Clay Soil',
  'Sandy Loam Soil',
  'Laterite Soil'
];

const SEASONS = [
  'Kharif (Monsoon: Jun - Oct)',
  'Rabi (Winter: Oct - Mar)',
  'Zaid (Summer: Mar - Jun)'
];

const CROPS = [
  'Rice (Paddy)',
  'Cotton',
  'Maize (Corn)',
  'Wheat',
  'Sugarcane',
  'Groundnut',
  'Pulses (Red Gram/Bengal Gram)',
  'Vegetables / Tomato'
];

const PRESETS = [
  {
    name: 'Rice (Clay, 3 Acres) – General RDF (No Soil Test)',
    crop: 'Rice (Paddy)',
    soilType: 'Clay Soil',
    season: 'Kharif (Monsoon: Jun - Oct)',
    landArea: 3,
    sowingDate: '',
    ph: '',
    nitrogen: '',
    phosphorus: '',
    potassium: ''
  },
  {
    name: 'Cotton (Black Soil, 2.5 Acres) – Precision STCR + Sowing Date',
    crop: 'Cotton',
    soilType: 'Black Cotton Soil',
    season: 'Kharif (Monsoon: Jun - Oct)',
    landArea: 2.5,
    sowingDate: '2026-06-15',
    ph: 7.4,
    nitrogen: 40,
    phosphorus: 12,
    potassium: 35
  },
  {
    name: 'Groundnut (Red Soil, 3 Acres) – Acidic Soil & SSP Advisory',
    crop: 'Groundnut',
    soilType: 'Red Soil',
    season: 'Kharif (Monsoon: Jun - Oct)',
    landArea: 3,
    sowingDate: '2026-06-20',
    ph: 5.4,
    nitrogen: 20,
    phosphorus: 15,
    potassium: 25
  },
  {
    name: 'Wheat (Alluvial, 5 Acres) – Winter Precision Plan',
    crop: 'Wheat',
    soilType: 'Alluvial Soil',
    season: 'Rabi (Winter: Oct - Mar)',
    landArea: 5,
    sowingDate: '2026-11-15',
    ph: 7.2,
    nitrogen: 45,
    phosphorus: 20,
    potassium: 20
  }
];

export default function FertilizerRecommendation() {
  const { t } = useTranslation();

  // Primary Required Form Inputs
  const [formData, setFormData] = useState({
    crop: 'Cotton',
    soilType: 'Black Cotton Soil',
    season: 'Kharif (Monsoon: Jun - Oct)',
    landArea: 2.5,
    sowingDate: '',
    ph: '',
    nitrogen: '',
    phosphorus: '',
    potassium: ''
  });

  // Collapsible Soil Health Card State
  const [showOptionalSoil, setShowOptionalSoil] = useState(false);

  // Results & Feedback State
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // History State
  const [recentHistory, setRecentHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Load recent recommendation history on mount
  useEffect(() => {
    loadRecentHistory();
  }, []);

  const loadRecentHistory = async () => {
    try {
      setLoadingHistory(true);
      const res = await fetchFertilizerHistory();
      if (res.success && Array.isArray(res.data)) {
        setRecentHistory(res.data.slice(0, 4));
      }
    } catch {
      // Graceful fallback for unauthenticated / history failure
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleApplyPreset = (preset) => {
    setFormData({
      crop: preset.crop,
      soilType: preset.soilType,
      season: preset.season,
      landArea: preset.landArea,
      sowingDate: preset.sowingDate || '',
      ph: preset.ph !== '' ? preset.ph : '',
      nitrogen: preset.nitrogen !== '' ? preset.nitrogen : '',
      phosphorus: preset.phosphorus !== '' ? preset.phosphorus : '',
      potassium: preset.potassium !== '' ? preset.potassium : ''
    });
    if (preset.nitrogen !== '' || preset.ph !== '') {
      setShowOptionalSoil(true);
    }
    setResult(null);
    setErrorMessage('');
  };

  const setSowingDateQuick = (daysFromToday) => {
    const date = new Date();
    date.setDate(date.getDate() + daysFromToday);
    const isoStr = date.toISOString().split('T')[0];
    setFormData((prev) => ({ ...prev, sowingDate: isoStr }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      // Build clean payload: omit empty optional fields so backend activates General RDF
      const payload = {
        crop: formData.crop,
        soilType: formData.soilType,
        season: formData.season,
        landArea: Number(formData.landArea)
      };

      if (formData.sowingDate && formData.sowingDate.trim()) {
        payload.sowingDate = formData.sowingDate.trim();
      }

      if (formData.ph !== '' && !isNaN(Number(formData.ph))) {
        payload.ph = Number(formData.ph);
      }

      if (formData.nitrogen !== '' && !isNaN(Number(formData.nitrogen))) {
        payload.nitrogen = Number(formData.nitrogen);
      }

      if (formData.phosphorus !== '' && !isNaN(Number(formData.phosphorus))) {
        payload.phosphorus = Number(formData.phosphorus);
      }

      if (formData.potassium !== '' && !isNaN(Number(formData.potassium))) {
        payload.potassium = Number(formData.potassium);
      }

      const response = await getRecommendedFertilizer(payload);

      if (response.success && response.data) {
        setResult(response.data);
        // Refresh recent history
        loadRecentHistory();
      } else {
        throw new Error(response.message || 'Agronomic calculation failed');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to calculate fertilizer recommendations.');
    } finally {
      setLoading(false);
    }
  };

  const getStageBadgeConfig = (stage, index) => {
    const stageId = stage.stageId?.toLowerCase() || '';
    if (stageId.includes('basal') || index === 0) {
      return {
        variant: 'success',
        icon: Sprout,
        label: 'Basal Stage (At Sowing / Transplanting)'
      };
    }
    if (stageId.includes('tillering') || stageId.includes('vegetative') || stageId.includes('crown') || stageId.includes('knee')) {
      return {
        variant: 'info',
        icon: Layers,
        label: 'Vegetative Growth Topdressing'
      };
    }
    if (stageId.includes('pegging') || stageId.includes('advisory')) {
      return {
        variant: 'warning',
        icon: Info,
        label: 'Secondary / Foliar Advisory'
      };
    }
    return {
      variant: 'forest',
      icon: Sparkles,
      label: 'Reproductive & Grain Filling'
    };
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#246B45]">
              Crop Life-Cycle Planning
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#123D2A] tracking-tight mt-0.5">
            {t('fertilizer.title', 'Fertilizer & Growth-Stage Planner')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-700 font-medium mt-0.5">
            {t('fertilizer.subtitle', 'ICAR/SAU recommended doses, calendar-projected growth stage splits, 50-kg commercial bag counts, and soil test STCR adjustments.')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="forest">
            ICAR Life-Cycle Engine
          </Badge>
          <Link
            to="/history?module=fertilizer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#F7F7F0] border border-[#D7DBC5] text-[#123D2A] hover:bg-[#123D2A]/10 transition"
          >
            <History className="w-3.5 h-3.5 text-[#246B45]" />
            <span>Advisory History</span>
          </Link>
        </div>
      </div>

      {/* Advisory Notice */}
      <AlertBanner
        variant="disclaimer"
        title="ICAR Agronomic Baseline & Soil Health Notice"
        message="Doses reflect standard Recommended Dose of Fertilizer (RDF) calibrated with provisional Soil Test Crop Response (STCR) principles. Sowing date calculations provide estimated operational windows based on average thermal units."
      />

      {/* Quick Test Presets */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2 text-[#123D2A] font-bold shrink-0">
          <SlidersHorizontal className="w-4 h-4 text-[#246B45]" />
          <span>Quick Scenarios:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyPreset(p)}
              className="px-3 py-1.5 rounded-xl bg-[#F7F7F0] hover:bg-[#123D2A]/10 hover:text-[#123D2A] border border-slate-300 text-slate-800 font-semibold transition cursor-pointer text-xs"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {errorMessage && (
        <AlertBanner
          variant="danger"
          title="Calculation Notice"
          message={errorMessage}
          dismissible={true}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Form Column */}
        <div className="lg:col-span-5 space-y-4">
          <Card
            title="Crop & Field Parameters"
            subtitle="Select your crop, sowing date, land area, and optional soil test values"
            icon={FlaskConical}
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Target Crop & Soil Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Target Crop *
                  </label>
                  <select
                    name="crop"
                    value={formData.crop}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-[#123D2A] focus:ring-1 focus:ring-[#123D2A] text-xs sm:text-sm bg-white text-slate-900 font-semibold outline-none transition"
                  >
                    {CROPS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Soil Type *
                  </label>
                  <select
                    name="soilType"
                    value={formData.soilType}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-[#123D2A] focus:ring-1 focus:ring-[#123D2A] text-xs sm:text-sm bg-white text-slate-900 font-semibold outline-none transition"
                  >
                    {SOIL_TYPES.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Cropping Season & Land Area */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Cropping Season *
                  </label>
                  <select
                    name="season"
                    value={formData.season}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-[#123D2A] focus:ring-1 focus:ring-[#123D2A] text-xs sm:text-sm bg-white text-slate-900 font-semibold outline-none transition"
                  >
                    {SEASONS.map((sn) => (
                      <option key={sn} value={sn}>{sn}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">
                    <span>Land Area (Acres) *</span>
                    <span className="text-xs font-extrabold text-[#123D2A]">{formData.landArea} Acre(s)</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="1000"
                    name="landArea"
                    value={formData.landArea}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-[#123D2A] focus:ring-1 focus:ring-[#123D2A] text-xs sm:text-sm text-slate-900 font-semibold outline-none transition"
                  />
                </div>
              </div>

              {/* Sowing Date with Calendar Helpers */}
              <div className="p-3.5 rounded-2xl bg-[#F7F7F0] border border-[#D7DBC5]/80 space-y-2">
                <label className="block text-xs font-bold text-[#123D2A] flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#246B45]" />
                    <span>Sowing Date (Optional)</span>
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">For calendar dates</span>
                </label>

                <input
                  type="date"
                  name="sowingDate"
                  value={formData.sowingDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-[#123D2A] text-xs text-slate-900 font-semibold bg-white outline-none transition"
                />

                <div className="flex items-center gap-2 pt-0.5 text-[11px]">
                  <span className="text-slate-500 font-medium">Quick set:</span>
                  <button
                    type="button"
                    onClick={() => setSowingDateQuick(0)}
                    className="px-2 py-0.5 rounded-lg bg-white border border-slate-300 text-slate-700 hover:text-[#123D2A] font-semibold"
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={() => setSowingDateQuick(7)}
                    className="px-2 py-0.5 rounded-lg bg-white border border-slate-300 text-slate-700 hover:text-[#123D2A] font-semibold"
                  >
                    +7 Days
                  </button>
                  {formData.sowingDate && (
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, sowingDate: '' }))}
                      className="px-2 py-0.5 rounded-lg text-rose-700 hover:underline font-semibold ml-auto"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Collapsible Optional Soil Test Section */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden transition">
                <button
                  type="button"
                  onClick={() => setShowOptionalSoil(p => !p)}
                  className="w-full p-3.5 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-left transition cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Scale className="w-4 h-4 text-[#246B45]" />
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        Soil Health Card Test Values (Optional)
                      </span>
                      <span className="text-[11px] text-slate-600 block">
                        {showOptionalSoil ? 'Omit any value to run standard General RDF' : 'Click to enter measured N-P-K & pH'}
                      </span>
                    </div>
                  </div>
                  {showOptionalSoil ? (
                    <ChevronUp className="w-4 h-4 text-slate-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  )}
                </button>

                {showOptionalSoil && (
                  <div className="p-3.5 bg-white border-t border-slate-200 space-y-3">
                    <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
                      💡 <strong>Notice:</strong> If you don't have a Soil Health Card report, leave these blank. The system will cleanly calculate the verified <strong>ICAR General Recommended Dose of Fertilizer (RDF)</strong>.
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <span className="text-[11px] font-bold text-blue-900 block mb-1">Nitrogen (N)</span>
                        <input
                          type="number"
                          min="0"
                          max="1000"
                          name="nitrogen"
                          placeholder="kg/acre"
                          value={formData.nitrogen}
                          onChange={handleChange}
                          className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 focus:border-[#123D2A] text-xs text-slate-900 font-semibold outline-none"
                        />
                      </div>

                      <div>
                        <span className="text-[11px] font-bold text-amber-900 block mb-1">Phosphorus (P)</span>
                        <input
                          type="number"
                          min="0"
                          max="500"
                          name="phosphorus"
                          placeholder="kg/acre"
                          value={formData.phosphorus}
                          onChange={handleChange}
                          className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 focus:border-[#123D2A] text-xs text-slate-900 font-semibold outline-none"
                        />
                      </div>

                      <div>
                        <span className="text-[11px] font-bold text-emerald-900 block mb-1">Potassium (K)</span>
                        <input
                          type="number"
                          min="0"
                          max="1000"
                          name="potassium"
                          placeholder="kg/acre"
                          value={formData.potassium}
                          onChange={handleChange}
                          className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 focus:border-[#123D2A] text-xs text-slate-900 font-semibold outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-800 mb-1 flex items-center justify-between">
                        <span>Soil pH (Acidity / Alkalinity)</span>
                        <span className="text-[10px] text-slate-500 font-medium">Range: 3.5 - 10.0</span>
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="3.0"
                        max="11.0"
                        name="ph"
                        placeholder="e.g. 6.8 (Neutral) or 5.2 (Acidic)"
                        value={formData.ph}
                        onChange={handleChange}
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-300 focus:border-[#123D2A] text-xs text-slate-900 font-semibold outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  loading={loading}
                  icon={Sparkles}
                  className="w-full !bg-[#123D2A] hover:!bg-[#1D5939] text-white shadow-premium py-2.5 text-sm"
                >
                  {loading ? 'Calculating Life-Cycle Schedules...' : 'Generate Crop Life-Cycle Plan'}
                </Button>
              </div>

            </form>
          </Card>

          {/* Recent History Quick Box */}
          {recentHistory.length > 0 && (
            <Card
              title="Recent Fertilizer Plans"
              subtitle="Quick reference from your saved farm history"
              icon={History}
              action={
                <Link
                  to="/history?module=fertilizer"
                  className="text-xs font-bold text-[#246B45] hover:underline flex items-center gap-1"
                >
                  <span>View All</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              }
              bodyClassName="p-3"
            >
              <div className="space-y-2">
                {recentHistory.map((item, idx) => {
                  const targetCrop = item.inputs?.crop || 'Crop';
                  const acres = item.inputs?.landArea || 1;
                  const dateStr = item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '';
                  const isSTCR = item.recommendation?.recommendationMode?.includes('Precision STCR');

                  return (
                    <div
                      key={item._id || item.id || idx}
                      className="p-2.5 rounded-xl bg-slate-50 hover:bg-[#F7F7F0] border border-slate-200 flex items-center justify-between text-xs transition"
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-slate-900">{targetCrop}</span>
                          <span className="text-[11px] text-slate-600 font-medium">({acres} Acres)</span>
                        </div>
                        <span className="text-[10px] text-slate-500 block truncate max-w-[220px]">
                          {item.recommendation?.fertilizerCombination || 'Nutrient Plan'}
                        </span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold block ${
                          isSTCR ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {isSTCR ? 'STCR' : 'RDF'}
                        </span>
                        <span className="text-[10px] text-slate-400 mt-0.5 block">{dateStr}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </div>

        {/* Results Column */}
        <div className="lg:col-span-7 space-y-4">
          {result ? (
            <div className="space-y-4 animate-in fade-in">
              
              {/* Recommendation Mode Banner */}
              <div className={`p-4 rounded-2xl border shadow-subtle flex items-start gap-3.5 ${
                result.recommendationMode?.includes('Precision STCR')
                  ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
                  : 'bg-blue-50/90 border-blue-300 text-blue-950'
              }`}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  result.recommendationMode?.includes('Precision STCR')
                    ? 'bg-emerald-600 text-white'
                    : 'bg-blue-600 text-white'
                }`}>
                  {result.recommendationMode?.includes('Precision STCR') ? (
                    <Sparkles className="w-5 h-5" />
                  ) : (
                    <Sprout className="w-5 h-5" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">
                      Recommendation Mode
                    </span>
                    <Badge variant={result.recommendationMode?.includes('Precision STCR') ? 'success' : 'info'} size="sm">
                      {result.recommendationMode?.includes('Precision STCR') ? 'STCR Precision' : 'General RDF'}
                    </Badge>
                  </div>
                  <h3 className="text-base font-extrabold mt-0.5">
                    {result.recommendationMode}
                  </h3>
                  <p className="text-xs opacity-90 mt-0.5 leading-relaxed">
                    {result.recommendationMode?.includes('Precision STCR')
                      ? 'Calibrated with your measured Soil Health Card values using provisional STCR category factors.'
                      : 'Soil test values omitted. Dosages reflect standard ICAR/SAU recommended dose of fertilizer for this crop.'}
                  </p>
                </div>
              </div>

              {/* Formulation Header & Total Commercial Bags */}
              <Card
                title={result.fertilizerCombination}
                subtitle={`Total Farm Requirements for ${result.landArea} Acre(s) of ${result.crop} in ${result.soilType}`}
                headerClassName="pb-3"
              >
                <div className="space-y-4">
                  
                  {/* Purchase Requirements Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3.5 bg-[#F7F7F0] rounded-xl border border-slate-300 shadow-xs text-center">
                      <span className="text-[10px] uppercase text-slate-600 font-bold block">Urea (46% N)</span>
                      <span className="text-lg font-black text-[#123D2A] block mt-0.5">
                        {result.dosageBreakdown.totalLandArea.ureaTotalKg} kg
                      </span>
                      <span className="text-xs font-bold text-[#246B45]">
                        {result.dosageBreakdown.totalLandArea.ureaTotalBags}
                      </span>
                    </div>

                    <div className="p-3.5 bg-[#F7F7F0] rounded-xl border border-slate-300 shadow-xs text-center">
                      <span className="text-[10px] uppercase text-slate-600 font-bold block">
                        {result.dosageBreakdown.totalLandArea.pCarrierName} ({result.dosageBreakdown.totalLandArea.pCarrierName === 'SSP' ? '16% P₂O₅' : '18-46-0'})
                      </span>
                      <span className="text-lg font-black text-[#123D2A] block mt-0.5">
                        {result.dosageBreakdown.totalLandArea.pTotalKg} kg
                      </span>
                      <span className="text-xs font-bold text-[#246B45]">
                        {result.dosageBreakdown.totalLandArea.pTotalBags}
                      </span>
                    </div>

                    <div className="p-3.5 bg-[#F7F7F0] rounded-xl border border-slate-300 shadow-xs text-center">
                      <span className="text-[10px] uppercase text-slate-600 font-bold block">MOP (60% K₂O)</span>
                      <span className="text-lg font-black text-[#123D2A] block mt-0.5">
                        {result.dosageBreakdown.totalLandArea.mopTotalKg} kg
                      </span>
                      <span className="text-xs font-bold text-[#246B45]">
                        {result.dosageBreakdown.totalLandArea.mopTotalBags}
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                    <span className="text-slate-700 font-semibold">Organic Soil Conditioning:</span>
                    <span className="font-extrabold text-[#123D2A]">
                      {result.dosageBreakdown.totalLandArea.organicTotalTonnes}
                    </span>
                  </div>

                </div>
              </Card>

              {/* Crop Life-Cycle Growth Schedule Timeline */}
              <Card
                title="Crop Life-Cycle Growth Stages & Split Timetable"
                subtitle={`Structured schedule from sowing to harvest for ${result.landArea} Acre(s)`}
                icon={Clock}
              >
                <div className="space-y-4">
                  {result.lifecycleSchedule && result.lifecycleSchedule.map((stage, idx) => {
                    const badgeConfig = getStageBadgeConfig(stage, idx);
                    const DisplayIcon = badgeConfig.icon;
                    const hasDates = Boolean(stage.calendarWindow?.startDate);

                    return (
                      <div
                        key={stage.stageId || idx}
                        className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-subtle space-y-3 relative overflow-hidden"
                      >
                        {/* Top Stage Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-[#F7F7F0] border border-[#D7DBC5] text-[#123D2A] flex items-center justify-center text-xs font-black">
                              {idx + 1}
                            </span>
                            <div>
                              <h4 className="text-sm font-extrabold text-[#123D2A]">
                                {stage.stageName}
                              </h4>
                              <span className="text-[11px] font-bold text-[#246B45]">
                                {stage.timingLabel}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {hasDates && (
                              <Badge variant="fresh" size="sm" icon={Calendar}>
                                {stage.calendarWindow.formattedWindow}
                              </Badge>
                            )}
                            <Badge variant={badgeConfig.variant} size="sm">
                              {badgeConfig.label}
                            </Badge>
                          </div>
                        </div>

                        {/* Biological Purpose */}
                        <div className="text-xs text-slate-700 leading-relaxed bg-[#F7FAF7] p-2.5 rounded-xl border border-slate-200">
                          <strong className="text-[#123D2A] block mb-0.5">Biological Purpose:</strong>
                          {stage.purpose}
                        </div>

                        {/* Stage Fertilizer Quantities (50kg Bags and kg) */}
                        <div className="space-y-1.5">
                          <span className="text-[11px] uppercase font-bold text-slate-500 block">
                            Calculated Stage Dosages ({result.landArea} Acres):
                          </span>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {stage.fertilizers && stage.fertilizers.map((fert, fIdx) => (
                              <div
                                key={fIdx}
                                className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between text-xs"
                              >
                                <div>
                                  <span className="font-extrabold text-slate-900 block leading-tight">
                                    {fert.fertilizerName}
                                  </span>
                                  <span className="text-[11px] font-bold text-[#246B45]">
                                    {fert.bags50kg} bags ({fert.quantityKg} kg)
                                  </span>
                                </div>
                                {fert.splitPercentage > 0 && (
                                  <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-bold text-[10px]">
                                    {fert.splitPercentage}% Split
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Application Method */}
                        {stage.applicationMethod && (
                          <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-xl flex items-start gap-1.5">
                            <span className="font-bold text-slate-800 shrink-0">Method:</span>
                            <span>{stage.applicationMethod}</span>
                          </div>
                        )}

                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Soil Nutrient Deficit & pH Advisory */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Soil Nutrient Deficit Analysis */}
                <Card
                  title="Nutrient Deficit Analysis"
                  subtitle="Status against target crop removal"
                  icon={BookmarkCheck}
                  bodyClassName="p-4 space-y-2 text-xs"
                >
                  <div className="space-y-2">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900 block">Nitrogen (N)</span>
                        <span className="text-[10px] text-slate-500">
                          Measured: {result.nutrientDeficitAnalysis.nitrogen.measured}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          result.nutrientDeficitAnalysis.nitrogen.status === 'Low' 
                            ? 'bg-rose-100 text-rose-800' 
                            : result.nutrientDeficitAnalysis.nitrogen.status === 'High'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {result.nutrientDeficitAnalysis.nitrogen.status}
                        </span>
                        <span className="text-[10px] font-bold text-slate-700 block mt-0.5">
                          {result.nutrientDeficitAnalysis.nitrogen.targetRate}
                        </span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900 block">Phosphorus (P)</span>
                        <span className="text-[10px] text-slate-500">
                          Measured: {result.nutrientDeficitAnalysis.phosphorus.measured}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          result.nutrientDeficitAnalysis.phosphorus.status === 'Low' 
                            ? 'bg-rose-100 text-rose-800' 
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {result.nutrientDeficitAnalysis.phosphorus.status}
                        </span>
                        <span className="text-[10px] font-bold text-slate-700 block mt-0.5">
                          {result.nutrientDeficitAnalysis.phosphorus.targetRate}
                        </span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900 block">Potassium (K)</span>
                        <span className="text-[10px] text-slate-500">
                          Measured: {result.nutrientDeficitAnalysis.potassium.measured}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          result.nutrientDeficitAnalysis.potassium.status === 'High' 
                            ? 'bg-amber-100 text-amber-800' 
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {result.nutrientDeficitAnalysis.potassium.status}
                        </span>
                        <span className="text-[10px] font-bold text-slate-700 block mt-0.5">
                          {result.nutrientDeficitAnalysis.potassium.targetRate}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Soil pH Advisory Card */}
                <Card
                  title="Soil pH & Amendment Advisory"
                  subtitle={result.soilPhAdvisory?.phValue ? `Soil pH: ${result.soilPhAdvisory.phValue}` : 'pH Not Provided'}
                  icon={Scale}
                  bodyClassName="p-4 space-y-2 text-xs"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">Soil Condition:</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        result.soilPhAdvisory?.status === 'Acidic'
                          ? 'bg-rose-100 text-rose-800'
                          : result.soilPhAdvisory?.status?.includes('Alkaline')
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {result.soilPhAdvisory?.status || 'Not Evaluated'}
                      </span>
                    </div>

                    <p className="text-slate-700 text-[11px] leading-relaxed bg-[#F7F7F0] p-2.5 rounded-xl border border-slate-200">
                      {result.soilPhAdvisory?.advisory}
                    </p>

                    {result.soilPhAdvisory?.missingTests?.length > 0 && (
                      <div className="space-y-1 pt-1">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">
                          Required Tests Before Chemical Amendment:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {result.soilPhAdvisory.missingTests.map((tst, tIdx) => (
                            <span key={tIdx} className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-medium">
                              {tst}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>

              </div>

              {/* Chemical Safety & Agronomic Guidance */}
              <Card
                title="Chemical Safety & Protective Protocol"
                subtitle="Guidelines to prevent nutrient runoff and chemical scorch"
                icon={ShieldAlert}
                headerClassName="text-rose-900"
              >
                <div className="space-y-3">
                  <ul className="list-disc list-inside space-y-1.5 bg-rose-50/70 p-3.5 rounded-xl border border-rose-200 text-rose-950 text-xs leading-relaxed">
                    {result.safetyPrecautions && result.safetyPrecautions.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>

                  {/* Institutional Citation & Disclaimer */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 leading-relaxed space-y-1">
                    <div>
                      <strong className="text-slate-800">Institutional Reference:</strong>{' '}
                      {result.institutionReference}
                    </div>
                    <div className="text-slate-500 italic">
                      {result.advisoryDisclaimer}
                    </div>
                  </div>
                </div>
              </Card>

            </div>
          ) : (
            <Card className="text-center py-16 px-6 flex flex-col items-center justify-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-[#F7F7F0] text-[#123D2A] flex items-center justify-center border border-[#D7DBC5]">
                <FlaskConical className="w-8 h-8 text-[#246B45]" />
              </div>
              <h3 className="font-extrabold text-[#123D2A] text-lg">Awaiting Field Information</h3>
              <p className="text-xs text-slate-700 font-medium max-w-sm leading-relaxed">
                Select your crop and land area to generate a complete life-cycle fertilizer plan. Soil test values and sowing date are optional.
              </p>
            </Card>
          )}
        </div>

      </div>

    </div>
  );
}
