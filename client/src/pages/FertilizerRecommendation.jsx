import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  Check
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import AlertBanner from '../components/common/AlertBanner';
import { getRecommendedFertilizer } from '../services/fertilizerService';

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
    name: 'Cotton (Black Soil, 2 Acres)',
    soilType: 'Black Cotton Soil',
    season: 'Kharif (Monsoon: Jun - Oct)',
    crop: 'Cotton',
    nitrogen: 35,
    phosphorus: 20,
    potassium: 30,
    landArea: 2
  },
  {
    name: 'Rice / Paddy (Clay, 5 Acres)',
    soilType: 'Clay Soil',
    season: 'Kharif (Monsoon: Jun - Oct)',
    crop: 'Rice (Paddy)',
    nitrogen: 40,
    phosphorus: 15,
    potassium: 35,
    landArea: 5
  },
  {
    name: 'Groundnut (Red Soil, 3 Acres)',
    soilType: 'Red Soil',
    season: 'Kharif (Monsoon: Jun - Oct)',
    crop: 'Groundnut',
    nitrogen: 20,
    phosphorus: 15,
    potassium: 25,
    landArea: 3
  },
  {
    name: 'Wheat (Alluvial, 4 Acres)',
    soilType: 'Alluvial Soil',
    season: 'Rabi (Winter: Oct - Mar)',
    crop: 'Wheat',
    nitrogen: 45,
    phosphorus: 20,
    potassium: 20,
    landArea: 4
  }
];

