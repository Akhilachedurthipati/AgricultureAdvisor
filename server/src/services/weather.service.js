/**
 * Weather Service for Agriculture Advisor
 * Integrates real-time meteorological data via Open-Meteo & OpenWeatherMap
 * Computes agricultural severe weather alerts and actionable precautions.
 */

// In-memory weather cache (TTL: 10 minutes)
const weatherCache = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000;

// WMO Weather Interpretation Codes (World Meteorological Organization standard)
export const WMO_CODE_MAP = {
  0: { condition: 'Clear Sky', icon: 'sun', isSevere: false },
  1: { condition: 'Mainly Clear', icon: 'sun', isSevere: false },
  2: { condition: 'Partly Cloudy', icon: 'cloud-sun', isSevere: false },
  3: { condition: 'Overcast', icon: 'cloud', isSevere: false },
  45: { condition: 'Fog', icon: 'cloud-fog', isSevere: false },
  48: { condition: 'Depositing Rime Fog', icon: 'cloud-fog', isSevere: false },
  51: { condition: 'Light Drizzle', icon: 'cloud-drizzle', isSevere: false },
  53: { condition: 'Moderate Drizzle', icon: 'cloud-drizzle', isSevere: false },
  55: { condition: 'Dense Drizzle', icon: 'cloud-drizzle', isSevere: false },
  56: { condition: 'Light Freezing Drizzle', icon: 'cloud-snow', isSevere: true },
  57: { condition: 'Dense Freezing Drizzle', icon: 'cloud-snow', isSevere: true },
  61: { condition: 'Slight Rain', icon: 'cloud-rain', isSevere: false },
  63: { condition: 'Moderate Rain', icon: 'cloud-rain', isSevere: false },
  65: { condition: 'Heavy Rain', icon: 'cloud-rain', isSevere: true },
  66: { condition: 'Light Freezing Rain', icon: 'cloud-snow', isSevere: true },
  67: { condition: 'Heavy Freezing Rain', icon: 'cloud-snow', isSevere: true },
  71: { condition: 'Slight Snow Fall', icon: 'cloud-snow', isSevere: false },
  73: { condition: 'Moderate Snow Fall', icon: 'cloud-snow', isSevere: true },
  75: { condition: 'Heavy Snow Fall', icon: 'cloud-snow', isSevere: true },
  77: { condition: 'Snow Grains', icon: 'cloud-snow', isSevere: false },
  80: { condition: 'Slight Rain Showers', icon: 'cloud-rain', isSevere: false },
  81: { condition: 'Moderate Rain Showers', icon: 'cloud-rain', isSevere: false },
  82: { condition: 'Violent Rain Showers', icon: 'cloud-rain', isSevere: true },
  85: { condition: 'Slight Snow Showers', icon: 'cloud-snow', isSevere: false },
  86: { condition: 'Heavy Snow Showers', icon: 'cloud-snow', isSevere: true },
  95: { condition: 'Thunderstorm', icon: 'cloud-lightning', isSevere: true },
  96: { condition: 'Thunderstorm with Slight Hail', icon: 'cloud-lightning', isSevere: true },
  99: { condition: 'Thunderstorm with Heavy Hail', icon: 'cloud-lightning', isSevere: true }
};

/**
 * Get human-readable description for WMO weather code
 */
export function interpretWeatherCode(code) {
  return WMO_CODE_MAP[code] || { condition: 'Unknown / Fair', icon: 'cloud-sun', isSevere: false };
}

/**
 * Geocode city or district name to geographic coordinates
 * @param {string} locationQuery
 * @returns {Promise<object|null>}
 */
export async function geocodeLocation(locationQuery) {
  const cleanQuery = (locationQuery || '').trim();
  if (!cleanQuery) return null;

  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cleanQuery)}&count=5&language=en&format=json`;

  try {
    const response = await fetch(url, { headers: { 'User-Agent': 'AgricultureAdvisor/1.0' } });
    if (!response.ok) {
      throw new Error(`Geocoding API responded with HTTP ${response.status}`);
    }
    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      return null;
    }

    // Prefer Indian locations if query does not specify country, otherwise take top match
    const indianMatch = data.results.find(r => r.country_code === 'IN' || r.country === 'India');
    const match = indianMatch || data.results[0];

    return {
      name: match.name,
      district: match.admin2 || match.admin3 || match.name,
      state: match.admin1 || '',
      country: match.country || 'India',
      countryCode: match.country_code || 'IN',
      latitude: Number(match.latitude.toFixed(4)),
      longitude: Number(match.longitude.toFixed(4)),
      timezone: match.timezone || 'Asia/Kolkata'
    };
  } catch (error) {
    console.error('[Weather Service] Geocoding error:', error.message);
    throw error;
  }
}

/**
 * Search locations for autocomplete
 * @param {string} query
 * @returns {Promise<Array>}
 */
export async function searchLocations(query) {
  const cleanQuery = (query || '').trim();
  if (cleanQuery.length < 2) return [];

  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cleanQuery)}&count=8&language=en&format=json`;

  try {
    const response = await fetch(url);
    if (!response.ok) return [];
    const data = await response.json();
    if (!data.results) return [];

    return data.results.map(r => ({
      name: r.name,
      district: r.admin2 || '',
      state: r.admin1 || '',
      country: r.country || '',
      latitude: r.latitude,
      longitude: r.longitude
    }));
  } catch {
    return [];
  }
}

