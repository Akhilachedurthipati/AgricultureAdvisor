import api from './api';

/**
 * Fetch unified agricultural history with filters and pagination
 * @param {Object} params - { module, search, crop, startDate, endDate, page, limit }
 * @returns {Promise<Object>} API response with count, totalPages, page, and data
 */
export async function fetchUnifiedHistory(params = {}) {
  try {
    const query = new URLSearchParams();
    if (params.module && params.module !== 'all') query.append('module', params.module);
    if (params.search) query.append('search', params.search);
    if (params.crop && params.crop !== 'all') query.append('crop', params.crop);
    if (params.startDate) query.append('startDate', params.startDate);
    if (params.endDate) query.append('endDate', params.endDate);
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);

    const qs = query.toString();
    const url = qs ? `/history?${qs}` : '/history';

    const response = await api.get(url);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Failed to fetch recommendation history.'
    );
  }
}

/**
 * Fetch single history record full details
 * @param {string} module - 'crop' | 'fertilizer' | 'disease' | 'chat'
 * @param {string} id - Record ID
 * @returns {Promise<Object>} Record details
 */
export async function fetchHistoryItemDetails(module, id) {
  try {
    const response = await api.get(`/history/${module}/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Failed to retrieve record details.'
    );
  }
}

/**
 * Delete a single record from history
 * @param {string} module - 'crop' | 'fertilizer' | 'disease' | 'chat'
 * @param {string} id - Record ID
 * @returns {Promise<Object>}
 */
export async function deleteHistoryItem(module, id) {
  try {
    const response = await api.delete(`/history/${module}/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Failed to delete history record.'
    );
  }
}

/**
 * Clear history records
 * @param {string} module - 'all' | 'crop' | 'fertilizer' | 'disease' | 'chat'
 * @returns {Promise<Object>}
 */
export async function clearUnifiedHistory(module = 'all') {
  try {
    const response = await api.delete(`/history/clear?module=${module}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Failed to clear history.'
    );
  }
}

