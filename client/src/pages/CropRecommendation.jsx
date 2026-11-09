import React, { useState, useEffect } from 'react';
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
  Check,
  ArrowRight,
  MapPin,
  Compass,
  Search,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Save,
  PieChart,
  ShieldAlert,
  Loader2,
  Scale
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import AlertBanner from '../components/common/AlertBanner';
import { useAuth } from '../context/AuthContext';
import { getRecommendedCrop, saveCropLandAllocation } from '../services/cropService';
import { searchWeatherLocations, fetchWeather } from '../services/weatherService';

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

// District presets for 1-click farmer testing
const DISTRICT_PRESETS = [
  { name: 'Warangal', state: 'Telangana', latitude: 17.9689, longitude: 79.5941 },
  { name: 'Guntur', state: 'Andhra Pradesh', latitude: 16.3067, longitude: 80.4365 },
  { name: 'Pune', state: 'Maharashtra', latitude: 18.5204, longitude: 73.8567 },
  { name: 'Indore', state: 'Madhya Pradesh', latitude: 22.7196, longitude: 75.8577 },
  { name: 'Ludhiana', state: 'Punjab', latitude: 30.9010, longitude: 75.8573 },
  { name: 'Coimbatore', state: 'Tamil Nadu', latitude: 11.0168, longitude: 76.9558 }
];

