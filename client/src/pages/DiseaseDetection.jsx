import React, { useState } from 'react';
import { 
  ScanSearch, 
  Upload, 
  Camera, 
  Sparkles, 
  ShieldAlert, 
  CheckCircle2, 
  AlertCircle,
  Leaf
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import AlertBanner from '../components/common/AlertBanner';

export default function DiseaseDetection() {
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'camera'
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [diagnosis, setDiagnosis] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setDiagnosis(null);
    }
  };

  const handleDiagnose = () => {
    if (!previewUrl) return;
    setAnalyzing(true);

    // Shell demonstration: Simulates vision model inference
    setTimeout(() => {
      setDiagnosis({
        diseaseName: 'Tomato Early Blight (Alternaria solani)',
        isHealthy: false,
        confidenceScore: 0.91,
        symptoms: [
          'Dark brown to black spots with concentric rings (target board pattern) on older leaves.',
          'Yellowing of foliage surrounding the lesions leading to premature leaf drop.'
        ],
        causes: [
          'Fungal pathogen Alternaria solani thriving in warm temperatures (24-29°C) and prolonged leaf wetness.'
        ],
        prevention: [
          'Rotate crops with non-solanaceous crops for 2-3 years.',
          'Water at the base of plants using drip irrigation to avoid wetting foliage.'
        ],
        treatment: [
          'Prune and destroy infected lower leaves immediately.',
          'Apply copper-based organic fungicides or Mancozeb as recommended by local agricultural extension officers.'
        ]
      });
      setAnalyzing(false);
    }, 800);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded-full uppercase">
              Module 03
            </span>
            <span className="text-xs text-slate-400 font-medium">Computer Vision Diagnosis</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            Crop Disease Detection
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Identify crop leaf pathogens instantly via image upload or live camera capture
          </p>
        </div>

        <Badge variant="danger" pulse={true}>
          Phase 6 Vision Engine Ready
        </Badge>
      </div>

      <AlertBanner
        variant="advisory"
        title="Preliminary Diagnostic Notice"
        message="Computer vision results are preliminary screening aids and can be influenced by lighting or focus. Never apply high-risk pesticides without physical verification by an agricultural plant pathologist."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Upload / Capture Column */}
        <div className="lg:col-span-6 space-y-4">
          <Card
            title="Leaf Photo Acquisition"
            subtitle="Choose image file or capture directly using camera"
            icon={ScanSearch}
          >
            {/* Tabs */}
            <div className="flex rounded-xl bg-slate-100 p-1 mb-4">
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition ${
                  activeTab === 'upload' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Upload className="w-4 h-4" />
                <span>Upload Leaf Image</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('camera')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition ${
                  activeTab === 'camera' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Camera className="w-4 h-4" />
                <span>Live Camera</span>
              </button>
            </div>

            {/* Upload Area */}
            {activeTab === 'upload' ? (
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-agri-400 transition cursor-pointer">
                <input
                  type="file"
                  id="leaf-upload"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="leaf-upload" className="cursor-pointer space-y-2 block">
                  <div className="w-12 h-12 rounded-2xl bg-agri-50 text-agri-600 mx-auto flex items-center justify-center">
                    <Leaf className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-slate-700">Click to browse or drag and drop leaf photo</p>
                  <p className="text-[11px] text-slate-400">JPEG, PNG, or WebP up to 10MB</p>
                </label>
              </div>
            ) : (
              <div className="border border-slate-200 rounded-2xl p-6 text-center bg-slate-50 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-200 text-slate-600 mx-auto flex items-center justify-center">
                  <Camera className="w-6 h-6" />
                </div>
                <p className="text-xs font-semibold text-slate-700">Webcam / Mobile Camera Ready</p>
                <p className="text-[11px] text-slate-500">Live WebRTC camera feed interface connects during Phase 6.</p>
              </div>
            )}

            {/* Preview */}
            {previewUrl && (
              <div className="mt-4 space-y-3">
                <p className="text-xs font-semibold text-slate-700">Selected Leaf Preview:</p>
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 max-h-60 bg-black flex items-center justify-center">
                  <img src={previewUrl} alt="Leaf preview" className="object-contain max-h-60 w-full" />
                </div>
                <Button
                  onClick={handleDiagnose}
                  loading={analyzing}
                  icon={Sparkles}
                  className="w-full"
                >
                  Run Deep Learning Diagnostic
                </Button>
              </div>
            )}

          </Card>
        </div>

        {/* Diagnostic Results Column */}
        <div className="lg:col-span-6 space-y-4">
          {diagnosis ? (
            <Card
              title="Pathology Diagnosis Report"
              subtitle="Leaf visual classification analysis"
              className="border-rose-300 ring-2 ring-rose-500/10 animate-in fade-in"
            >
              <div className="space-y-4 text-xs">
                
                <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-600 to-red-700 text-white shadow-md flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-rose-200 block">
                      Detected Condition
                    </span>
                    <h3 className="text-base sm:text-lg font-black mt-0.5">
                      {diagnosis.diseaseName}
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-rose-200 block">Model Confidence</span>
                    <span className="text-lg font-extrabold">{(diagnosis.confidenceScore * 100).toFixed(0)}%</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="font-bold text-slate-800">Primary Symptoms:</span>
                  <ul className="list-disc list-inside text-slate-600 space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {diagnosis.symptoms.map((s, idx) => <li key={idx}>{s}</li>)}
                  </ul>
                </div>

                <div className="space-y-1">
                  <span className="font-bold text-slate-800">Pathological Causes:</span>
                  <ul className="list-disc list-inside text-slate-600 space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {diagnosis.causes.map((c, idx) => <li key={idx}>{c}</li>)}
                  </ul>
                </div>

                <div className="space-y-1">
                  <span className="font-bold text-emerald-800">Prevention Methods:</span>
                  <ul className="list-disc list-inside text-slate-600 space-y-1 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
                    {diagnosis.prevention.map((p, idx) => <li key={idx}>{p}</li>)}
                  </ul>
                </div>

                <div className="space-y-1">
                  <span className="font-bold text-rose-800">Recommended Treatment:</span>
                  <ul className="list-disc list-inside text-slate-600 space-y-1 bg-rose-50/50 p-3 rounded-xl border border-rose-100">
                    {diagnosis.treatment.map((t, idx) => <li key={idx}>{t}</li>)}
                  </ul>
                </div>

              </div>
            </Card>
          ) : (
            <Card className="text-center py-14 px-6 flex flex-col items-center justify-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
                <ScanSearch className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-slate-800 text-base">Awaiting Leaf Inspection</h3>
              <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                Upload or capture an image of an infected plant leaf to inspect fungal, bacterial, and pest-related abnormalities.
              </p>
            </Card>
          )}
        </div>

      </div>

    </div>
  );
}
