import React, { useState } from 'react';
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
  Info
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
    name: 'Groundnut (Red Soil, 3 Acres - SSP)',
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
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full uppercase">
              Module 02
            </span>
            <span className="text-xs text-slate-400 font-medium">Validated Agronomic STCR Calculations</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            Precision Fertilizer Recommendation
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Calculate accurate N-P-K nutrient replenishment, split application timetables, and chemical safety protocols
          </p>
        </div>

        <Badge variant="warning" pulse={true}>
          STCR Engine Active
        </Badge>
      </div>

      {/* Advisory Banner */}
      <AlertBanner
        variant="advisory"
        title="Official Soil Health & Chemical Safety Notice"
        message="Exact nutrient requirements depend heavily on recent soil health card lab reports. Follow calculated application guidelines to prevent groundwater contamination or fertilizer burn. Always consult your district agricultural extension officer."
      />

      {/* Quick Test Presets */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2 text-slate-700 font-semibold">
          <SlidersHorizontal className="w-4 h-4 text-amber-600" />
          <span>Quick Evaluation Scenarios:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyPreset(p)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-amber-50 hover:text-amber-800 border border-slate-200 text-slate-600 font-medium transition cursor-pointer text-[11px]"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {errorMessage && (
        <AlertBanner
          variant="danger"
          title="Input Error"
          message={errorMessage}
          dismissible={true}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Form Column */}
        <div className="lg:col-span-6">
          <Card
            title="Crop & Soil Nutrient Data"
            subtitle="Provide your soil testing readings and farm acreage"
            icon={FlaskConical}
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Soil Type & Season */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-amber-600" />
                    <span>Soil Type *</span>
                  </label>
                  <select
                    name="soilType"
                    value={formData.soilType}
                    onChange={handleChange}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-amber-500 text-xs sm:text-sm bg-white"
                  >
                    {SOIL_TYPES.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-600" />
                    <span>Season *</span>
                  </label>
                  <select
                    name="season"
                    value={formData.season}
                    onChange={handleChange}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-amber-500 text-xs sm:text-sm bg-white"
                  >
                    {SEASONS.map((sn) => (
                      <option key={sn} value={sn}>{sn}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Crop & Land Area */}
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
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-amber-500 text-xs sm:text-sm bg-white"
                  >
                    {CROPS.map((cr) => (
                      <option key={cr} value={cr}>{cr}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5 text-amber-600" />
                    <span>Land Area (Acres) *</span>
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.1"
                    max="5000"
                    name="landArea"
                    value={formData.landArea}
                    onChange={handleChange}
                    required
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-amber-500 text-xs sm:text-sm"
                  />
                </div>
              </div>

              {/* Measured Soil Nutrients */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 flex items-center justify-between">
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
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-amber-500 text-xs text-slate-800"
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
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-amber-500 text-xs text-slate-800"
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
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-amber-500 text-xs text-slate-800"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  loading={loading}
                  icon={Sparkles}
                  className="w-full !bg-amber-600 hover:!bg-amber-700 active:!bg-amber-800"
                >
                  Calculate Scientifically Defensible Advisory
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
              subtitle={`Agronomic recommendation for ${result.landArea} Acre(s) of ${result.crop}`}
              className="border-amber-300 ring-2 ring-amber-500/15 animate-in fade-in"
            >
              <div className="space-y-4">
                
                {/* Header Banner */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-600 via-amber-700 to-orange-700 text-white shadow-md">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-amber-200 block">
                    Recommended Fertilizer Formulation
                  </span>
                  <h3 className="text-base sm:text-lg font-black mt-1 leading-snug">
                    {result.fertilizerCombination}
                  </h3>
                </div>

                {/* Total Land Area Quantity Requirements (50kg Bags) */}
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
                  <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-amber-700" />
                    <span>Total Purchase Requirements for {result.landArea} Acre(s):</span>
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                    <div className="p-3 bg-white rounded-xl border border-amber-100 shadow-sm text-center">
                      <span className="text-[10px] uppercase text-slate-400 font-bold block">Urea (46% N)</span>
                      <span className="text-base font-extrabold text-slate-900 block mt-0.5">
                        {result.dosageBreakdown.totalLandArea.ureaTotalKg} kg
                      </span>
                      <span className="text-[11px] font-semibold text-amber-700">
                        {result.dosageBreakdown.totalLandArea.ureaTotalBags}
                      </span>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-amber-100 shadow-sm text-center">
                      <span className="text-[10px] uppercase text-slate-400 font-bold block">
                        {result.dosageBreakdown.totalLandArea.pCarrierName} (P₂O₅)
                      </span>
                      <span className="text-base font-extrabold text-slate-900 block mt-0.5">
                        {result.dosageBreakdown.totalLandArea.pTotalKg} kg
                      </span>
                      <span className="text-[11px] font-semibold text-amber-700">
                        {result.dosageBreakdown.totalLandArea.pTotalBags}
                      </span>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-amber-100 shadow-sm text-center">
                      <span className="text-[10px] uppercase text-slate-400 font-bold block">MOP (60% K₂O)</span>
                      <span className="text-base font-extrabold text-slate-900 block mt-0.5">
                        {result.dosageBreakdown.totalLandArea.mopTotalKg} kg
                      </span>
                      <span className="text-[11px] font-semibold text-amber-700">
                        {result.dosageBreakdown.totalLandArea.mopTotalBags}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Nutrient Deficit Status */}
                <div className="space-y-1.5 text-xs">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <BookmarkCheck className="w-4 h-4 text-amber-600" />
                    <span>Soil Test Nutrient Deficit Evaluation</span>
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-700">Nitrogen</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          result.nutrientDeficitAnalysis.nitrogen.status === 'Low' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {result.nutrientDeficitAnalysis.nitrogen.status}
                        </span>
                      </div>
                      <span className="text-slate-500 mt-1 block">Target: {result.nutrientDeficitAnalysis.nitrogen.targetRate}</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-700">Phosphorus</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          result.nutrientDeficitAnalysis.phosphorus.status === 'Low' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {result.nutrientDeficitAnalysis.phosphorus.status}
                        </span>
                      </div>
                      <span className="text-slate-500 mt-1 block">Target: {result.nutrientDeficitAnalysis.phosphorus.targetRate}</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-700">Potassium</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          result.nutrientDeficitAnalysis.potassium.status === 'Low' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {result.nutrientDeficitAnalysis.potassium.status}
                        </span>
                      </div>
                      <span className="text-slate-500 mt-1 block">Target: {result.nutrientDeficitAnalysis.potassium.targetRate}</span>
                    </div>
                  </div>
                </div>

                {/* Application Schedule */}
                <div className="space-y-1 text-xs">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-agri-600" />
                    <span>Split Application Guidance</span>
                  </span>
                  <pre className="font-sans whitespace-pre-wrap p-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 text-[11px] leading-relaxed">
                    {result.applicationGuidance}
                  </pre>
                </div>

                {/* Safety Precautions */}
                <div className="space-y-1 text-xs">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-rose-500" />
                    <span>Handling & Environmental Safety Precautions</span>
                  </span>
                  <ul className="space-y-1 bg-rose-50/60 p-3 rounded-xl border border-rose-100 text-[11px] text-rose-950">
                    {result.safetyPrecautions.map((precaution, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-rose-500 mt-0.5">•</span>
                        <span>{precaution}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>Fertilizer recommendation recorded in your farmer history for multi-season tracking.</span>
                </div>

              </div>
            </Card>
          ) : (
            <Card className="text-center py-16 px-6 flex flex-col items-center justify-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                <FlaskConical className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-slate-800 text-base">Nutrient Engine Awaiting Data</h3>
              <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                Enter your soil's N-P-K nutrient readings and acreage to calculate precise fertilizer quantities and avoid chemical over-application.
              </p>
            </Card>
          )}

          {/* ICAR Compliance Card */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 text-xs text-slate-600 space-y-2">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Scientific Agronomic Verification</span>
            </h4>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Calculations account for fertilizer nutrient carrier percentages (Urea 46% N, DAP 18% N + 46% P₂O₅, SSP 16% P₂O₅, MOP 60% K₂O) and soil texture leaching dynamics.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