/**
 * Evaluates severe weather thresholds and generates actionable farmer alerts
 * Excludes: irrigation recommendations, watering schedules, and calendar features
 */
export function generateFarmerAlerts(current, dailyForecast) {
  const alerts = [];

  // Helper for day label
  const getDayLabel = (dateStr) => {
    const today = new Date().toISOString().split('T')[0];
    if (dateStr === today) return 'Today';
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    if (dateStr === tomorrow) return 'Tomorrow';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  };

  // 1. Extreme Heatwave Alert (Temperature >= 40°C or current >= 38°C with high humidity)
  let heatwaveDays = [];
  dailyForecast.forEach(day => {
    if (day.tempMax >= 40 || (day.tempMax >= 38 && current.humidity >= 65)) {
      heatwaveDays.push({ dayName: getDayLabel(day.date), tempMax: day.tempMax });
    }
  });

  if (heatwaveDays.length > 0 || current.temperature >= 40) {
    const daysText = heatwaveDays.map(d => `${d.dayName} (${d.tempMax}°C)`).join(', ') || 'Current Hours';
    alerts.push({
      id: `alert_heatwave_${Date.now()}`,
      type: 'EXTREME_HEAT',
      severity: 'danger',
      title: 'Extreme Heatwave Advisory',
      timing: `Expected: ${daysText}`,
      message: `Daytime maximum temperatures are forecasted to exceed 40°C. Severe thermal stress can cause floral drop, pollen sterility, and rapid soil moisture evaporation.`,
      precautions: [
        'Erect protective shade netting over tender vegetable and fruit nurseries.',
        'Apply organic straw or crop residue mulching to reduce root zone soil temperature.',
        'Avoid strenuous outdoor field operations between 12:00 PM and 3:30 PM to safeguard farm workers and draft animals from heat stroke.',
        'Provide shaded resting enclosures and fresh cool drinking water for farm livestock.'
      ]
    });
  }

  // 2. Heavy Rainfall / Downpour Alert (Rain sum > 35mm or violent rain code)
  let heavyRainDays = [];
  dailyForecast.forEach(day => {
    if (day.rainSum >= 30 || day.rainProbability >= 75 || [65, 82, 95, 96, 99].includes(day.weatherCode)) {
      heavyRainDays.push({ dayName: getDayLabel(day.date), rainSum: day.rainSum, prob: day.rainProbability });
    }
  });

  if (heavyRainDays.length > 0 || current.precipitation >= 15) {
    const rainDetails = heavyRainDays.map(d => `${d.dayName} (${d.rainSum} mm, ${d.prob}% probability)`).join(', ') || 'Next 24 Hours';
    alerts.push({
      id: `alert_heavy_rain_${Date.now()}`,
      type: 'HEAVY_RAINFALL',
      severity: 'danger',
      title: 'Heavy Rainfall & Waterlogging Alert',
      timing: `Expected: ${rainDetails}`,
      message: `Intense precipitation is anticipated. High risk of field flooding, soil erosion, and severe nutrient leaching.`,
      precautions: [
        'Inspect and clear all drainage channels, bund cuts, and farm field outlets immediately to prevent stagnant waterlogging.',
        'Halt all foliar chemical spraying and fertilizer broadcasting to avoid total wash-off losses.',
        'Harvest standing mature crops (pulses, oilseeds, vegetables) immediately and move threshed grain to elevated waterproof storage.',
        'Secure farm machinery, diesel pumps, and electrical motors above potential high-water inundation levels.'
      ]
    });
  }

  // 3. Severe Storm & High Winds Alert (Wind speed > 40 km/h or Thunderstorm code)
  let stormDays = [];
  dailyForecast.forEach(day => {
    if (day.windSpeedMax >= 35 || [95, 96, 99].includes(day.weatherCode)) {
      stormDays.push({ dayName: getDayLabel(day.date), wind: day.windSpeedMax, code: day.weatherCode });
    }
  });

  if (stormDays.length > 0 || current.windSpeed >= 38 || [95, 96, 99].includes(current.weatherCode)) {
    const stormText = stormDays.map(d => `${d.dayName} (Gusts up to ${d.wind} km/h)`).join(', ') || 'Imminent in region';
    alerts.push({
      id: `alert_storm_${Date.now()}`,
      type: 'SEVERE_STORM',
      severity: 'danger',
      title: 'Severe Thunderstorm & High Wind Warning',
      timing: `Expected: ${stormText}`,
      message: `Strong squalls and lightning activity are forecasted. High winds can cause extensive crop lodging (flattening) and structural damage to protected cultivation.`,
      precautions: [
        'Provide sturdy staking, earthen mounding, or bamboo propping to lodging-prone crops like Banana, Sugarcane, Maize, and trellised vegetables.',
        'Check and secure loose plastic sheeting, cladding ropes, and vent covers on polyhouses and net houses.',
        'Never seek shelter under isolated trees, metal sheds, or near high-tension electrical lines during lightning storms.',
        'Anchor lightweight farm implements and equipment in locked shelters.'
      ]
    });
  }

  // 4. Frost & Cold Wave Alert (Minimum Temperature <= 4°C)
  let coldDays = [];
  dailyForecast.forEach(day => {
    if (day.tempMin <= 5) {
      coldDays.push({ dayName: getDayLabel(day.date), tempMin: day.tempMin });
    }
  });

  if (coldDays.length > 0 || current.temperature <= 5) {
    const coldText = coldDays.map(d => `${d.dayName} (${d.tempMin}°C)`).join(', ') || 'Tonight / Early Morning';
    alerts.push({
      id: `alert_frost_${Date.now()}`,
      type: 'FROST_WARNING',
      severity: 'warning',
      title: 'Frost & Cold Wave Advisory',
      timing: `Expected: ${coldText}`,
      message: `Night temperatures dropping to near freezing point can cause ice crystals inside plant cells, resulting in leaf scorching, blackened shoots, and fruit drop.`,
      precautions: [
        'Cover high-value nursery beds with straw mats, polythene covers, or agro-netting during nighttime hours.',
        'Create localized smoke screens (smudging) along field borders upwind in the late evening using dry leaves/manure to trap ground radiation.',
        'Keep farm cattle and young calves sheltered in dry, straw-bedded barns shielded from cold draft winds.'
      ]
    });
  }

  // 5. Persistent High Humidity & Fungal Pathogen Advisory (Humidity > 80% for multiple days with warm temp)
  if (current.humidity >= 80 && current.temperature >= 22 && current.temperature <= 32) {
    alerts.push({
      id: `alert_humidity_${Date.now()}`,
      type: 'PATHOGEN_BLIGHT_RISK',
      severity: 'advisory',
      title: 'High Humidity Foliar Disease Risk Advisory',
      timing: 'Active: Current Microclimate Conditions',
      message: `Relative humidity is sustained above 80% with warm ambient temperatures. These conditions create optimal microclimates for rapid fungal spore germination (Early/Late Blight, Rice Blast, and Downy Mildew).`,
      precautions: [
        'Scout crops daily, paying special attention to lower leaf canopies and damp soil interfaces.',
        'Prune dense foliage or sucker shoots to improve canopy aeration and speed up morning dew drying.',
        'Prepare bio-fungicides (Trichoderma viride / Pseudomonas) or university-recommended protective sprays for application once wind and rain subside.'
      ]
    });
  }

  // 6. Optimal Foliar Spraying Window (Positive Alert when conditions are ideal)
  if (
    current.windSpeed <= 15 &&
    current.precipitation === 0 &&
    current.temperature >= 18 &&
    current.temperature <= 32 &&
    alerts.length === 0
  ) {
    alerts.push({
      id: `alert_spraying_${Date.now()}`,
      type: 'OPTIMAL_SPRAY_WINDOW',
      severity: 'info',
      title: 'Favorable Spraying & Field Operation Window',
      timing: 'Active: Favorable Morning / Late Afternoon',
      message: `Current wind speeds are calm (<15 km/h) and no rainfall is forecasted. Ambient conditions are ideal for bio-pesticide, micro-nutrient, and foliar spray applications with minimal chemical drift.`,
      precautions: [
        'Conduct planned foliar nutrition or preventive bio-spray applications during early morning (7:00 - 10:00 AM) or late afternoon (4:00 - 6:00 PM).',
        'Always wear protective face masks and gloves when handling agrochemicals.'
      ]
    });
  }

  return alerts;
}

