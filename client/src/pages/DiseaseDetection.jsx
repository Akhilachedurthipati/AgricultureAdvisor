import React, { useState, useRef, useEffect } from 'react';
import { 
  ScanSearch, 
  Upload, 
  Camera, 
  Sparkles, 
  ShieldAlert, 
  CheckCircle2, 
  AlertCircle,
  Leaf,
  RefreshCw,
  CameraOff,
  SwitchCamera,
  History,
  Trash2,
  Printer,
  FileText,
  AlertTriangle,
  Info,
  Calendar,
  Activity
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import AlertBanner from '../components/common/AlertBanner';
import { useTranslation } from 'react-i18next';
import { detectCropDisease, fetchDiseaseHistory, deleteDiseaseRecord } from '../services/diseaseService';

export default function DiseaseDetection() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'camera'
  const [selectedCrop, setSelectedCrop] = useState('auto');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [diagnosis, setDiagnosis] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [inconclusiveNotice, setInconclusiveNotice] = useState(null);

  // Live Camera states
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' | 'user'

  // History states
  const [historyList, setHistoryList] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Supported crops
  const CROP_OPTIONS = [
    { value: 'auto', label: '🔍 Auto-Detect Crop' },
    { value: 'Cotton', label: '🌱 Cotton' },
    { value: 'Paddy (Rice)', label: '🌾 Paddy (Rice)' },
    { value: 'Groundnut', label: '🥜 Groundnut' },
    { value: 'Maize', label: '🌽 Maize (Corn)' },
    { value: 'Tomato', label: '🍅 Tomato' },
    { value: 'Chilli', label: '🌶️ Chilli' },
    { value: 'Potato', label: '🥔 Potato' }
  ];

  // Load history on mount
  useEffect(() => {
    loadScanHistory();
    return () => {
      stopCamera();
    };
  }, []);

  // Handle switching tabs
  useEffect(() => {
    if (activeTab === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
  }, [activeTab, facingMode]);

  const loadScanHistory = async () => {
    try {
      setLoadingHistory(true);
      const res = await fetchDiseaseHistory();
      if (res.success && Array.isArray(res.data)) {
        setHistoryList(res.data);
      }
    } catch {
      // Ignore background history failure for unauthenticated or first-time users
    } finally {
      setLoadingHistory(false);
    }
  };

  // WebRTC Live Camera Management
  const startCamera = async () => {
    stopCamera();
    setCameraError(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('WebRTC camera access is not supported by your browser.');
      return;
    }

    try {
      const constraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err) {
      console.warn('Camera stream error:', err);
      // Fallback to basic video without facingMode constraint
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        streamRef.current = fallbackStream;
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
          videoRef.current.play();
        }
        setIsCameraActive(true);
      } catch (fallbackErr) {
        setCameraError('Unable to access camera. Please allow camera permissions or upload an image file.');
        setIsCameraActive(false);
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `camera_scan_${Date.now()}.jpg`, { type: 'image/jpeg' });
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(blob));
        setDiagnosis(null);
        setErrorMessage(null);
        setInconclusiveNotice(null);
        stopCamera();
      }
    }, 'image/jpeg', 0.92);
  };

  // File Upload Handlers
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = (file) => {
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please upload a valid image file (JPEG, PNG, or WebP).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('Image size exceeds 10MB limit. Please upload a smaller photo.');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setDiagnosis(null);
    setErrorMessage(null);
    setInconclusiveNotice(null);
  };

  // One-Click Calibrated Test Presets
  const loadPresetSample = (presetType) => {
    setErrorMessage(null);
    setInconclusiveNotice(null);
    setDiagnosis(null);

    const canvas = document.createElement('canvas');
    canvas.width = 120;
    canvas.height = 120;
    const ctx = canvas.getContext('2d');

    if (presetType === 'tomato_blight') {
      setSelectedCrop('Tomato');
      // Green background leaf
      ctx.fillStyle = 'rgb(45, 155, 45)';
      ctx.fillRect(0, 0, 120, 120);
      // Chlorotic yellow halo
      ctx.beginPath();
      ctx.arc(60, 60, 42, 0, Math.PI * 2);
      ctx.fillStyle = 'rgb(215, 190, 30)';
      ctx.fill();
      // Concentric target rings (Alternaria bullseye)
      ctx.beginPath();
      ctx.arc(60, 60, 32, 0, Math.PI * 2);
      ctx.fillStyle = 'rgb(80, 45, 25)';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(60, 60, 20, 0, Math.PI * 2);
      ctx.fillStyle = 'rgb(50, 30, 15)';
      ctx.fill();
    } else if (presetType === 'tomato_healthy') {
      setSelectedCrop('Tomato');
      // Uniform vibrant chlorophyll green
      ctx.fillStyle = 'rgb(42, 175, 48)';
      ctx.fillRect(0, 0, 120, 120);
      // Soft venation
      ctx.strokeStyle = 'rgb(60, 195, 65)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(60, 0); ctx.lineTo(60, 120);
      ctx.moveTo(60, 40); ctx.lineTo(100, 20);
      ctx.moveTo(60, 70); ctx.lineTo(20, 50);
      ctx.stroke();
    } else if (presetType === 'rice_blast') {
      setSelectedCrop('Rice');
      // Rice linear leaf blade green
      ctx.fillStyle = 'rgb(40, 160, 45)';
      ctx.fillRect(0, 0, 120, 120);
      // Spindle / diamond lesion
      ctx.save();
      ctx.translate(60, 60);
      ctx.scale(1, 2.5);
      ctx.beginPath();
      ctx.arc(0, 0, 18, 0, Math.PI * 2);
      ctx.fillStyle = 'rgb(95, 45, 20)'; // Brown border
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.fillStyle = 'rgb(185, 180, 175)'; // Grayish center
      ctx.fill();
      ctx.restore();
    } else if (presetType === 'potato_late_blight') {
      setSelectedCrop('Potato');
      ctx.fillStyle = 'rgb(40, 150, 42)';
      ctx.fillRect(0, 0, 120, 120);
      // Water-soaked dark necrotic blotch
      ctx.beginPath();
      ctx.ellipse(65, 55, 45, 30, Math.PI / 4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgb(50, 40, 30)';
      ctx.fill();
      // Pale margin
      ctx.strokeStyle = 'rgb(170, 190, 70)';
      ctx.lineWidth = 3;
      ctx.stroke();
    } else if (presetType === 'cotton_blight') {
      setSelectedCrop('Cotton');
      ctx.fillStyle = 'rgb(45, 145, 45)';
      ctx.fillRect(0, 0, 120, 120);
      // Angular water-soaked necrotic lesions strictly bound by veins
      ctx.fillStyle = 'rgb(55, 30, 18)';
      ctx.fillRect(35, 35, 26, 26);
      ctx.fillRect(70, 55, 22, 22);
      ctx.strokeStyle = 'rgb(190, 160, 40)';
      ctx.lineWidth = 2;
      ctx.strokeRect(35, 35, 26, 26);
      ctx.strokeRect(70, 55, 22, 22);
    } else if (presetType === 'groundnut_tikka') {
      setSelectedCrop('Groundnut');
      ctx.fillStyle = 'rgb(48, 155, 45)';
      ctx.fillRect(0, 0, 120, 120);
      // Tikka circular dark necrotic spots with distinct chlorotic halos
      ctx.fillStyle = 'rgb(220, 200, 35)';
      ctx.beginPath(); ctx.arc(42, 48, 18, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(82, 72, 15, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgb(45, 25, 15)';
      ctx.beginPath(); ctx.arc(42, 48, 11, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(82, 72, 9, 0, Math.PI * 2); ctx.fill();
    } else if (presetType === 'maize_blight') {
      setSelectedCrop('Maize');
      ctx.fillStyle = 'rgb(45, 150, 40)';
      ctx.fillRect(0, 0, 120, 120);
      // Elongated cigar-shaped tan necrotic lesion
      ctx.save();
      ctx.translate(60, 60);
      ctx.rotate(-Math.PI / 4);
      ctx.scale(1, 2.8);
      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, Math.PI * 2);
      ctx.fillStyle = 'rgb(140, 115, 75)';
      ctx.fill();
      ctx.strokeStyle = 'rgb(75, 45, 25)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    } else if (presetType === 'chilli_curl') {
      setSelectedCrop('Chilli');
      ctx.fillStyle = 'rgb(80, 160, 40)';
      ctx.fillRect(0, 0, 120, 120);
      // Interveinal chlorosis and puckered leaf curl margin
      ctx.fillStyle = 'rgb(205, 195, 45)';
      ctx.beginPath(); ctx.arc(60, 60, 36, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgb(115, 60, 20)';
      ctx.lineWidth = 3;
      ctx.strokeRect(15, 15, 90, 90);
    }

    canvas.toBlob((blob) => {
      const file = new File([blob], `preset_${presetType}.jpg`, { type: 'image/jpeg' });
      setSelectedFile(file);
      setPreviewUrl(canvas.toDataURL('image/jpeg'));
    }, 'image/jpeg', 0.9);
  };

  // Run AI Diagnostic
  const handleDiagnose = async () => {
    if (!selectedFile) {
      setErrorMessage('Please select or capture a leaf photo first.');
      return;
    }

    setAnalyzing(true);
    setErrorMessage(null);
    setInconclusiveNotice(null);

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      if (selectedCrop && selectedCrop !== 'auto') {
        formData.append('crop', selectedCrop);
      }

      const res = await detectCropDisease(formData);

      if (res.success && res.data?.detection) {
        setDiagnosis(res.data.detection);
        loadScanHistory(); // Refresh recent history
      } else {
        setErrorMessage(res.message || 'Diagnostic screening failed. Please try again.');
      }
    } catch (err) {
      if (err.isConclusive === false) {
        setInconclusiveNotice(err.message || 'The uploaded photo does not contain clear leaf tissue. Please upload a clear photo.');
      } else {
        setErrorMessage(err.message || 'Error communicating with diagnosis server. Please verify backend is running.');
      }
    } finally {
      setAnalyzing(false);
    }
  };

  // Delete history item
  const handleDeleteHistory = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this diagnostic report from history?')) return;

    try {
      const res = await deleteDiseaseRecord(id);
      if (res.success) {
        setHistoryList(prev => prev.filter(item => item._id !== id));
      }
    } catch (err) {
      alert(err.message || 'Failed to delete report');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700">
              Pathology Screening
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            {t('disease.title', 'Crop Disease Detection')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {t('disease.subtitle', 'Identify leaf pathogens, fungal blights, and leaf health with instant AI computer vision diagnosis')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-sm transition"
          >
            <History className="w-4 h-4 text-slate-500" />
            <span>{showHistory ? 'Hide History' : t('common.history', 'Past Scans')}</span>
            {historyList.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-slate-100 text-[10px] font-bold text-slate-600">
                {historyList.length}
              </span>
            )}
          </button>

          <Badge variant="success">
            {t('common.operational', 'Vision Engine Operational')}
          </Badge>
        </div>
      </div>

      {/* Advisory Banner */}
      <AlertBanner
        variant="advisory"
        title={t('common.preliminaryNotice', 'Preliminary Diagnostic Notice')}
        message={t('common.disclaimer', 'Computer vision results are preliminary screening aids and can be influenced by lighting or camera angle. Confirm diagnosis with an agricultural extension officer before applying scheduled chemical fungicides.')}
      />

      {/* Inconclusive Scan Alert */}
      {inconclusiveNotice && (
        <AlertBanner
          variant="warning"
          title="Foliar Screening Inconclusive"
          message={inconclusiveNotice}
        />
      )}

      {/* Error Banner */}
      {errorMessage && (
        <AlertBanner
          variant="danger"
          title="Diagnostic Error"
          message={errorMessage}
        />
      )}

      {/* Past Scans History Drawer */}
      {showHistory && (
        <Card
          title="Farmer's Leaf Scan History"
          subtitle="Your previously analyzed crop pathology diagnostic reports"
          icon={History}
          className="bg-slate-50 border-slate-300"
        >
          {loadingHistory ? (
            <p className="text-xs text-slate-500 py-4 text-center">Loading scan history...</p>
          ) : historyList.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">No past disease scans found. Upload a leaf photo to get started.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {historyList.map((item) => (
                <div
                  key={item._id}
                  onClick={() => setDiagnosis(item.detection)}
                  className="p-3 rounded-xl border border-slate-200 bg-white hover:border-agri-400 hover:shadow-sm cursor-pointer transition flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                        {item.crop || 'Crop'}
                      </span>
                      <h4 className="text-xs font-bold text-slate-800 line-clamp-1">
                        {item.detection?.diseaseName}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Confidence: {(item.detection?.confidenceScore * 100).toFixed(0)}%
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteHistory(item._id, e)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="Delete record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-100 text-[10px] text-slate-400">
                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    <span className={`font-semibold ${item.detection?.isHealthy ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {item.detection?.isHealthy ? 'Healthy' : item.detection?.severity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Main Grid: Upload / Camera on Left, Results on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Input Acquisition Column */}
        <div className="lg:col-span-5 space-y-4">
          <Card
            title="Leaf Photo Acquisition"
            subtitle="Upload leaf photo or capture directly using your device camera"
            icon={ScanSearch}
          >
            
            {/* Crop Selector Filter */}
            <div className="mb-4">
              <label htmlFor="crop-select" className="block text-xs font-bold text-slate-700 mb-1">
                Target Crop Category:
              </label>
              <select
                id="crop-select"
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value)}
                className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-agri-500/20 focus:border-agri-500 transition"
              >
                {CROP_OPTIONS.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            {/* Acquisition Mode Tabs */}
            <div className="flex rounded-xl bg-slate-100 p-1 mb-4">
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition ${
                  activeTab === 'upload' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Upload className="w-4 h-4" />
                <span>Upload Leaf File</span>
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

            {/* Mode 1: File Upload */}
            {activeTab === 'upload' ? (
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-agri-400 transition cursor-pointer bg-slate-50/50">
                <input
                  type="file"
                  id="leaf-upload"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="leaf-upload" className="cursor-pointer space-y-2 block">
                  <div className="w-12 h-12 rounded-2xl bg-agri-50 text-agri-600 mx-auto flex items-center justify-center shadow-inner">
                    <Leaf className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-slate-700">Click to browse or drop leaf photo here</p>
                  <p className="text-[11px] text-slate-400">JPEG, PNG, or WebP up to 10MB</p>
                </label>
              </div>
            ) : (
              /* Mode 2: Live WebRTC Camera */
              <div className="space-y-3">
                {cameraError ? (
                  <div className="border border-rose-200 bg-rose-50 rounded-2xl p-4 text-center space-y-2">
                    <CameraOff className="w-8 h-8 text-rose-500 mx-auto" />
                    <p className="text-xs font-bold text-rose-800">Camera Unavailable</p>
                    <p className="text-[11px] text-rose-600">{cameraError}</p>
                    <Button variant="outline" size="sm" onClick={startCamera} icon={RefreshCw}>
                      Retry Camera
                    </Button>
                  </div>
                ) : (
                  <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-300 aspect-video flex items-center justify-center">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Camera Overlay Grid */}
                    <div className="absolute inset-0 border-2 border-dashed border-white/20 pointer-events-none rounded-2xl m-4 flex items-center justify-center">
                      <span className="text-[10px] text-white/50 bg-black/40 px-2 py-0.5 rounded-full">
                        Position plant leaf inside guide
                      </span>
                    </div>

                    {/* Camera Controls Bar */}
                    <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-3 px-4">
                      <button
                        type="button"
                        onClick={() => setFacingMode(prev => prev === 'environment' ? 'user' : 'environment')}
                        className="p-2.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition shadow-md"
                        title="Flip Camera"
                      >
                        <SwitchCamera className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={capturePhoto}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-lg transition transform active:scale-95"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Snap Photo</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Image Preview & Run Diagnostic Action */}
            {previewUrl && (
              <div className="mt-4 space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">Acquired Leaf Preview:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl(null);
                      setDiagnosis(null);
                      if (activeTab === 'camera') startCamera();
                    }}
                    className="text-[11px] font-semibold text-rose-600 hover:underline"
                  >
                    Clear / Retake
                  </button>
                </div>

                <div className="relative rounded-2xl overflow-hidden border border-slate-200 max-h-56 bg-slate-900 flex items-center justify-center">
                  <img src={previewUrl} alt="Leaf preview" className="object-contain max-h-56 w-full" />
                </div>

                <Button
                  onClick={handleDiagnose}
                  loading={analyzing}
                  icon={Sparkles}
                  className="w-full bg-emerald-700 hover:bg-emerald-800"
                >
                  {analyzing ? 'Scanning Foliar Pathology...' : 'Run Deep Learning Diagnostic'}
                </Button>
              </div>
            )}

            {/* Quick Test Presets */}
            <div className="mt-4 pt-4 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Quick Evaluation Presets (Examiner Testing):
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => loadPresetSample('tomato_blight')}
                  className="p-2 rounded-xl border border-slate-200 bg-white hover:border-agri-400 hover:bg-agri-50/30 text-left transition"
                >
                  <p className="font-bold text-slate-800 text-[11px]">🍅 Tomato Early Blight</p>
                  <p className="text-[10px] text-slate-500">Concentric rings & halo</p>
                </button>
                <button
                  type="button"
                  onClick={() => loadPresetSample('tomato_healthy')}
                  className="p-2 rounded-xl border border-slate-200 bg-white hover:border-agri-400 hover:bg-agri-50/30 text-left transition"
                >
                  <p className="font-bold text-emerald-800 text-[11px]">🍃 Healthy Tomato Leaf</p>
                  <p className="text-[10px] text-slate-500">Uniform chlorophyll green</p>
                </button>
                <button
                  type="button"
                  onClick={() => loadPresetSample('rice_blast')}
                  className="p-2 rounded-xl border border-slate-200 bg-white hover:border-agri-400 hover:bg-agri-50/30 text-left transition"
                >
                  <p className="font-bold text-slate-800 text-[11px]">🌾 Rice Leaf Blast</p>
                  <p className="text-[10px] text-slate-500">Spindle diamond lesion</p>
                </button>
                <button
                  type="button"
                  onClick={() => loadPresetSample('potato_late_blight')}
                  className="p-2 rounded-xl border border-slate-200 bg-white hover:border-agri-400 hover:bg-agri-50/30 text-left transition"
                >
                  <p className="font-bold text-slate-800 text-[11px]">🥔 Potato Late Blight</p>
                  <p className="text-[10px] text-slate-500">Water-soaked blotch</p>
                </button>
                <button
                  type="button"
                  onClick={() => loadPresetSample('cotton_blight')}
                  className="p-2 rounded-xl border border-slate-200 bg-white hover:border-agri-400 hover:bg-agri-50/30 text-left transition"
                >
                  <p className="font-bold text-slate-800 text-[11px]">🌱 Cotton Bacterial Blight</p>
                  <p className="text-[10px] text-slate-500">Angular vein-bound spot</p>
                </button>
                <button
                  type="button"
                  onClick={() => loadPresetSample('groundnut_tikka')}
                  className="p-2 rounded-xl border border-slate-200 bg-white hover:border-agri-400 hover:bg-agri-50/30 text-left transition"
                >
                  <p className="font-bold text-slate-800 text-[11px]">🥜 Groundnut Tikka Spot</p>
                  <p className="text-[10px] text-slate-500">Spots with yellow halos</p>
                </button>
                <button
                  type="button"
                  onClick={() => loadPresetSample('maize_blight')}
                  className="p-2 rounded-xl border border-slate-200 bg-white hover:border-agri-400 hover:bg-agri-50/30 text-left transition"
                >
                  <p className="font-bold text-slate-800 text-[11px]">🌽 Maize Northern Blight</p>
                  <p className="text-[10px] text-slate-500">Cigar-shaped tan lesion</p>
                </button>
                <button
                  type="button"
                  onClick={() => loadPresetSample('chilli_curl')}
                  className="p-2 rounded-xl border border-slate-200 bg-white hover:border-agri-400 hover:bg-agri-50/30 text-left transition"
                >
                  <p className="font-bold text-slate-800 text-[11px]">🌶️ Chilli Leaf Curl</p>
                  <p className="text-[10px] text-slate-500">Puckered leaf margin</p>
                </button>
              </div>
            </div>

          </Card>
        </div>

        {/* Diagnostic Results Column */}
        <div className="lg:col-span-7 space-y-4">
          {diagnosis ? (
            <Card
              title="Pathology Diagnostic Report"
              subtitle={`Visual foliar classification analysis • ${diagnosis.crop || selectedCrop}`}
              className={`border-2 ${
                diagnosis.isHealthy ? 'border-emerald-300 ring-2 ring-emerald-500/10' : 'border-rose-300 ring-2 ring-rose-500/10'
              } animate-in fade-in`}
            >
              <div className="space-y-4 text-xs">
                
                {/* Hero Condition Header Banner */}
                <div className={`p-4 rounded-2xl text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  diagnosis.isHealthy
                    ? 'bg-gradient-to-br from-emerald-600 to-green-700'
                    : 'bg-gradient-to-br from-rose-600 to-red-700'
                }`}>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-white/80">
                        {diagnosis.isHealthy ? 'Clean Condition' : 'Identified Pathology'}
                      </span>
                      <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-white/20">
                        {diagnosis.severity}
                      </span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-black mt-1">
                      {diagnosis.diseaseName}
                    </h3>
                    {diagnosis.scientificName && (
                      <p className="text-xs text-white/80 italic font-medium mt-0.5">
                        Pathogen: {diagnosis.scientificName}
                      </p>
                    )}
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 border-white/20 pt-2 sm:pt-0">
                    <span className="text-[10px] text-white/80">Model Confidence</span>
                    <span className="text-2xl font-black">
                      {(diagnosis.confidenceScore * 100).toFixed(0)}%
                    </span>
                    {!diagnosis.isHealthy && (
                      <span className="text-[11px] text-white/90 font-medium">
                        Affected Area: {diagnosis.affectedAreaPercentage}%
                      </span>
                    )}
                  </div>
                </div>

                {/* Confidence Bar */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                  <div className="flex justify-between items-center text-[11px] font-semibold text-slate-700">
                    <span>Diagnostic Certainty Index</span>
                    <span className="font-bold">{(diagnosis.confidenceScore * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        diagnosis.isHealthy ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${diagnosis.confidenceScore * 100}%` }}
                    />
                  </div>
                </div>

                {/* Crop Consistency & Field Scouting Advisory */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div className="text-[11px] text-slate-600 leading-relaxed">
                    <span className="font-bold text-slate-800">Crop Consistency Notice: </span>
                    Screened against the <span className="font-bold text-emerald-700">{diagnosis.crop || selectedCrop}</span> foliar pathology baseline. Computer vision models classify lesion morphology, chlorosis, and necrosis; always verify that the physical field plant matches the selected crop category before applying chemical fungicides.
                  </div>
                </div>

                {/* Primary Field Symptoms */}
                {diagnosis.symptoms?.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-slate-800">
                      <AlertCircle className="w-4 h-4 text-slate-600" />
                      <span>Primary Field Symptoms:</span>
                    </div>
                    <ul className="list-disc list-inside text-slate-600 space-y-1 bg-slate-50 p-3.5 rounded-xl border border-slate-100 leading-relaxed">
                      {diagnosis.symptoms.map((s, idx) => <li key={idx}>{s}</li>)}
                    </ul>
                  </div>
                )}

                {/* Pathological Causes & Triggers */}
                {diagnosis.causes?.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-slate-800">
                      <Activity className="w-4 h-4 text-amber-600" />
                      <span>Pathological Causes & Environmental Triggers:</span>
                    </div>
                    <ul className="list-disc list-inside text-slate-600 space-y-1 bg-amber-50/50 p-3.5 rounded-xl border border-amber-100/70 leading-relaxed">
                      {diagnosis.causes.map((c, idx) => <li key={idx}>{c}</li>)}
                    </ul>
                  </div>
                )}

                {/* Prevention Methods & Cultural Practices */}
                {diagnosis.prevention?.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Recommended Prevention & Cultural Practices:</span>
                    </div>
                    <ul className="list-disc list-inside text-slate-600 space-y-1 bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-100 leading-relaxed">
                      {diagnosis.prevention.map((p, idx) => <li key={idx}>{p}</li>)}
                    </ul>
                  </div>
                )}

                {/* Curative Treatment & Approved Fungicide Dosages */}
                {diagnosis.treatment?.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-rose-800">
                      <ShieldAlert className="w-4 h-4 text-rose-600" />
                      <span>Approved Treatment & Management Guidance:</span>
                    </div>
                    <ul className="list-disc list-inside text-slate-700 space-y-1 bg-rose-50/50 p-3.5 rounded-xl border border-rose-100 leading-relaxed font-medium">
                      {diagnosis.treatment.map((t, idx) => <li key={idx}>{t}</li>)}
                    </ul>
                  </div>
                )}

                {/* Print Report / Action buttons */}
                <div className="pt-2 flex items-center justify-between">
                  <p className="text-[11px] text-slate-400 italic">
                    Saved to farmer history automatically
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrint}
                    icon={Printer}
                  >
                    Print Diagnostic Card
                  </Button>
                </div>

              </div>
            </Card>
          ) : (
            <Card className="text-center py-16 px-6 flex flex-col items-center justify-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 shadow-sm">
                <ScanSearch className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-slate-800 text-base">Awaiting Foliar Leaf Inspection</h3>
              <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                Upload a plant leaf photo or snap a picture using your device camera to detect fungal blights, bacterial spots, and nutrient abnormalities instantly.
              </p>
              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadPresetSample('tomato_blight')}
                  icon={Sparkles}
                >
                  Try Sample Leaf Preset
                </Button>
              </div>
            </Card>
          )}
        </div>

      </div>

    </div>
  );
}
