import api from './api';

/**
 * Send an agricultural inquiry to the AI Assistant
 * @param {Object} payload - { message, language, isVoice }
 * @returns {Promise<Object>} API response with message, response, and metadata
 */
export async function sendChatMessage({ message, language = 'en', isVoice = false }) {
  try {
    const response = await api.post('/chat/message', {
      message,
      language,
      isVoice
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Failed to communicate with AI Assistant.'
    );
  }
}

/**
 * Fetch farmer's past chat history
 * @param {number} limit
 * @returns {Promise<Object>} API response with past messages
 */
export async function getChatHistory(limit = 50) {
  try {
    const response = await api.get(`/chat/history?limit=${limit}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Failed to fetch conversation history.'
    );
  }
}

/**
 * Clear farmer's chat history
 * @returns {Promise<Object>} API response
 */
export async function clearChatHistory() {
  try {
    const response = await api.delete('/chat/history');
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Failed to clear chat history.'
    );
  }
}