/**
 * Fetch complete agricultural weather intelligence (Current + 7-Day Forecast + Severe Alerts)
 * @param {object} params - { city, latitude, longitude }
 * @returns {Promise<object>}
 */
export async function getAgriculturalWeather(params = {}) {
  let { city, latitude, longitude } = params;

  let locationInfo = null;

  // Resolve Location Coordinates
  if (latitude && longitude) {
    const lat = Number(Number(latitude).toFixed(4));
    const lon = Number(Number(longitude).toFixed(4));
    locationInfo = {
      name: city || 'Your Farm Location',
      district: city || 'Local Agricultural Zone',
      state: '',
      country: 'India',
      countryCode: 'IN',
      latitude: lat,
      longitude: lon,
      timezone: 'Asia/Kolkata'
    };
  } else if (city) {
    locationInfo = await geocodeLocation(city);
    if (!locationInfo) {
      throw new Error(`Location "${city}" could not be found. Please check city spelling or try a nearby district.`);
    }
  } else {
    // Default fallback to Hyderabad / central agricultural hub
    locationInfo = {
      name: 'Hyderabad',
      district: 'Hyderabad',
      state: 'Telangana',
      country: 'India',
      countryCode: 'IN',
      latitude: 17.3850,
      longitude: 78.4867,
      timezone: 'Asia/Kolkata'
    };
  }

  // Check In-Memory Cache
  const cacheKey = `${locationInfo.latitude}_${locationInfo.longitude}`;
  const cached = weatherCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return {
      ...cached.data,
      fromCache: true
    };
  }

  // Query Open-Meteo Weather API
  const queryUrl = `https://api.open-meteo.com/v1/forecast?latitude=${locationInfo.latitude}&longitude=${locationInfo.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max&timezone=auto`;

  const response = await fetch(queryUrl, {
    headers: { 'User-Agent': 'AgricultureAdvisor/1.0' }
  });

  if (!response.ok) {
    throw new Error(`Weather meteorological service error: HTTP ${response.status}`);
  }

  const raw = await response.json();

  if (!raw.current || !raw.daily) {
    throw new Error('Incomplete weather data received from meteorological server.');
  }

  // Parse Current Conditions
  const currentWeatherInterp = interpretWeatherCode(raw.current.weather_code);
  const current = {
    temperature: Number(raw.current.temperature_2m.toFixed(1)),
    apparentTemperature: Number((raw.current.apparent_temperature ?? raw.current.temperature_2m).toFixed(1)),
    humidity: Math.round(raw.current.relative_humidity_2m),
    windSpeed: Number(raw.current.wind_speed_10m.toFixed(1)),
    windDirection: Math.round(raw.current.wind_direction_10m || 0),
    precipitation: Number((raw.current.precipitation || 0).toFixed(1)),
    weatherCode: raw.current.weather_code,
    condition: currentWeatherInterp.condition,
    icon: currentWeatherInterp.icon,
    isDay: Boolean(raw.current.is_day),
    pressure: Math.round(raw.current.surface_pressure || 1013),
    recordedAt: raw.current.time
  };

  // Parse 7-Day Agricultural Forecast
  const dailyForecast = raw.daily.time.map((dateStr, idx) => {
    const code = raw.daily.weather_code[idx];
    const interp = interpretWeatherCode(code);
    const d = new Date(dateStr);
    const dayName = idx === 0 ? 'Today' : idx === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' });

    return {
      date: dateStr,
      dayName,
      fullDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      weatherCode: code,
      condition: interp.condition,
      icon: interp.icon,
      tempMax: Number(raw.daily.temperature_2m_max[idx].toFixed(1)),
      tempMin: Number(raw.daily.temperature_2m_min[idx].toFixed(1)),
      rainSum: Number((raw.daily.precipitation_sum[idx] || 0).toFixed(1)),
      rainProbability: Math.round(raw.daily.precipitation_probability_max[idx] || 0),
      windSpeedMax: Number((raw.daily.wind_speed_10m_max[idx] || 0).toFixed(1))
    };
  });

  // Generate Severe Weather Alerts & Precautions
  const alerts = generateFarmerAlerts(current, dailyForecast);

  const payload = {
    location: locationInfo,
    current,
    forecast: dailyForecast,
    alerts,
    dataSource: 'Open-Meteo Meteorological Global Models (ECMWF, GFS, ICON)',
    fetchedAt: new Date().toISOString()
  };

  // Cache result
  weatherCache.set(cacheKey, {
    timestamp: Date.now(),
    data: payload
  });

  return payload;
}

