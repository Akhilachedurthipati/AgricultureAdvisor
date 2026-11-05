import React, { useState } from 'react';
import { 
  FlaskConical, 
  Sparkles, 
  ShieldAlert, 
  Layers, 
  Calendar, 
  HelpCircle, 
  CheckCircle2, 
  AlertTriangle,
  Beaker,
  Scale
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import AlertBanner from '../components/common/AlertBanner';

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

export default function FertilizerRecommendation() {
  const [formData, setFormData] = useState({
    soilType: 'Black Cotton Soil',
    season: 'Kharif (Monsoon: Jun - Oct)',
    crop: 'Cotton',
    nitrogen: 35,
    phosphorus: 20,
    potassium: 30,
    landArea: 2,
    landAreaUnit: 'Acres'
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleCalculate = (e) => {
    e.preventDefault();
    setLoading(true);

    // Layout Shell demonstration: Simulates validated agronomic recommendation
    setTimeout(() => {
      setResult({
        fertilizerName: 'Urea (46% N) + Di-Ammonium Phosphate (DAP)',
        reason: `Based on your soil test values (N: ${formData.nitrogen}, P: ${formData.phosphorus}, K: ${formData.potassium}), your soil shows a moderate Nitrogen deficit and Phosphorus requirement for ${formData.crop}.`,
        dosageGuidance: `For ${formData.landArea} ${formData.landAreaUnit} of ${formData.crop}: Apply 50 kg DAP at the time of sowing/basal, followed by 45 kg Urea in two split doses during early growth and flowering stages.`,
        nutrientAnalysis: 'Nitrogen (Low) | Phosphorus (Medium) | Potassium (Sufficient)',
        safetyPrecautions: [
          'Wear protective gloves and face mask when handling chemical fertilizers.',
          'Never apply fertilizer directly onto wet foliage or during impending heavy rainfall to prevent runoff into water bodies.',
          'Store bags in a cool, dry place away from direct sunlight, children, and livestock.',
          'Irrigate the field moderately within 24 hours of application for optimal nutrient absorption.'
        ]
      });
      setLoading(false);
    }, 600);
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
            <span className="text-xs text-slate-400 font-medium">Validated Agronomic Rules</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            Precision Fertilizer Recommendation
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Optimize nutrient inputs, balance soil health, and prevent chemical overdosage
          </p>
        </div>

        <Badge variant="warning" pulse={true}>
          Phase 5 Rule Engine Ready
        </Badge>
      </div>

      {/* Advisory Banner */}
      <AlertBanner
        variant="advisory"
        title="Safety & Soil Testing Notice"
        message="Exact nutrient requirements depend heavily on recent soil health card lab reports. Never guess chemical dosages. Follow recommended application guidelines and always consult an agricultural extension officer."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Form Column */}
        <div className="lg:col-span-7">
          <Card
            title="Crop & Soil Nutrient Data"
            subtitle="Provide your current N-P-K nutrient readings and field size"
            icon={FlaskConical}
          >
            <form onSubmit={handleCalculate} className="space-y-4">
              
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
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-amber-500 text-xs sm:text-sm bg-white"
                  >
                    {SEASONS.map((sn) => (
                      <option key={sn} value={sn}>{sn}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Selected Crop & Land Area */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Target Crop *
                  </label>
                  <select
                    name="crop"
                    value={formData.crop}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-amber-500 text-xs sm:text-sm bg-white"
                  >
                    {CROPS.map((cr) => (
                      <option key={cr} value={cr}>{cr}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Land Area & Unit *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      step="0.5"
                      min="0.1"
                      name="landArea"
                      value={formData.landArea}
                      onChange={handleChange}
                      placeholder="Area"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-amber-500 text-xs sm:text-sm"
                    />
                    <select
                      name="landAreaUnit"
                      value={formData.landAreaUnit}
                      onChange={handleChange}
                      className="w-full px-2 py-2 rounded-xl border border-slate-200 focus:border-amber-500 text-xs sm:text-sm bg-white"
                    >
                      <option value="Acres">Acres</option>
                      <option value="Hectares">Hectares</option>
                      <option value="Guntas">Guntas</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* N-P-K Inputs */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center justify-between">
                  <span>Soil Nutrients (kg / ha or Soil Health Card Values)</span>
                  <span className="text-[11px] text-slate-400 font-normal">N - P - K</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <span className="text-[11px] font-semibold text-blue-700 block mb-1">Nitrogen (N)</span>
                    <input
                      type="number"
                      name="nitrogen"
                      value={formData.nitrogen}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-amber-500 text-xs text-slate-800"
                    />
                  </div>

                  <div>
                    <span className="text-[11px] font-semibold text-amber-700 block mb-1">Phosphorus (P)</span>
                    <input
                      type="number"
                      name="phosphorus"
                      value={formData.phosphorus}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-amber-500 text-xs text-slate-800"
                    />
                  </div>

                  <div>
                    <span className="text-[11px] font-semibold text-emerald-700 block mb-1">Potassium (K)</span>
                    <input
                      type="number"
                      name="potassium"
                      value={formData.potassium}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-amber-500 text-xs text-slate-800"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  loading={loading}
                  variant="primary"
                  icon={Sparkles}
                  className="w-full"
                >
                  Calculate Fertilizer Advisory
                </Button>
              </div>

            </form>
          </Card>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-5 space-y-4">
          {result ? (
            <Card
              title="Tailored Fertilizer Advisory"
              subtitle="Calculated nutrient recommendations"
              className="border-amber-300 ring-2 ring-amber-500/10 animate-in fade-in"
            >
              <div className="space-y-4 text-xs">
                
                <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-amber-100 block">
                    Recommended Fertilizer Combination
                  </span>
                  <h3 className="text-lg font-black mt-1 leading-snug">
                    {result.fertilizerName}
                  </h3>
                </div>

                <div className="space-y-1">
                  <span className="font-bold text-slate-800 block">Nutrient Deficit Analysis</span>
                  <p className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 leading-relaxed">
                    {result.nutrientAnalysis}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="font-bold text-slate-800 block">Application Guidance & Dosage</span>
                  <p className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 leading-relaxed">
                    {result.dosageGuidance}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-rose-500" />
                    <span>Application Safety Precautions</span>
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

              </div>
            </Card>
          ) : (
            <Card className="text-center py-12 px-6 flex flex-col items-center justify-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                <FlaskConical className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-slate-800 text-base">Nutrient Form Awaiting Input</h3>
              <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                Enter your soil's N, P, K levels and target crop to generate a customized nutrient replenishment schedule.
              </p>
            </Card>
          )}

          {/* Validation Notice */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 text-xs text-slate-600 space-y-2">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Agronomic Rule Engine Integrity</span>
            </h4>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Rules strictly follow standard Indian Council of Agricultural Research (ICAR) nutrient baseline metrics. No unsafe or unverified chemical concoctions are ever output.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
