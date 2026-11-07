import { z } from 'zod';
import { getAgriculturalWeather, searchLocations } from '../services/weather.service.js';

// Query validation schema
export const weatherQuerySchema = z.object({
  city: z.string().trim().max(100, 'City name is too long').optional(),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lon: z.coerce.number().min(-180).max(180).optional(),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional()
});

/**
 * @desc    Get current weather, 7-day agricultural forecast, and severe weather alerts
 * @route   GET /api/weather
 * @access  Private (JWT Protected)
 */
export const getWeather = async (req, res, next) => {
  try {
    const parseResult = weatherQuerySchema.safeParse(req.query);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid location parameters provided.',
        errors: parseResult.error.errors.map(err => ({ field: err.path.join('.'), message: err.message }))
      });
    }

    const { city, lat, lon, latitude, longitude } = parseResult.data;

    const resolvedLat = lat ?? latitude;
    const resolvedLon = lon ?? longitude;

    // Determine target location: query param city/coords > user profile location > default fallback
    let targetCity = city;
    if (!targetCity && !resolvedLat && !resolvedLon) {
      targetCity = req.user?.location?.city || req.user?.location?.district || 'Hyderabad';
    }

    const weatherData = await getAgriculturalWeather({
      city: targetCity,
      latitude: resolvedLat,
      longitude: resolvedLon
    });

    return res.status(200).json({
      success: true,
      message: 'Agricultural meteorological intelligence retrieved successfully.',
      data: weatherData
    });
  } catch (error) {
    if (error.message.includes('could not be found') || error.message.includes('Location')) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
};

/**
 * @desc    Search and autocomplete agricultural districts/cities
 * @route   GET /api/weather/search
 * @access  Private (JWT Protected)
 */
export const searchWeatherLocations = async (req, res, next) => {
  try {
    const query = req.query.q || req.query.query || '';
    if (!query || query.trim().length < 2) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: []
      });
    }

    const results = await searchLocations(query);

    return res.status(200).json({
      success: true,
      count: results.length,
      data: results
    });
  } catch (error) {
    next(error);
  }
};
