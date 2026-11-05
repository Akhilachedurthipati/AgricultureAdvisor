import React, { useState } from 'react';
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
  Calendar
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import AlertBanner from '../components/common/AlertBanner';
import StatCard from '../components/common/StatCard';
import { useAuth } from '../context/AuthContext';

export default function WeatherMonitoring() {
  const { user } = useAuth();
  const defaultCity = user?.location?.city || user?.location?.district || 'Hyderabad';
  const [cityInput, setCityInput] = useState(defaultCity);
  const [currentCity, setCurrentCity] = useState(defaultCity);

  const [weatherData] = useState({
    temp: 29.5,
    condition: 'Scattered Clouds & Warm',
    humidity: 68,
    windSpeed: '14 km/h',
    rainfallRisk: '35%',
    forecast: [
      { day: 'Today', temp: '30° / 22°', condition: 'Partly Cloudy', rain: '20%' },
      { day: 'Tomorrow', temp: '31° / 23°', condition: 'Isolated Showers', rain: '55%' },
      { day: 'Friday', temp: '28° / 21°', condition: 'Heavy Rainfall', rain: '85%' },
      { day: 'Saturday', temp: '27° / 20°', condition: 'Thunderstorm', rain: '80%' },
      { day: 'Sunday', temp: '30° / 22°', condition: 'Clear Sky', rain: '10%' }
    ],
    alerts: [
      {
        id: 1,
        title: 'Heavy Rainfall Advisory (Friday - Saturday)',
        message: 'Depression approaching coastal regions. Anticipate 40-70mm precipitation. Secure harvested grain and clear drainage canals.',
        severity: 'warning'
      }
    ]
  });

  const handleSearch = (e) => {
    e.preventDefault();
    if (cityInput.trim()) {
      setCurrentCity(cityInput.trim());
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
            <span className="text-xs text-slate-400 font-medium">Agro-Meteorology</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            Weather Monitoring & Farmer Alerts
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Monitor real-time temperatures, moisture, and storm warnings customized for your agricultural district
          </p>
        </div>

        <Badge variant="info" pulse={true}>
          Phase 7 Weather API Shell
        </Badge>
      </div>

      {/* Weather Alert Banner */}
      {weatherData.alerts.map((alert) => (
        <AlertBanner
          key={alert.id}
          variant="advisory"
          title={`⚠️ ${alert.title}`}
          message={alert.message}
        />
      ))}

      {/* Location Search Bar */}
      <Card className="p-4 sm:p-5">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
              placeholder="Enter agricultural district or city (e.g. Guntur, Karimnagar, Pune)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-sky-500 text-xs sm:text-sm"
            />
          </div>
          <Button type="submit" icon={Search} className="w-full sm:w-auto">
            Update Location
          </Button>
        </form>
      </Card>

      {/* Current Weather Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Current Temperature"
          value={`${weatherData.temp}°C`}
          subtext={`Conditions: ${weatherData.condition}`}
          icon={Thermometer}
          color="rose"
        />
        <StatCard
          label="Relative Humidity"
          value={`${weatherData.humidity}%`}
          subtext="Moisture index in air"
          icon={Droplets}
          color="sky"
        />
        <StatCard
          label="Wind Velocity"
          value={weatherData.windSpeed}
          subtext="Direction: South-West"
          icon={Wind}
          color="agri"
        />
        <StatCard
          label="Precipitation Probability"
          value={weatherData.rainfallRisk}
          subtext="Next 24 hours likelihood"
          icon={CloudRain}
          color="purple"
        />
      </div>

      {/* 5-Day Agricultural Forecast */}
      <Card
        title={`5-Day Farming Forecast (${currentCity})`}
        subtitle="Anticipate weather shifts to plan sprayings, fertilizer applications, and harvesting"
        icon={Calendar}
      >
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-2">
          {weatherData.forecast.map((f, i) => (
            <div 
              key={i}
              className={`p-4 rounded-2xl border text-center space-y-2 transition ${
                f.rain === '85%' || f.rain === '80%' 
                  ? 'bg-amber-50/60 border-amber-300' 
                  : 'bg-slate-50 border-slate-200/80 hover:bg-slate-100/60'
              }`}
            >
              <p className="text-xs font-bold text-slate-800">{f.day}</p>
              <div className="my-1 flex items-center justify-center">
                {f.condition.includes('Rain') || f.condition.includes('Showers') ? (
                  <CloudRain className="w-8 h-8 text-blue-500" />
                ) : f.condition.includes('Thunderstorm') ? (
                  <CloudLightning className="w-8 h-8 text-amber-500" />
                ) : (
                  <Sun className="w-8 h-8 text-amber-500" />
                )}
              </div>
              <p className="text-sm font-black text-slate-900">{f.temp}</p>
              <p className="text-[11px] text-slate-500 truncate">{f.condition}</p>
              <span className="inline-block text-[10px] font-semibold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-full">
                Rain: {f.rain}
              </span>
            </div>
          ))}
        </div>
      </Card>

    </div>
  );
}

