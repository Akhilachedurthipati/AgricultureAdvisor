import React, { useState, useEffect } from 'react';
import { 
  CloudSun, 
  MapPin, 
  Thermometer, 
  Droplets, 
  Wind, 
  CloudRain, 
  AlertTriangle, 
  Search,
  Sun,
  CloudLightning,
  Cloud,
  CloudDrizzle,
  CloudSnow,
  CloudFog,
  Compass,
  RefreshCw,
  LocateFixed,
  ShieldAlert,
  CheckCircle2,
  Calendar,
  Sparkles,
  Info,
  Clock,
  Gauge
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import AlertBanner from '../components/common/AlertBanner';
import StatCard from '../components/common/StatCard';
import { useAuth } from '../context/AuthContext';
import { fetchWeather, searchWeatherLocations } from '../services/weatherService';

export default function WeatherMonitoring() {
  const { user } = useAuth();
  const defaultCity = user?.location?.city || user?.location?.district || 'Guntur';

  const [cityInput, setCityInput] = useState(defaultCity);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [locating, setLocating] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Quick evaluation presets for examiner & farmer rapid testing
  const PRESET_LOCATIONS = [
    { label: 'Guntur (AP)', city: 'Guntur' },
    { label: 'Karimnagar (TS)', city: 'Karimnagar' },
    { label: 'Pune (MH)', city: 'Pune' },
    { label: 'Ludhiana (PB)', city: 'Ludhiana' },
    { label: 'Anand (GJ)', city: 'Anand' }
  ];

  // Load weather on mount
  useEffect(() => {
    loadWeather({ city: defaultCity });
  }, []);

  // Handle Autocomplete Input Debounce
  useEffect(() => {
    if (!cityInput || cityInput.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await searchWeatherLocations(cityInput.trim());
        if (res.success && Array.isArray(res.data)) {
          setSuggestions(res.data);
        }
      } catch {
        setSuggestions([]);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [cityInput]);

  const loadWeather = async (params) => {
    setLoading(true);
    setErrorMessage(null);
    setShowSuggestions(false);

    try {
      const res = await fetchWeather(params);
      if (res.success && res.data) {
        setWeatherData(res.data);
        setCurrentLocation(res.data.location);
        if (res.data.location?.name) {
          setCityInput(res.data.location.name);
        }
      } else {
        setErrorMessage(res.message || 'Unable to load meteorological data.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to connect to weather service. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (cityInput.trim()) {
      loadWeather({ city: cityInput.trim() });
    }
  };

  const handleSelectSuggestion = (item) => {
    setCityInput(item.name);
    setShowSuggestions(false);
    loadWeather({ latitude: item.latitude, longitude: item.longitude, city: item.name });
  };

  // Browser Geolocation Detection
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setErrorMessage('Geolocation is not supported by your browser.');
      return;
    }

    setLocating(true);
    setErrorMessage(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        const { latitude, longitude } = pos.coords;
        loadWeather({ latitude, longitude });
      },
      (err) => {
        setLocating(false);
        let msg = 'Unable to retrieve your location.';
        if (err.code === 1) msg = 'Location permission was denied. Please search by city/district name.';
        else if (err.code === 2) msg = 'Location information is unavailable.';
        else if (err.code === 3) msg = 'Location request timed out. Please try again.';
        setErrorMessage(msg);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Map weather icon string to Lucide React component
  const renderWeatherIcon = (iconType, className = 'w-6 h-6') => {
    switch (iconType) {
      case 'sun':
        return <Sun className={`${className} text-amber-500`} />;
      case 'cloud-sun':
        return <CloudSun className={`${className} text-amber-500`} />;
      case 'cloud':
        return <Cloud className={`${className} text-slate-500`} />;
      case 'cloud-rain':
        return <CloudRain className={`${className} text-blue-500`} />;
      case 'cloud-drizzle':
        return <CloudDrizzle className={`${className} text-sky-400`} />;
      case 'cloud-lightning':
        return <CloudLightning className={`${className} text-amber-500`} />;
      case 'cloud-snow':
        return <CloudSnow className={`${className} text-sky-300`} />;
      case 'cloud-fog':
        return <CloudFog className={`${className} text-slate-400`} />;
      default:
        return <CloudSun className={`${className} text-agri-600`} />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-sky-700 bg-sky-100 px-2.5 py-0.5 rounded-full uppercase">
              Module 04
            </span>
            <span className="text-xs text-slate-400 font-medium">Agro-Meteorology & Early Warning</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            Weather Monitoring & Farmer Alerts
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time agricultural microclimate surveillance, 7-day weather forecasting, and severe storm early warnings
          </p>
        </div>

        <div className="flex items-center gap-2">
          {weatherData && (
            <button
              type="button"
              onClick={() => loadWeather({ city: cityInput })}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-sm transition disabled:opacity-50"
              title="Refresh weather data"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          )}

          <Badge variant="success">
            Live Meteorological Feed Active
          </Badge>
        </div>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <AlertBanner
          variant="danger"
          title="Meteorological Service Notice"
          message={errorMessage}
        />
      )}

      {/* Location Search Bar & Quick Evaluation Presets */}
      <Card className="p-4 sm:p-5">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3">
          
          <div className="relative flex-1 w-full">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={cityInput}
              onChange={(e) => {
                setCityInput(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Search agricultural district, mandal, or city (e.g. Guntur, Karimnagar, Pune, Ludhiana)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-xs sm:text-sm transition"
            />

            {/* Autocomplete Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-lg z-20 overflow-hidden divide-y divide-slate-100 max-h-56 overflow-y-auto">
                {suggestions.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSuggestion(item)}
                    className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-sky-50 hover:text-sky-900 transition flex items-center justify-between"
                  >
                    <span className="font-semibold">{item.name}</span>
                    <span className="text-[11px] text-slate-400">
                      {[item.district, item.state, item.country].filter(Boolean).join(', ')}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              type="submit"
              loading={loading}
              icon={Search}
              className="flex-1 sm:flex-initial bg-sky-600 hover:bg-sky-700"
            >
              Update Weather
            </Button>

            <Button
              type="button"
              variant="outline"
              loading={locating}
              onClick={handleUseCurrentLocation}
              icon={LocateFixed}
              title="Detect GPS location from device"
              className="px-3"
            >
              <span className="hidden sm:inline">My Farm</span>
            </Button>
          </div>
        </form>

        {/* Quick Evaluation Presets */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Quick Agricultural Zones:
          </span>
          {PRESET_LOCATIONS.map((preset) => (
            <button
              key={preset.city}
              type="button"
              onClick={() => {
                setCityInput(preset.city);
                loadWeather({ city: preset.city });
              }}
              className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition ${
                currentLocation?.name?.toLowerCase().includes(preset.city.toLowerCase())
                  ? 'bg-sky-100 text-sky-800 border-sky-300 shadow-sm'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-sky-50 hover:border-sky-200'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Main Weather Display */}
      {loading ? (
        /* Loading Skeleton */
        <div className="space-y-4 animate-pulse">
          <div className="h-44 bg-slate-100 rounded-3xl" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(n => <div key={n} className="h-28 bg-slate-100 rounded-2xl" />)}
          </div>
          <div className="h-64 bg-slate-100 rounded-3xl" />
        </div>
      ) : weatherData ? (
        <div className="space-y-6">

          {/* Current Microclimate Hero Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 text-white shadow-xl relative overflow-hidden">
            {/* Background ambient pattern */}
            <div className="absolute -right-8 -bottom-8 w-60 h-60 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              
              {/* Location & Time info */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 text-[11px] font-bold tracking-wide uppercase flex items-center gap-1.5 border border-sky-400/30">
                    <MapPin className="w-3.5 h-3.5" />
                    {[currentLocation?.name, currentLocation?.district, currentLocation?.state].filter(Boolean).join(', ')}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Coordinates: {currentLocation?.latitude}° N, {currentLocation?.longitude}° E
                  </span>
                </div>

                <div className="flex items-baseline gap-4 pt-1">
                  <span className="text-5xl sm:text-6xl font-black tracking-tight">
                    {weatherData.current.temperature}°C
                  </span>
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold text-sky-200">
                      Feels like {weatherData.current.apparentTemperature}°C
                    </p>
                    <p className="text-xs text-slate-300 font-medium">
                      {weatherData.current.condition}
                    </p>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 flex items-center gap-1 pt-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Observation timestamp: {new Date(weatherData.current.recordedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </p>
              </div>

              {/* Weather Condition Icon & Quick Summary */}
              <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center">
                  {renderWeatherIcon(weatherData.current.icon, 'w-10 h-10')}
                </div>
                <div className="text-xs space-y-1">
                  <div className="flex items-center gap-2">
                    <Droplets className="w-3.5 h-3.5 text-sky-300" />
                    <span>Humidity: <strong>{weatherData.current.humidity}%</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Wind className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Wind: <strong>{weatherData.current.windSpeed} km/h</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CloudRain className="w-3.5 h-3.5 text-blue-300" />
                    <span>Rainfall: <strong>{weatherData.current.precipitation} mm</strong></span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Severe Weather Alerts Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  Farmer Severe Weather Advisories & Alerts
                </h3>
              </div>
              <span className="text-xs font-semibold text-slate-400">
                {weatherData.alerts.length} active notifications
              </span>
            </div>

            {weatherData.alerts.length === 0 ? (
              <Card className="p-4 bg-emerald-50/50 border-emerald-200">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-emerald-900">Normal Agricultural Weather Conditions</h4>
                    <p className="text-[11px] text-emerald-700 mt-0.5 leading-relaxed">
                      No severe storms, extreme heatwaves, or flash flooding threats detected for this district. Ambient parameters remain favorable for routine agricultural fieldwork.
                    </p>
                  </div>
                </div>
              </Card>
            ) : (
              <div className="space-y-3">
                {weatherData.alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-5 rounded-2xl border shadow-sm transition ${
                      alert.severity === 'danger'
                        ? 'bg-rose-50/80 border-rose-300'
                        : alert.severity === 'warning'
                        ? 'bg-amber-50/80 border-amber-300'
                        : 'bg-sky-50/80 border-sky-300'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-black/5">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className={`w-4 h-4 ${
                          alert.severity === 'danger' ? 'text-rose-600' : 'text-amber-600'
                        }`} />
                        <h4 className="text-sm font-black text-slate-900">
                          {alert.title}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                          alert.severity === 'danger'
                            ? 'bg-rose-200 text-rose-800'
                            : alert.severity === 'warning'
                            ? 'bg-amber-200 text-amber-800'
                            : 'bg-sky-200 text-sky-800'
                        }`}>
                          {alert.severity}
                        </span>
                        <span className="text-[11px] font-bold text-slate-600">
                          {alert.timing}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 mt-2.5 leading-relaxed">
                      {alert.message}
                    </p>

                    {/* Practical Precautions */}
                    {alert.precautions?.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-black/5">
                        <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wide block mb-1.5">
                          Actionable Farmer Precautions:
                        </span>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                          {alert.precautions.map((p, idx) => (
                            <li key={idx} className="flex items-start gap-1.5 bg-white/70 p-2.5 rounded-xl border border-black/5">
                              <span className="text-emerald-700 font-bold">•</span>
                              <span className="leading-snug">{p}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 4 Agricultural Microclimate Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Ambient Temperature"
              value={`${weatherData.current.temperature}°C`}
              subtext={`Feels like ${weatherData.current.apparentTemperature}°C`}
              icon={Thermometer}
              color="rose"
            />
            <StatCard
              label="Relative Humidity"
              value={`${weatherData.current.humidity}%`}
              subtext={weatherData.current.humidity >= 75 ? 'High moisture (Pathogen risk)' : 'Balanced ambient humidity'}
              icon={Droplets}
              color="sky"
            />
            <StatCard
              label="Wind Speed"
              value={`${weatherData.current.windSpeed} km/h`}
              subtext={`Direction: ${weatherData.current.windDirection}° Azimuth`}
              icon={Wind}
              color="agri"
            />
            <StatCard
              label="Precipitation"
              value={`${weatherData.current.precipitation} mm`}
              subtext={weatherData.current.precipitation > 0 ? 'Active precipitation' : 'No current rainfall'}
              icon={CloudRain}
              color="purple"
            />
          </div>

          {/* 7-Day Agricultural Forecast */}
          <Card
            title={`7-Day Agricultural Forecast (${currentLocation?.name || 'District'})`}
            subtitle="Anticipate upcoming weather shifts to plan spray windows, fertilization, and harvesting operations"
            icon={Calendar}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 pt-2">
              {weatherData.forecast.map((f, i) => {
                const isSevere = f.rainSum >= 25 || f.tempMax >= 40 || f.windSpeedMax >= 35;
                return (
                  <div 
                    key={i}
                    className={`p-3.5 rounded-2xl border text-center space-y-2 transition flex flex-col justify-between ${
                      isSevere
                        ? 'bg-rose-50/70 border-rose-300 ring-1 ring-rose-400/20 shadow-sm'
                        : i === 0
                        ? 'bg-sky-50/60 border-sky-300'
                        : 'bg-slate-50/80 border-slate-200/80 hover:bg-slate-100/70'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs pb-1 border-b border-slate-200/60">
                        <span className="font-extrabold text-slate-800">{f.dayName}</span>
                        <span className="text-[10px] text-slate-400">{f.fullDate}</span>
                      </div>

                      <div className="my-2 flex items-center justify-center">
                        {renderWeatherIcon(f.icon, 'w-8 h-8')}
                      </div>

                      <div className="space-y-0.5">
                        <p className="text-sm font-black text-slate-900">
                          {f.tempMax}° / <span className="text-slate-500 font-semibold">{f.tempMin}°</span>
                        </p>
                        <p className="text-[11px] text-slate-500 line-clamp-1" title={f.condition}>
                          {f.condition}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1 pt-2 border-t border-slate-200/60 text-[10px]">
                      <div className="flex items-center justify-between text-blue-700 bg-blue-50/80 px-2 py-0.5 rounded-md font-semibold">
                        <span>Rain:</span>
                        <span>{f.rainProbability}%</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-500">
                        <span>Sum:</span>
                        <span>{f.rainSum} mm</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-500">
                        <span>Wind:</span>
                        <span>{f.windSpeedMax} km/h</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer Data Attribution */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400">
              <span>Source: {weatherData.dataSource}</span>
              <span>Updated: {new Date(weatherData.fetchedAt).toLocaleTimeString()}</span>
            </div>
          </Card>

        </div>
      ) : null}

    </div>
  );
}
