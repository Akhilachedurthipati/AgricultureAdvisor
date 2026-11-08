import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Sprout, 
  Sparkles, 
  Layers, 
  Thermometer, 
  Droplets, 
  Gauge, 
  CloudRain, 
  Calendar,
  AlertCircle,
  CheckCircle2,
  Info,
  SlidersHorizontal,
  BookmarkCheck,
  Check
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import AlertBanner from '../components/common/AlertBanner';
import { getRecommendedCrop } from '../services/cropService';

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

const PRESETS = [
  {
    name: 'Wet Monsoon (Rice)',
    soilType: 'Clay Soil',
    season: 'Kharif (Monsoon: Jun - Oct)',
    temperature: 24.5,
    humidity: 82,
    ph: 6.5,
    rainfall: 220
  },
  {
    name: 'Black Soil Cash Crop (Cotton)',
    soilType: 'Black Cotton Soil',
    season: 'Kharif (Monsoon: Jun - Oct)',
    temperature: 26.0,
    humidity: 75,
    ph: 7.2,
    rainfall: 85
  },
  {
    name: 'Winter Grain (Wheat)',
    soilType: 'Alluvial Soil',
    season: 'Rabi (Winter: Oct - Mar)',
    temperature: 19.5,
    humidity: 58,
    ph: 7.0,
    rainfall: 65
  },
  {
    name: 'Summer Arid Pulse (Mothbeans)',
    soilType: 'Sandy Loam Soil',
    season: 'Zaid (Summer: Mar - Jun)',
    temperature: 32.0,
    humidity: 55,
    ph: 6.8,
    rainfall: 45
  }
];

