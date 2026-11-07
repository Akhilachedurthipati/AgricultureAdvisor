import api from './api';

/**
 * Upload leaf photo and run computer vision disease diagnostic
 * @param {FormData} formData - Contains 'image' file and optional 'crop'
 * @returns {Promise<object>} - Diagnostic report
 */
export const detectCropDisease = async (formData) => {
  try {
    const response = await api.post('/disease/detect', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: error.message };
  }
};

/**
 * Retrieve farmer's disease scan history
 * @returns {Promise<object>} - Array of past diagnostic reports
 */
export const fetchDiseaseHistory = async () => {
  try {
    const response = await api.get('/disease/history');
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: error.message };
  }
};

/**
 * Delete a specific disease report and scan image
 * @param {string} id - Report ID
 * @returns {Promise<object>}
 */
export const deleteDiseaseRecord = async (id) => {
  try {
    const response = await api.delete(`/disease/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: error.message };
  }
};

