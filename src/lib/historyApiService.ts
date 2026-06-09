import { apiClient } from './api';


export const historyApiService = {
  /**
   * Check if the user is authenticated (meaning we should use the DB instead of localStorage local-only)
   */
  isAuthenticated: (): boolean => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('accessToken');
  },

  /**
   * Save a history record to the backend DB
   */
  saveHistory: async (featureType: string, data: any): Promise<void> => {
    try {
      if (!historyApiService.isAuthenticated()) return;
      await apiClient.post('/astrology/history', { featureType, data });
    } catch (error) {
      console.error(`[HistoryAPI] Failed to save history for ${featureType}:`, error);
    }
  },

  /**
   * Fetch history records from the backend DB
   */
  getHistory: async <T>(featureType: string): Promise<T[]> => {
    try {
      if (!historyApiService.isAuthenticated()) return [];
      const response = await apiClient.get(`/astrology/history/${featureType}`);
      if (response.data && response.data.success) {
        // Map the backend DB structure { _id, featureType, data, createdAt } to just the raw 'data' payloads
        // or return them directly if the frontend components prefer the raw wrapper.
        // Returning just `.data` to act exactly like localStorage items
        return response.data.data.map((item: any) => item.data) as T[];
      }
      return [];
    } catch (error) {
      console.error(`[HistoryAPI] Failed to fetch history for ${featureType}:`, error);
      return [];
    }
  },

  /**
   * Clear history for a specific feature on the backend
   */
  clearHistory: async (featureType: string): Promise<void> => {
    try {
      if (!historyApiService.isAuthenticated()) return;
      await apiClient.delete(`/astrology/history/${featureType}`);
    } catch (error) {
      console.error(`[HistoryAPI] Failed to clear history for ${featureType}:`, error);
    }
  }
};
