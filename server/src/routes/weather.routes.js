import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { getWeather, searchWeatherLocations } from '../controllers/weather.controller.js';

const router = express.Router();

/**
 * @route   GET /api/weather
 * @desc    Get current weather, 7-day agricultural forecast, and severe weather alerts
 * @access  Private (JWT)
 */
router.get('/', protect, getWeather);

/**
 * @route   GET /api/weather/search
 * @desc    Autocomplete search for agricultural districts and cities
 * @access  Private (JWT)
 */
router.get('/search', protect, searchWeatherLocations);

export default router;