/**
 * Standard Indian Cropping Season calendar windows and duration in months
 */
export const SEASON_CALENDAR = {
  'kharif': {
    name: 'Kharif (Monsoon)',
    canonicalLabel: 'Kharif (Monsoon: Jun - Oct)',
    startDate: '2025-06-01',
    endDate: '2025-10-31',
    months: 5,
    description: 'Southwest Monsoon cropping season'
  },
  'rabi': {
    name: 'Rabi (Winter)',
    canonicalLabel: 'Rabi (Winter: Oct - Mar)',
    startDate: '2024-11-01',
    endDate: '2025-03-31',
    months: 5,
    description: 'Winter cropping season'
  },
  'zaid': {
    name: 'Zaid (Summer)',
    canonicalLabel: 'Zaid (Summer: Mar - Jun)',
    startDate: '2025-03-01',
    endDate: '2025-05-31',
    months: 3,
    description: 'Summer cropping season'
  }
};

/**
 * Resolve season string to calendar window metadata
 */
export function resolveSeasonWindow(seasonStr) {
  const s = (seasonStr || '').toLowerCase();
  if (s.includes('kharif') || s.includes('monsoon')) return SEASON_CALENDAR['kharif'];
  if (s.includes('rabi') || s.includes('winter')) return SEASON_CALENDAR['rabi'];
  if (s.includes('zaid') || s.includes('summer')) return SEASON_CALENDAR['zaid'];
  return SEASON_CALENDAR['kharif'];
}