export default function CropRecommendation() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    soilType: 'Clay Soil',
    season: 'Kharif (Monsoon: Jun - Oct)',
    temperature: 24.5,
    humidity: 82,
    ph: 6.5,
    rainfall: 220
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleApplyPreset = (preset) => {
    setFormData({
      soilType: preset.soilType,
      season: preset.season,
      temperature: preset.temperature,
      humidity: preset.humidity,
      ph: preset.ph,
      rainfall: preset.rainfall
    });
    setResult(null);
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const response = await getRecommendedCrop({
        soilType: formData.soilType,
        season: formData.season,
        temperature: Number(formData.temperature),
        humidity: Number(formData.humidity),
        ph: Number(formData.ph),
        rainfall: Number(formData.rainfall)
      });

      if (response.success && response.data) {
        setResult(response.data);
      } else {
        throw new Error(response.message || 'Prediction failed');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to generate crop recommendation from the ML model.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-8">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#176B45]">
              Intelligent Advisory
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1F2937] tracking-tight mt-0.5">
            {t('crop.title', 'Crop Recommendation')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {t('crop.subtitle', 'Predict the single most optimal crop tailored for your soil profile, cropping season, and local climate.')}
          </p>
        </div>

        <Badge variant="agri">
          Single Optimal Crop Engine
        </Badge>
      </div>

      {/* Advisory Banner */}
      <AlertBanner
        variant="disclaimer"
        title="Agronomic Advisory Notice"
        message="Recommendations are machine learning predictions based on verified agricultural observations and regional climatic envelopes. Always verify critical decisions with your local agricultural extension officer."
      />

      {/* Quick Test Climate Scenarios */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2 text-[#1F2937] font-semibold">
          <SlidersHorizontal className="w-4 h-4 text-[#176B45]" />
          <span>Quick Evaluation Scenarios:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyPreset(p)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-[#E8F5EE] hover:text-[#176B45] border border-slate-200 text-slate-700 font-medium transition cursor-pointer text-xs"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {errorMessage && (
        <AlertBanner
          variant="danger"
          title="Prediction Notice"
          message={errorMessage}
          dismissible={true}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Form Column */}
        <div className="lg:col-span-7">
          <Card
            title="Field & Environmental Parameters"
            subtitle="Provide your land's soil profile and expected climate observations"
            icon={Sprout}
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Soil Type & Season */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#176B45]" />
                    <span>{t('crop.soilType', 'Soil Type')} *</span>
                  </label>
                  <select
                    name="soilType"
                    value={formData.soilType}
                    onChange={handleChange}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#176B45] focus:ring-1 focus:ring-[#176B45] text-xs sm:text-sm bg-white text-slate-800 outline-none transition"
                  >
                    {SOIL_TYPES.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#176B45]" />
                    <span>{t('crop.season', 'Cropping Season')} *</span>
                  </label>
                  <select
                    name="season"
                    value={formData.season}
                    onChange={handleChange}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#176B45] focus:ring-1 focus:ring-[#176B45] text-xs sm:text-sm bg-white text-slate-800 outline-none transition"
                  >
                    {SEASONS.map((sn) => (
                      <option key={sn} value={sn}>{sn}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Temperature & Humidity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Thermometer className="w-3.5 h-3.5 text-rose-500" />
                      <span>{t('crop.temperature', 'Average Temperature (°C)')} *</span>
                    </span>
                    <span className="text-xs font-bold text-slate-600">{formData.temperature}°C</span>
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="-10"
                    max="60"
                    name="temperature"
                    value={formData.temperature}
                    onChange={handleChange}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#176B45] focus:ring-1 focus:ring-[#176B45] text-xs sm:text-sm text-slate-800 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Droplets className="w-3.5 h-3.5 text-sky-500" />
                      <span>{t('crop.humidity', 'Relative Humidity (%)')} *</span>
                    </span>
                    <span className="text-xs font-bold text-slate-600">{formData.humidity}%</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    name="humidity"
                    value={formData.humidity}
                    onChange={handleChange}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#176B45] focus:ring-1 focus:ring-[#176B45] text-xs sm:text-sm text-slate-800 outline-none transition"
                  />
                </div>
              </div>

              {/* Soil pH & Rainfall */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Gauge className="w-3.5 h-3.5 text-[#176B45]" />
                      <span>{t('crop.soilPh', 'Soil pH Level')} *</span>
                    </span>
                    <span className="text-xs font-bold text-slate-600">{formData.ph}</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="3.0"
                    max="10.0"
                    name="ph"
                    value={formData.ph}
                    onChange={handleChange}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#176B45] focus:ring-1 focus:ring-[#176B45] text-xs sm:text-sm text-slate-800 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <CloudRain className="w-3.5 h-3.5 text-blue-500" />
                      <span>{t('crop.rainfall', 'Expected Rainfall (mm)')} *</span>
                    </span>
                    <span className="text-xs font-bold text-slate-600">{formData.rainfall} mm</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="3000"
                    name="rainfall"
                    value={formData.rainfall}
                    onChange={handleChange}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#176B45] focus:ring-1 focus:ring-[#176B45] text-xs sm:text-sm text-slate-800 outline-none transition"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  loading={loading}
                  icon={Sparkles}
                  className="w-full"
                >
                  {loading ? 'Evaluating Crop Suitability...' : 'Find Optimal Crop'}
                </Button>
              </div>

            </form>
          </Card>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-5 space-y-4">
          {result ? (
            <Card
              title="Optimal Recommended Crop"
              subtitle="Single best suited crop for your environmental parameters"
              className="border-[#22A06B]/50 ring-1 ring-[#22A06B]/20 animate-in fade-in"
            >
              <div className="space-y-4">
                
                {/* Result Hero Header */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-[#176B45] to-[#114F33] text-white flex items-center justify-between shadow-sm">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-emerald-200 font-bold block">
                      Recommended Crop
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black mt-0.5 tracking-tight text-white">
                      {result.cropName}
                    </h2>
                  </div>
                  <div className="text-right bg-white/10 px-3 py-1.5 rounded-xl border border-white/20 backdrop-blur-sm">
                    <span className="text-[10px] uppercase text-emerald-200 block font-bold">Confidence</span>
                    <span className="text-xl font-extrabold text-white">
                      {(result.confidenceScore <= 1.0 ? Math.round(result.confidenceScore * 100) : Math.round(result.confidenceScore))}%
                    </span>
                  </div>
                </div>

                {/* Uncertainty Warning Notice (when confidence < 70% or OOD) */}
                {result.uncertaintyWarning && (
                  <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block text-amber-950">Advisory Uncertainty Notice:</span>
                      <p className="mt-0.5 text-amber-800 leading-relaxed">{result.uncertaintyWarning}</p>
                    </div>
                  </div>
                )}

                {/* Suitability Explanation */}
                <div className="space-y-1.5 text-xs">
                  <span className="font-bold text-[#1F2937] flex items-center gap-1.5">
                    <BookmarkCheck className="w-4 h-4 text-[#176B45]" />
                    <span>Agronomic Suitability Rationale</span>
                  </span>
                  <p className="text-slate-700 leading-relaxed bg-[#F7FAF7] p-3.5 rounded-xl border border-slate-200">
                    {result.suitabilityExplanation}
                  </p>
                </div>

                {/* Cultivation Guidance */}
                <div className="space-y-1.5 text-xs">
                  <span className="font-bold text-[#1F2937] block">Cultivation & Field Guidelines</span>
                  <p className="text-slate-700 leading-relaxed bg-[#F7FAF7] p-3.5 rounded-xl border border-slate-200">
                    {result.cultivationInformation}
                  </p>
                </div>

                {/* Optimal Agronomic Ranges */}
                {result.agronomicParameters && (
                  <div className="space-y-1.5 text-xs">
                    <span className="font-bold text-[#1F2937] block">Optimal Agronomic Ranges for {result.cropName}</span>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="p-2.5 bg-[#F7FAF7] rounded-xl border border-slate-200">
                        <span className="text-slate-400 block text-[10px]">Optimal Temp</span>
                        <span className="font-bold text-slate-700">{result.agronomicParameters.optimalTemperature}</span>
                      </div>
                      <div className="p-2.5 bg-[#F7FAF7] rounded-xl border border-slate-200">
                        <span className="text-slate-400 block text-[10px]">Optimal Humidity</span>
                        <span className="font-bold text-slate-700">{result.agronomicParameters.optimalHumidity}</span>
                      </div>
                      <div className="p-2.5 bg-[#F7FAF7] rounded-xl border border-slate-200">
                        <span className="text-slate-400 block text-[10px]">Optimal Soil pH</span>
                        <span className="font-bold text-slate-700">{result.agronomicParameters.optimalSoilPh}</span>
                      </div>
                      <div className="p-2.5 bg-[#F7FAF7] rounded-xl border border-slate-200">
                        <span className="text-slate-400 block text-[10px]">Optimal Rainfall</span>
                        <span className="font-bold text-slate-700">{result.agronomicParameters.optimalRainfall}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-3 bg-[#E8F5EE] rounded-xl border border-[#C7E7D6] text-[11px] text-[#176B45] flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#22A06B] shrink-0 mt-0.5" />
                  <span>Recommendation saved to your farmer history for seasonal auditing.</span>
                </div>

              </div>
            </Card>
          ) : (
            <Card className="text-center py-14 px-6 flex flex-col items-center justify-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-[#E8F5EE] text-[#176B45] flex items-center justify-center border border-[#C7E7D6]">
                <Sprout className="w-7 h-7 text-[#22A06B]" />
              </div>
              <h3 className="font-bold text-[#1F2937] text-base">Awaiting Parameters</h3>
              <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                Provide your farm's soil type, cropping season, and weather observations, then click "Find Optimal Crop".
              </p>
            </Card>
          )}
        </div>

      </div>

    </div>
  );
}
