import api from './api';

/**
 * Request ML crop recommendation from backend API
 * @param {object} inputData - { soilType, season, temperature, humidity, ph, rainfall }
 * @returns {Promise<object>} - Recommendation result object
 */
export const getRecommendedCrop = async (inputData) => {
  try {
    const response = await api.post('/crop/recommend', inputData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: error.message };
  }
};

/**
 * Retrieve farmer's previous crop recommendations
 * @returns {Promise<object>} - History list
 */
export const fetchCropHistory = async () => {
  try {
    const response = await api.get('/crop/history');
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: error.message };
  }
};

/**
 * Save custom farmer land allocation for recommended crops
 * @param {string} id - Crop recommendation ID
 * @param {object} allocationData - { landArea, allocatedLand: [{ cropName, acres }] }
 * @returns {Promise<object>}
 */
export const saveCropLandAllocation = async (id, allocationData) => {
  try {
    const response = await api.put(`/crop/${id}/allocation`, allocationData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: error.message };
  }
};