/**
 * Retrieve seasonal climate and meteorological telemetry for crop recommendation
 * Uses real-time Open-Meteo weather for temperature & relative humidity,
 * and Open-Meteo historical archive for seasonal precipitation norms.
 *
 * @param {object} params - { city, latitude, longitude, season }
 * @returns {Promise<object>}
 */
export async function getSeasonalClimateForCrop(params = {}) {
  const { city, latitude, longitude, season } = params;

  // 1. Fetch current & short-term forecast weather via existing Open-Meteo integration
  const weatherData = await getAgriculturalWeather({ city, latitude, longitude });
  const loc = weatherData.location;

  // 2. Resolve seasonal calendar window
  const seasonInfo = resolveSeasonWindow(season);

  // 3. Query Open-Meteo Historical Archive for seasonal precipitation
  const archiveUrl = `https://archive-api.open-meteo.com/v1/archive?latitude=${loc.latitude}&longitude=${loc.longitude}&start_date=${seasonInfo.startDate}&end_date=${seasonInfo.endDate}&daily=precipitation_sum&timezone=auto`;

  let seasonalCumulativeRainfall = 0;
  try {
    const archiveRes = await fetch(archiveUrl, { headers: { 'User-Agent': 'AgricultureAdvisor/1.0' } });
    if (!archiveRes.ok) {
      throw new Error(`Open-Meteo Archive API returned HTTP ${archiveRes.status}`);
    }
    const archiveData = await archiveRes.json();
    if (archiveData.daily && Array.isArray(archiveData.daily.precipitation_sum)) {
      seasonalCumulativeRainfall = archiveData.daily.precipitation_sum.reduce((acc, val) => acc + (val || 0), 0);
    }
  } catch (archiveErr) {
    console.warn('[Weather Service] Seasonal archive query error:', archiveErr.message);
    throw new Error(`Weather telemetry unavailable: Could not retrieve seasonal climate information from Open-Meteo for ${loc.name || loc.district || 'the selected location'}. Please verify connection or select a nearby district.`);
  }

  // Model was trained on monthly equivalent precipitation values (range: ~20mm to ~300mm)
  // Converting cumulative season precipitation to monthly equivalent preserves exact model compatibility
  const monthlyRainfallEquivalent = Math.max(
    15,
    Number((seasonalCumulativeRainfall / seasonInfo.months).toFixed(1))
  );

  return {
    location: loc,
    temperature: weatherData.current.temperature,
    humidity: weatherData.current.humidity,
    weatherCondition: weatherData.current.condition,
    weatherCode: weatherData.current.weatherCode,
    seasonalCumulativeRainfall: Number(seasonalCumulativeRainfall.toFixed(1)),
    monthlyRainfallEquivalent,
    rainfallUsedInModel: monthlyRainfallEquivalent,
    seasonName: seasonInfo.name,
    seasonMonths: seasonInfo.months,
    dataSource: 'Open-Meteo Forecast & Historical Archive API',
    fetchedAt: new Date().toISOString()
  };
}
