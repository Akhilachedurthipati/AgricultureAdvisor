import api from './api';

/**
 * Fetch agricultural weather intelligence (Current conditions, 7-day forecast, and severe weather alerts)
 * @param {object} params - { city } or { lat, lon }
 * @returns {Promise<object>}
 */
export const fetchWeather = async (params = {}) => {
  try {
    const response = await api.get('/weather', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: error.message };
  }
};

/**
 * Search locations for autocomplete
 * @param {string} query - Location search term
 * @returns {Promise<Array>}
 */
export const searchWeatherLocations = async (query) => {
  try {
    const response = await api.get('/weather/search', {
      params: { q: query }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, data: [] };
  }
};
