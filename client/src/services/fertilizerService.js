import api from './api';

/**
 * Request precision fertilizer recommendation from backend API
 * @param {object} inputData - { soilType, season, crop, nitrogen, phosphorus, potassium, landArea }
 * @returns {Promise<object>} - Recommendation result object
 */
export const getRecommendedFertilizer = async (inputData) => {
  try {
    const response = await api.post('/fertilizer/recommend', inputData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: error.message };
  }
};

/**
 * Retrieve farmer's previous fertilizer recommendations
 * @returns {Promise<object>} - History list
 */
export const fetchFertilizerHistory = async () => {
  try {
    const response = await api.get('/fertilizer/history');
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: error.message };
  }
};