export default function CropRecommendation() {
  const { t } = useTranslation();
  const { user } = useAuth();

  // Location State
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locationSearchQuery, setLocationSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchingLocation, setSearchingLocation] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [locationNotice, setLocationNotice] = useState(null);

  // Weather Telemetry State (fetched via Open-Meteo)
  const [weatherTelemetry, setWeatherTelemetry] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [weatherError, setWeatherError] = useState(null);

  // Required Field Inputs
  const [soilType, setSoilType] = useState('Black Cotton Soil');
  const [season, setSeason] = useState('Kharif (Monsoon: Jun - Oct)');
  const [landArea, setLandArea] = useState(4);

  // Collapsible Optional Soil Health Card Inputs (pH and NPK)
  const [showOptionalSoil, setShowOptionalSoil] = useState(false);
  const [ph, setPh] = useState('');
  const [nitrogen, setNitrogen] = useState('');
  const [phosphorus, setPhosphorus] = useState('');
  const [potassium, setPotassium] = useState('');

  // Results & Land Allocation State
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedCropKeys, setSelectedCropKeys] = useState({});
  const [customAllocations, setCustomAllocations] = useState({});
  const [allocationSaving, setAllocationSaving] = useState(false);
  const [allocationSuccess, setAllocationSuccess] = useState(null);
  const [allocationError, setAllocationError] = useState(null);

  // Auto-synchronize location from authenticated farmer profile on mount
  useEffect(() => {
    if (user?.location?.district || user?.location?.city) {
      const locName = user.location.city || user.location.district;
      const initialLoc = {
        name: locName,
        district: user.location.district || locName,
        state: user.location.state || '',
        country: 'India'
      };
      setSelectedLocation(initialLoc);
      fetchLocationWeather(initialLoc);
    }
  }, [user]);

  // Debounced location search autocomplete
  useEffect(() => {
    if (!locationSearchQuery || locationSearchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearchingLocation(true);
      try {
        const res = await searchWeatherLocations(locationSearchQuery.trim());
        if (res.success && Array.isArray(res.data)) {
          setSearchResults(res.data);
        }
      } catch (err) {
        console.warn('Location search error:', err);
      } finally {
        setSearchingLocation(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [locationSearchQuery]);

  // Fetch Open-Meteo weather when location or season changes
  const fetchLocationWeather = async (loc) => {
    if (!loc) return;
    setLoadingWeather(true);
    setWeatherError(null);

    try {
      const params = {};
      if (loc.latitude != null && loc.longitude != null) {
        params.latitude = loc.latitude;
        params.longitude = loc.longitude;
      } else if (loc.name) {
        params.city = loc.name;
      }

      const res = await fetchWeather(params);
      if (res.success && res.data) {
        setWeatherTelemetry({
          ...res.data,
          locationName: loc.name || res.data.location?.name,
          district: loc.district || res.data.location?.district,
          state: loc.state || res.data.location?.state
        });
      } else {
        throw new Error(res.message || 'Unable to retrieve meteorological data.');
      }
    } catch (err) {
      setWeatherError(err.message || 'Weather telemetry is unavailable for this location. Please check internet connection or select a nearby district.');
      setWeatherTelemetry(null);
    } finally {
      setLoadingWeather(false);
    }
  };

  // Handle GPS location permission
  const handleRequestGps = () => {
    if (!navigator.geolocation) {
      setLocationNotice({ type: 'warning', text: 'Browser geolocation is not supported on this device.' });
      return;
    }

    setGpsLoading(true);
    setLocationNotice(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          name: 'Your GPS Coordinates',
          district: 'Local Farmland',
          state: '',
          latitude: Number(pos.coords.latitude.toFixed(4)),
          longitude: Number(pos.coords.longitude.toFixed(4))
        };
        setSelectedLocation(coords);
        setLocationSearchQuery('');
        setSearchResults([]);
        fetchLocationWeather(coords);
        setGpsLoading(false);
        setLocationNotice({ type: 'success', text: `GPS coordinates acquired: ${coords.latitude}°, ${coords.longitude}°` });
      },
      (err) => {
        setGpsLoading(false);
        let msg = 'Could not access device location.';
        if (err.code === 1) {
          msg = 'Location permission was denied. You can manually enter or select your district below.';
        } else if (err.code === 2) {
          msg = 'Location coordinates unavailable. Please choose your district manually.';
        }
        setLocationNotice({ type: 'warning', text: msg });
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Handle Location Selection
  const handleSelectLocation = (loc) => {
    setSelectedLocation(loc);
    setLocationSearchQuery('');
    setSearchResults([]);
    setLocationNotice(null);
    fetchLocationWeather(loc);
  };

  // Handle Recommendation Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setAllocationSuccess(null);
    setAllocationError(null);

    if (!selectedLocation) {
      setErrorMessage('Please select your farm location (via Profile, GPS, or District search) to retrieve local weather data.');
      return;
    }

    if (!landArea || Number(landArea) <= 0) {
      setErrorMessage('Please provide a valid land area in acres.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        soilType,
        season,
        landArea: Number(landArea),
        location: {
          name: selectedLocation.name,
          district: selectedLocation.district,
          state: selectedLocation.state,
          latitude: selectedLocation.latitude,
          longitude: selectedLocation.longitude
        }
      };

      // Include optional soil health card data if provided (no zero substitution)
      if (ph !== '' && !isNaN(Number(ph))) {
        payload.ph = Number(ph);
      }
      if (nitrogen !== '' && !isNaN(Number(nitrogen))) {
        payload.nitrogen = Number(nitrogen);
      }
      if (phosphorus !== '' && !isNaN(Number(phosphorus))) {
        payload.phosphorus = Number(phosphorus);
      }
      if (potassium !== '' && !isNaN(Number(potassium))) {
        payload.potassium = Number(potassium);
      }

      const response = await getRecommendedCrop(payload);

      if (response.success && response.data) {
        setResult(response.data);
        
        // Initialize land allocation states (default to unallocated for farmer freedom)
        const initialSelections = {};
        const initialAlloc = {};
        if (Array.isArray(response.data.suitableCrops)) {
          response.data.suitableCrops.forEach((crop, idx) => {
            // Check top crop by default
            if (idx === 0) {
              initialSelections[crop.cropName] = true;
              initialAlloc[crop.cropName] = Number(landArea);
            } else {
              initialSelections[crop.cropName] = false;
              initialAlloc[crop.cropName] = 0;
            }
          });
        }
        setSelectedCropKeys(initialSelections);
        setCustomAllocations(initialAlloc);
      } else {
        throw new Error(response.message || 'Crop prediction could not be computed.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to generate crop recommendations. Please check weather service connection.');
    } finally {
      setLoading(false);
    }
  };

  // Toggle crop selection in land division tool
  const handleToggleCropSelect = (cropName) => {
    setSelectedCropKeys((prev) => {
      const updated = { ...prev, [cropName]: !prev[cropName] };
      // If unchecked, set allocation to 0
      if (!updated[cropName]) {
        setCustomAllocations(c => ({ ...c, [cropName]: 0 }));
      }
      return updated;
    });
  };

  // Handle acreage allocation input
  const handleAcreageChange = (cropName, val) => {
    const num = val === '' ? '' : Math.max(0, Number(val));
    setCustomAllocations((prev) => ({
      ...prev,
      [cropName]: num
    }));
    setAllocationError(null);
    setAllocationSuccess(null);
  };

  // Calculate total allocated acres
  const totalAllocatedAcres = Object.entries(customAllocations).reduce((sum, [cropName, acres]) => {
    if (selectedCropKeys[cropName]) {
      return sum + (Number(acres) || 0);
    }
    return sum;
  }, 0);

  const availableAcres = Number(landArea) || 0;
  const isOverAllocated = totalAllocatedAcres > availableAcres + 0.001;
  const remainingAcres = Math.max(0, Number((availableAcres - totalAllocatedAcres).toFixed(2)));

  // Save Land Allocation to Backend
  const handleSaveAllocation = async () => {
    if (!result?.id) {
      setAllocationError('Recommendation session ID not found. Please re-run recommendation.');
      return;
    }

    if (isOverAllocated) {
      setAllocationError(`Allocated land (${totalAllocatedAcres.toFixed(1)} acres) exceeds your available land (${availableAcres.toFixed(1)} acres).`);
      return;
    }

    const allocatedList = Object.entries(customAllocations)
      .filter(([cropName, acres]) => selectedCropKeys[cropName] && Number(acres) > 0)
      .map(([cropName, acres]) => ({
        cropName,
        acres: Number(acres)
      }));

    if (allocatedList.length === 0) {
      setAllocationError('Please select at least one crop and enter allocated acres.');
      return;
    }

    setAllocationSaving(true);
    setAllocationError(null);
    setAllocationSuccess(null);

    try {
      const res = await saveCropLandAllocation(result.id, {
        landArea: availableAcres,
        allocatedLand: allocatedList
      });

      if (res.success) {
        setAllocationSuccess('Land allocation saved to your farming plan successfully!');
      } else {
        throw new Error(res.message || 'Failed to save allocation.');
      }
    } catch (err) {
      setAllocationError(err.message || 'Could not persist land allocation.');
    } finally {
      setAllocationSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-8">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#246B45]">
              Intelligent Advisory Engine
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#123D2A] tracking-tight mt-0.5">
            {t('crop.title', 'Crop Recommendation & Land Planning')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-700 font-medium mt-0.5">
            {t('crop.subtitle', 'Predict multiple viable crops tailored to your soil, seasonal climate, and local Open-Meteo weather telemetry.')}
          </p>
        </div>

        <Badge variant="forest">
          Open-Meteo Weather Synced
        </Badge>
      </div>

      {/* Advisory Banner */}
      <AlertBanner
        variant="disclaimer"
        title="Agronomic Advisory Notice"
        message="Recommendations evaluate multi-crop suitability based on verified ICAR agronomy and regional Open-Meteo climate models. You maintain complete control over which crops to plant and how to divide your land."
      />

      {/* 1. Location Selector Card */}
      <Card
        title="1. Farm Geographic Location"
        subtitle="Automatic Open-Meteo weather retrieval based on your district or device GPS"
        icon={MapPin}
      >
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            
            {/* GPS Location Button */}
            <button
              type="button"
              onClick={handleRequestGps}
              disabled={gpsLoading}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-[#F7F7F0] text-slate-800 text-xs font-bold shadow-xs transition cursor-pointer disabled:opacity-50"
            >
              {gpsLoading ? (
                <Loader2 className="w-4 h-4 text-[#246B45] animate-spin" />
              ) : (
                <Compass className="w-4 h-4 text-[#246B45]" />
              )}
              <span>{gpsLoading ? 'Acquiring GPS...' : 'Use Device GPS'}</span>
            </button>

            {/* Profile Location Sync Button */}
            {user?.location?.district && (
              <button
                type="button"
                onClick={() => {
                  const loc = {
                    name: user.location.city || user.location.district,
                    district: user.location.district,
                    state: user.location.state || '',
                    country: 'India'
                  };
                  handleSelectLocation(loc);
                }}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[#246B45]/30 bg-[#123D2A]/10 text-[#123D2A] hover:bg-[#123D2A]/15 text-xs font-bold shadow-xs transition cursor-pointer"
              >
                <MapPin className="w-4 h-4 text-[#246B45]" />
                <span>Profile: {user.location.district}</span>
              </button>
            )}

            {/* Autocomplete Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={locationSearchQuery}
                onChange={(e) => setLocationSearchQuery(e.target.value)}
                placeholder="Search district or village (e.g. Warangal, Guntur, Pune)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-[#123D2A] focus:ring-1 focus:ring-[#123D2A] text-xs sm:text-sm text-slate-900 font-medium outline-none transition bg-white"
              />

              {/* Autocomplete Dropdown */}
              {searchResults.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-2xl border border-slate-200 shadow-xl max-h-56 overflow-y-auto z-30 divide-y divide-slate-100">
                  {searchResults.map((loc, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectLocation(loc)}
                      className="w-full px-4 py-2.5 text-left text-xs hover:bg-[#F7F7F0] flex items-center justify-between text-slate-800 font-semibold cursor-pointer transition"
                    >
                      <span className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-[#246B45]" />
                        <span>{loc.name} {loc.district ? `(${loc.district})` : ''}</span>
                      </span>
                      <span className="text-[11px] text-slate-500 font-normal">{loc.state || loc.country}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Location status notice */}
          {locationNotice && (
            <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              locationNotice.type === 'success' 
                ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' 
                : 'bg-amber-50 text-amber-900 border border-amber-200'
            }`}>
              <Info className="w-4 h-4 shrink-0" />
              <span>{locationNotice.text}</span>
            </div>
          )}

          {/* Quick Preset Districts */}
          <div className="flex flex-wrap items-center gap-2 text-xs pt-1">
            <span className="text-slate-600 font-bold flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#246B45]" />
              <span>Quick Test Districts:</span>
            </span>
            {DISTRICT_PRESETS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectLocation(p)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                  selectedLocation?.name === p.name
                    ? 'bg-[#123D2A] text-white border-[#123D2A]'
                    : 'bg-[#F7F7F0] text-slate-800 border-slate-300 hover:bg-[#123D2A]/10'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>

          {/* Active Selected Location Display */}
          {selectedLocation && (
            <div className="p-3 bg-[#F7F7F0] rounded-2xl border border-slate-300 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#123D2A] text-white flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-[#B6D957]" />
                </div>
                <div>
                  <span className="font-extrabold text-[#123D2A] text-sm">
                    {selectedLocation.name} {selectedLocation.district ? `• ${selectedLocation.district}` : ''}
                  </span>
                  <span className="text-[11px] text-slate-600 block">
                    {selectedLocation.state ? `${selectedLocation.state}, India` : 'Coordinates active'}
                  </span>
                </div>
              </div>

              <Badge variant="forest">
                Location Active
              </Badge>
            </div>
          )}

        </div>
      </Card>

      {/* 2. Real-Time Weather & Seasonal Climate Telemetry Card */}
      <Card
        title="2. Meteorological Telemetry (Open-Meteo Integration)"
        subtitle="Automatic climate observations retrieved for your selected location"
        icon={CloudRain}
      >
        {loadingWeather ? (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-2">
            <Loader2 className="w-6 h-6 text-[#246B45] animate-spin" />
            <p className="text-xs text-slate-600 font-medium">Querying Open-Meteo forecast and seasonal historical archive...</p>
          </div>
        ) : weatherError ? (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-amber-950">Meteorological Telemetry Notice</span>
              <p className="mt-0.5 text-amber-800">{weatherError}</p>
            </div>
          </div>
        ) : weatherTelemetry ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              
              {/* Temperature */}
              <div className="p-3.5 bg-gradient-to-br from-rose-50 to-orange-50/50 rounded-2xl border border-rose-200 text-center">
                <Thermometer className="w-4 h-4 text-rose-600 mx-auto mb-1" />
                <span className="text-[10px] text-slate-600 font-bold uppercase block">Current Temp</span>
                <span className="text-lg font-black text-slate-900 block mt-0.5">
                  {weatherTelemetry.current?.temperature ?? weatherTelemetry.temperature}°C
                </span>
                <span className="text-[10px] text-slate-600 font-medium">Ambient condition</span>
              </div>

              {/* Humidity */}
              <div className="p-3.5 bg-gradient-to-br from-sky-50 to-blue-50/50 rounded-2xl border border-sky-200 text-center">
                <Droplets className="w-4 h-4 text-sky-600 mx-auto mb-1" />
                <span className="text-[10px] text-slate-600 font-bold uppercase block">Relative Humidity</span>
                <span className="text-lg font-black text-slate-900 block mt-0.5">
                  {weatherTelemetry.current?.humidity ?? weatherTelemetry.humidity}%
                </span>
                <span className="text-[10px] text-slate-600 font-medium">Atmospheric moisture</span>
              </div>

              {/* Weather Condition */}
              <div className="p-3.5 bg-gradient-to-br from-emerald-50 to-teal-50/50 rounded-2xl border border-emerald-200 text-center">
                <CloudRain className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                <span className="text-[10px] text-slate-600 font-bold uppercase block">Weather Condition</span>
                <span className="text-sm font-extrabold text-[#123D2A] block mt-1 truncate">
                  {weatherTelemetry.current?.condition || 'Fair Weather'}
                </span>
                <span className="text-[10px] text-slate-600 font-medium">Open-Meteo WMO</span>
              </div>

              {/* Seasonal Precipitation */}
              <div className="p-3.5 bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-2xl border border-blue-200 text-center">
                <Gauge className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                <span className="text-[10px] text-slate-600 font-bold uppercase block">Seasonal Rainfall Norm</span>
                <span className="text-lg font-black text-slate-900 block mt-0.5">
                  {weatherTelemetry.current?.precipitation || weatherTelemetry.rainfall || 'Auto-Evaluated'}
                </span>
                <span className="text-[10px] text-slate-600 font-medium">Historical baseline</span>
              </div>

            </div>

            <div className="p-2.5 bg-[#F7F7F0] rounded-xl border border-slate-300 text-[11px] text-slate-700 flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-medium">
                <Info className="w-3.5 h-3.5 text-[#246B45]" />
                <span>Source: <strong>Open-Meteo Global Meteorological Models</strong> (Real-time & Archive)</span>
              </span>
              <button
                type="button"
                onClick={() => fetchLocationWeather(selectedLocation)}
                className="text-[11px] font-bold text-[#123D2A] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-slate-600">
            <p>Please select your farm location above to fetch meteorological telemetry.</p>
          </div>
        )}
      </Card>

      {/* Main Grid: Form on Left, Recommendations on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Form Column */}
        <div className="lg:col-span-5 space-y-4">
          <Card
            title="3. Field & Agronomic Parameters"
            subtitle="Provide your soil profile, cropping season, and available land area"
            icon={Sprout}
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Soil Type */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#246B45]" />
                  <span>Soil Type *</span>
                </label>
                <select
                  value={soilType}
                  onChange={(e) => setSoilType(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#123D2A] focus:ring-1 focus:ring-[#123D2A] text-xs sm:text-sm bg-white text-slate-900 font-medium outline-none transition"
                >
                  {SOIL_TYPES.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              {/* Cropping Season */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#246B45]" />
                  <span>Cropping Season *</span>
                </label>
                <select
                  value={season}
                  onChange={(e) => setSeason(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#123D2A] focus:ring-1 focus:ring-[#123D2A] text-xs sm:text-sm bg-white text-slate-900 font-medium outline-none transition"
                >
                  {SEASONS.map((sn) => (
                    <option key={sn} value={sn}>{sn}</option>
                  ))}
                </select>
              </div>

              {/* Available Land Area (in Acres) */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5 text-[#246B45]" />
                    <span>Total Available Land Area (Acres) *</span>
                  </span>
                  <span className="text-xs font-extrabold text-[#123D2A]">{landArea} Acre(s)</span>
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0.1"
                  max="1000"
                  value={landArea}
                  onChange={(e) => setLandArea(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#123D2A] focus:ring-1 focus:ring-[#123D2A] text-xs sm:text-sm text-slate-900 font-semibold outline-none transition bg-white"
                />
              </div>

              {/* Collapsible Optional Soil Health Card Parameters */}
              <div className="pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowOptionalSoil(!showOptionalSoil)}
                  className="w-full py-2 px-3 rounded-xl bg-[#F7F7F0] hover:bg-slate-200/70 border border-slate-300 flex items-center justify-between text-xs font-bold text-slate-800 transition cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <Gauge className="w-3.5 h-3.5 text-[#246B45]" />
                    <span>Optional: Soil Health Card Test Values (pH & NPK)</span>
                  </span>
                  {showOptionalSoil ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showOptionalSoil && (
                  <div className="mt-3 p-3.5 rounded-2xl bg-[#F7FAF7] border border-slate-300 space-y-3 text-xs animate-in fade-in">
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      If you do not have a recent Soil Health Card lab report, leave these blank. The recommendation engine evaluates suitability using environmental tolerance curves without fabricating values.
                    </p>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Soil pH Level (3.0 - 10.0) [Optional]
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="3.0"
                        max="10.0"
                        value={ph}
                        onChange={(e) => setPh(e.target.value)}
                        placeholder="e.g. 6.8 (Leave blank if unknown)"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 outline-none transition bg-white"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-blue-900 mb-1">
                          Nitrogen (kg/ac)
                        </label>
                        <input
                          type="number"
                          value={nitrogen}
                          onChange={(e) => setNitrogen(e.target.value)}
                          placeholder="Optional"
                          className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs text-slate-900 outline-none bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-amber-900 mb-1">
                          Phosphorus (kg/ac)
                        </label>
                        <input
                          type="number"
                          value={phosphorus}
                          onChange={(e) => setPhosphorus(e.target.value)}
                          placeholder="Optional"
                          className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs text-slate-900 outline-none bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-emerald-900 mb-1">
                          Potassium (kg/ac)
                        </label>
                        <input
                          type="number"
                          value={potassium}
                          onChange={(e) => setPotassium(e.target.value)}
                          placeholder="Optional"
                          className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs text-slate-900 outline-none bg-white"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="pt-2">
                <Button
                  type="submit"
                  loading={loading}
                  icon={Sparkles}
                  className="w-full !bg-[#123D2A] hover:!bg-[#1D5939] text-white shadow-premium"
                >
                  {loading ? 'Evaluating Crop Suitability...' : 'Find Multiple Suitable Crops'}
                </Button>
              </div>

            </form>
          </Card>
        </div>

        {/* Results & Multi-Crop Selection Column */}
        <div className="lg:col-span-7 space-y-4">
          {result ? (
            <div className="space-y-4 animate-in fade-in">
              
              {/* Header Banner */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-[#123D2A] to-[#1A4D35] text-white shadow-premium flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-emerald-200 font-bold block">
                    Agro-Climatic Recommendation Report
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black mt-0.5 tracking-tight text-white">
                    {result.suitableCrops?.length || 1} Suitable Crop Options Identified
                  </h2>
                  <p className="text-xs text-emerald-100 font-medium mt-1">
                    Evaluated for {result.evaluatedParameters?.soilType} during {result.evaluatedParameters?.season?.split(' ')[0]}
                  </p>
                </div>

                <div className="bg-white/10 px-3.5 py-2 rounded-xl border border-white/20 text-right shrink-0">
                  <span className="text-[10px] uppercase text-emerald-200 block font-bold">Top Match</span>
                  <span className="text-xl font-extrabold text-[#B6D957]">
                    {result.cropName} ({(result.confidenceScore * 100).toFixed(0)}%)
                  </span>
                </div>
              </div>

              {/* Weather Values Used in Recommendation (Requirement 8) */}
              <div className="p-4 rounded-2xl bg-[#F7F7F0] border border-slate-300 space-y-2 text-xs">
                <span className="font-extrabold text-[#123D2A] flex items-center gap-1.5">
                  <CloudRain className="w-4 h-4 text-[#246B45]" />
                  <span>Weather Values Used in This Recommendation:</span>
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  <div className="p-2 bg-white rounded-xl border border-slate-200">
                    <span className="text-slate-500 block text-[10px]">Temperature</span>
                    <span className="font-bold text-slate-900">{result.weatherTelemetry?.temperature ?? result.evaluatedParameters?.temperature}°C</span>
                  </div>
                  <div className="p-2 bg-white rounded-xl border border-slate-200">
                    <span className="text-slate-500 block text-[10px]">Humidity</span>
                    <span className="font-bold text-slate-900">{result.weatherTelemetry?.humidity ?? result.evaluatedParameters?.humidity}%</span>
                  </div>
                  <div className="p-2 bg-white rounded-xl border border-slate-200">
                    <span className="text-slate-500 block text-[10px]">Seasonal Rainfall</span>
                    <span className="font-bold text-slate-900">{result.weatherTelemetry?.seasonalCumulativeRainfall ? `${result.weatherTelemetry.seasonalCumulativeRainfall} mm` : 'Model Norm'}</span>
                  </div>
                  <div className="p-2 bg-white rounded-xl border border-slate-200">
                    <span className="text-slate-500 block text-[10px]">Model Equiv. Rain</span>
                    <span className="font-bold text-slate-900">{result.evaluatedParameters?.rainfall} mm/mo</span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 italic">
                  Data retrieved via: {result.weatherTelemetry?.dataSource || 'Open-Meteo Global Meteorological API'}
                </p>
              </div>

              {/* Multiple Suitable Crop Cards (Requirement 7) */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Recommended Crops (Select and allocate land as desired):
                </span>

                {result.suitableCrops?.map((crop, idx) => {
                  const isSelected = Boolean(selectedCropKeys[crop.cropName]);
                  const currentAlloc = customAllocations[crop.cropName] ?? 0;

                  return (
                    <div
                      key={idx}
                      className={`p-4 rounded-2xl border transition-all ${
                        isSelected 
                          ? 'bg-white border-[#246B45] ring-2 ring-[#246B45]/20 shadow-sm' 
                          : 'bg-white/80 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                          {/* Selection Checkbox */}
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleCropSelect(crop.cropName)}
                            className="w-4 h-4 text-[#123D2A] rounded border-slate-300 focus:ring-[#123D2A] cursor-pointer"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-base font-extrabold text-[#123D2A]">
                                #{crop.rank} {crop.cropName}
                              </h3>
                              {crop.isPrimary && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#123D2A] text-white">
                                  Primary Pick
                                </span>
                              )}
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                crop.waterDemand?.level === 'Low'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : crop.waterDemand?.level === 'Moderate'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                {crop.waterDemand?.level} Water
                              </span>
                            </div>
                            <span className="text-xs text-slate-600 font-medium block mt-0.5">
                              {crop.waterDemand?.description}
                            </span>
                          </div>
                        </div>

                        {/* Confidence Score */}
                        <div className="text-right">
                          <span className="text-[10px] text-slate-500 uppercase font-bold block">Model Score</span>
                          <span className="text-lg font-black text-[#246B45]">
                            {crop.confidencePercentage}%
                          </span>
                        </div>
                      </div>

                      {/* Suitability Explanation & Guidance */}
                      <div className="py-3 space-y-2 text-xs">
                        <p className="text-slate-800 font-medium leading-relaxed bg-[#F7F7F0] p-3 rounded-xl border border-slate-200">
                          <strong>Suitability: </strong>{crop.suitabilityExplanation}
                        </p>
                        <p className="text-slate-700 leading-relaxed pl-1">
                          <strong>Cultivation Guide: </strong>{crop.cultivationGuide}
                        </p>
                      </div>

                      {/* Acreage Allocation Input if Selected */}
                      {isSelected && (
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs animate-in fade-in">
                          <span className="font-bold text-[#123D2A]">
                            Allocate Land for {crop.cropName}:
                          </span>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              step="0.5"
                              min="0"
                              max={landArea}
                              value={currentAlloc}
                              onChange={(e) => handleAcreageChange(crop.cropName, e.target.value)}
                              className="w-24 px-2.5 py-1.5 rounded-xl border border-slate-300 focus:border-[#123D2A] text-xs font-bold text-slate-900 text-right outline-none bg-white"
                            />
                            <span className="font-bold text-slate-600">Acres</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* 4. Farmer-Controlled Land Allocation Interface (Requirements 8, 9, 10) */}
              <Card
                title="4. Farmer-Controlled Land Division"
                subtitle="Decide how to divide your available land across your selected crops"
                icon={PieChart}
                className="border-[#246B45]/40"
              >
                <div className="space-y-4 text-xs">
                  
                  {/* Allocation Status Bar */}
                  <div className="p-3.5 rounded-2xl bg-[#F7F7F0] border border-slate-300 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-800">
                        Allocated: <strong className={isOverAllocated ? 'text-rose-600' : 'text-[#123D2A]'}>{totalAllocatedAcres.toFixed(1)}</strong> / {availableAcres.toFixed(1)} Acres
                      </span>
                      <span className={isOverAllocated ? 'text-rose-600 font-extrabold' : 'text-slate-600'}>
                        {isOverAllocated ? `Exceeded by ${(totalAllocatedAcres - availableAcres).toFixed(1)} Acres!` : `Remaining: ${remainingAcres} Acres`}
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          isOverAllocated ? 'bg-rose-500' : 'bg-[#246B45]'
                        }`}
                        style={{ width: `${Math.min(100, (totalAllocatedAcres / Math.max(1, availableAcres)) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {allocationError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{allocationError}</span>
                    </div>
                  )}

                  {allocationSuccess && (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{allocationSuccess}</span>
                    </div>
                  )}

                  {/* Save Allocation Action */}
                  <div className="pt-2 flex items-center justify-between">
                    <p className="text-[11px] text-slate-500 italic">
                      You can modify land splits anytime without automatic locking.
                    </p>
                    <Button
                      type="button"
                      onClick={handleSaveAllocation}
                      loading={allocationSaving}
                      disabled={isOverAllocated || totalAllocatedAcres === 0}
                      icon={Save}
                      size="sm"
                    >
                      {allocationSaving ? 'Saving Plan...' : 'Save Land Allocation'}
                    </Button>
                  </div>

                </div>
              </Card>

            </div>
          ) : (
            <Card className="text-center py-16 px-6 flex flex-col items-center justify-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-[#F7F7F0] text-[#123D2A] flex items-center justify-center border border-[#D7DBC5] shadow-sm">
                <Sprout className="w-8 h-8 text-[#246B45]" />
              </div>
              <h3 className="font-extrabold text-[#123D2A] text-base">Awaiting Parameters & Weather Telemetry</h3>
              <p className="text-xs text-slate-700 font-medium max-w-sm leading-relaxed">
                Select your farm location to automatically retrieve Open-Meteo climate data, choose your soil and season, and click "Find Multiple Suitable Crops".
              </p>
            </Card>
          )}
        </div>

      </div>

    </div>
  );
}