export default function FertilizerRecommendation() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    soilType: 'Black Cotton Soil',
    season: 'Kharif (Monsoon: Jun - Oct)',
    crop: 'Cotton',
    nitrogen: 35,
    phosphorus: 20,
    potassium: 30,
    landArea: 2
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
      crop: preset.crop,
      nitrogen: preset.nitrogen,
      phosphorus: preset.phosphorus,
      potassium: preset.potassium,
      landArea: preset.landArea
    });
    setResult(null);
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const response = await getRecommendedFertilizer({
        soilType: formData.soilType,
        season: formData.season,
        crop: formData.crop,
        nitrogen: Number(formData.nitrogen),
        phosphorus: Number(formData.phosphorus),
        potassium: Number(formData.potassium),
        landArea: Number(formData.landArea)
      });

      if (response.success && response.data) {
        setResult(response.data);
      } else {
        throw new Error(response.message || 'Calculation failed');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to calculate fertilizer recommendations.');
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
            <span className="text-xs font-bold uppercase tracking-wider text-[#246B45]">
              Nutrient Management
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#202923] tracking-tight mt-0.5">
            {t('fertilizer.title', 'Fertilizer Guidance')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {t('fertilizer.subtitle', 'Calculate accurate N-P-K nutrient replenishment, split application timetables, and chemical safety protocols.')}
          </p>
        </div>

        <Badge variant="forest">
          STCR Precision Engine
        </Badge>
      </div>

      {/* Advisory Banner */}
      <AlertBanner
        variant="disclaimer"
        title="Soil Health & Chemical Safety Notice"
        message="Exact nutrient requirements depend heavily on recent soil health card lab reports. Follow calculated application guidelines to prevent groundwater contamination or fertilizer burn. Always consult your district agricultural extension officer."
      />

      {/* Quick Test Presets */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2 text-[#202923] font-semibold">
          <SlidersHorizontal className="w-4 h-4 text-[#246B45]" />
          <span>Quick Evaluation Scenarios:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyPreset(p)}
              className="px-3 py-1.5 rounded-xl bg-[#F7F7F0] hover:bg-[#123D2A]/10 hover:text-[#123D2A] border border-slate-200 text-slate-700 font-medium transition cursor-pointer text-xs"
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
        <div className="lg:col-span-6">
          <Card
            title="Crop & Soil Nutrients"
            subtitle="Provide your target crop, land area, and measured soil N-P-K levels"
            icon={FlaskConical}
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Target Crop & Soil Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Target Crop *
                  </label>
                  <select
                    name="crop"
                    value={formData.crop}
                    onChange={handleChange}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-amber-600 focus:ring-1 focus:ring-amber-600 text-xs sm:text-sm bg-white text-slate-800 outline-none transition"
                  >
                    {CROPS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Soil Type *
                  </label>
                  <select
                    name="soilType"
                    value={formData.soilType}
                    onChange={handleChange}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-amber-600 focus:ring-1 focus:ring-amber-600 text-xs sm:text-sm bg-white text-slate-800 outline-none transition"
                  >
                    {SOIL_TYPES.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Cropping Season & Land Area */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Cropping Season *
                  </label>
                  <select
                    name="season"
                    value={formData.season}
                    onChange={handleChange}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-amber-600 focus:ring-1 focus:ring-amber-600 text-xs sm:text-sm bg-white text-slate-800 outline-none transition"
                  >
                    {SEASONS.map((sn) => (
                      <option key={sn} value={sn}>{sn}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                    <span>Land Area (Acres) *</span>
                    <span className="text-xs font-bold text-amber-700">{formData.landArea} Acre(s)</span>
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.1"
                    max="1000"
                    name="landArea"
                    value={formData.landArea}
                    onChange={handleChange}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-amber-600 focus:ring-1 focus:ring-amber-600 text-xs sm:text-sm text-slate-800 outline-none transition"
                  />
                </div>
              </div>

              {/* Measured Soil Nutrients */}
              <div className="space-y-2 pt-1">
                <label className="block text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>Soil Nutrient Test Values (from Soil Health Card)</span>
                  <span className="text-[11px] text-slate-400 font-normal">Values in kg/acre</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <span className="text-[11px] font-semibold text-blue-700 block mb-1">Nitrogen (N) *</span>
                    <input
                      type="number"
                      min="0"
                      max="1000"
                      name="nitrogen"
                      value={formData.nitrogen}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-amber-600 text-xs text-slate-800 outline-none transition"
                    />
                  </div>

                  <div>
                    <span className="text-[11px] font-semibold text-amber-700 block mb-1">Phosphorus (P) *</span>
                    <input
                      type="number"
                      min="0"
                      max="500"
                      name="phosphorus"
                      value={formData.phosphorus}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-amber-600 text-xs text-slate-800 outline-none transition"
                    />
                  </div>

                  <div>
                    <span className="text-[11px] font-semibold text-emerald-700 block mb-1">Potassium (K) *</span>
                    <input
                      type="number"
                      min="0"
                      max="1000"
                      name="potassium"
                      value={formData.potassium}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-amber-600 text-xs text-slate-800 outline-none transition"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  loading={loading}
                  icon={Sparkles}
                  className="w-full !bg-[#123D2A] hover:!bg-[#1D5939] text-white shadow-premium"
                >
                  {loading ? 'Calculating Nutrient Dosages...' : 'Calculate Fertilizer Dosage'}
                </Button>
              </div>

            </form>
          </Card>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-6 space-y-4">
          {result ? (
            <Card
              title="Tailored Fertilizer Advisory"
              subtitle={`Precision plan for ${result.landArea} Acre(s) of ${result.crop}`}
              className="border-[#246B45]/50 ring-1 ring-[#246B45]/20 animate-in fade-in"
            >
              <div className="space-y-4">
                
                {/* Header Banner */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-[#123D2A] to-[#1A4D35] text-white shadow-premium">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-200 block">
                    Recommended Formulation
                  </span>
                  <h3 className="text-base sm:text-lg font-black mt-1 leading-snug text-white">
                    {result.fertilizerCombination}
                  </h3>
                </div>

                {/* Total Land Area Quantity Requirements (50kg Bags) */}
                <div className="p-4 rounded-2xl bg-[#F7F7F0] border border-[#D7DBC5]/80 space-y-3">
                  <span className="text-xs font-bold text-[#123D2A] flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-[#246B45]" />
                    <span>Total Purchase Requirements ({result.landArea} Acres):</span>
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                    <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs text-center">
                      <span className="text-[10px] uppercase text-slate-400 font-bold block">Urea (46% N)</span>
                      <span className="text-base font-extrabold text-[#202923] block mt-0.5">
                        {result.dosageBreakdown.totalLandArea.ureaTotalKg} kg
                      </span>
                      <span className="text-xs font-bold text-[#123D2A]">
                        {result.dosageBreakdown.totalLandArea.ureaTotalBags}
                      </span>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs text-center">
                      <span className="text-[10px] uppercase text-slate-400 font-bold block">
                        {result.dosageBreakdown.totalLandArea.pCarrierName}
                      </span>
                      <span className="text-base font-extrabold text-[#202923] block mt-0.5">
                        {result.dosageBreakdown.totalLandArea.pTotalKg} kg
                      </span>
                      <span className="text-xs font-bold text-[#123D2A]">
                        {result.dosageBreakdown.totalLandArea.pTotalBags}
                      </span>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs text-center">
                      <span className="text-[10px] uppercase text-slate-400 font-bold block">MOP (60% K₂O)</span>
                      <span className="text-base font-extrabold text-[#202923] block mt-0.5">
                        {result.dosageBreakdown.totalLandArea.mopTotalKg} kg
                      </span>
                      <span className="text-xs font-bold text-[#123D2A]">
                        {result.dosageBreakdown.totalLandArea.mopTotalBags}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Nutrient Deficit Status */}
                <div className="space-y-1.5 text-xs">
                  <span className="font-bold text-[#1F2937] flex items-center gap-1.5">
                    <BookmarkCheck className="w-4 h-4 text-amber-600" />
                    <span>Soil Test Nutrient Deficit Evaluation</span>
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-700">Nitrogen</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          result.nutrientDeficitAnalysis.nitrogen.status === 'Low' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {result.nutrientDeficitAnalysis.nitrogen.status}
                        </span>
                      </div>
                      <p className="text-slate-500 text-[10px] mt-1">Target: {result.nutrientDeficitAnalysis.nitrogen.targetRate}</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-700">Phosphorus</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          result.nutrientDeficitAnalysis.phosphorus.status === 'Low' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {result.nutrientDeficitAnalysis.phosphorus.status}
                        </span>
                      </div>
                      <p className="text-slate-500 text-[10px] mt-1">Target: {result.nutrientDeficitAnalysis.phosphorus.targetRate}</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-700">Potassium</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          result.nutrientDeficitAnalysis.potassium.status === 'High' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {result.nutrientDeficitAnalysis.potassium.status}
                        </span>
                      </div>
                      <p className="text-slate-500 text-[10px] mt-1">Target: {result.nutrientDeficitAnalysis.potassium.targetRate}</p>
                    </div>
                  </div>
                </div>

                {/* Split Application Schedule */}
                <div className="space-y-1.5 text-xs">
                  <span className="font-bold text-[#1F2937] flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>Application Timetable</span>
                  </span>
                  <div className="bg-[#F7FAF7] p-3.5 rounded-xl border border-slate-200 text-slate-700 leading-relaxed font-mono text-[11px] whitespace-pre-line">
                    {result.applicationGuidance}
                  </div>
                </div>

                {/* Safety Precautions */}
                {result.safetyPrecautions && (
                  <div className="space-y-1.5 text-xs">
                    <span className="font-bold text-rose-900 flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-rose-600" />
                      <span>Chemical Handling Safety</span>
                    </span>
                    <ul className="list-disc list-inside space-y-1 bg-rose-50/70 p-3 rounded-xl border border-rose-200 text-rose-900 text-[11px] leading-relaxed">
                      {result.safetyPrecautions.slice(0, 3).map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

              </div>
            </Card>
          ) : (
            <Card className="text-center py-14 px-6 flex flex-col items-center justify-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-[#F7F7F0] text-[#123D2A] flex items-center justify-center border border-[#D7DBC5]">
                <FlaskConical className="w-7 h-7 text-[#246B45]" />
              </div>
              <h3 className="font-bold text-[#202923] text-base">Awaiting Field Information</h3>
              <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                Select your crop, land area, and enter your soil test values to generate customized fertilizer dosage schedules.
              </p>
            </Card>
          )}
        </div>

      </div>

    </div>
  );
}
