// src/services/settingsService.ts

import { apiClient } from "@/services/api.client";
import { API_CONFIG } from "@/config/api.config";

/**
 * This service fetches and updates the single JSON blob at /api/config/files.
 */
export const settingsService = {
  /**
   * GET /api/config/files
   * Returns the parsed JSON object from the server.
   */
  getSettings: async (): Promise<any> => {
    const { data, error } = await apiClient.get<any>(
      API_CONFIG.ENDPOINTS.CONFIG.FILES
    );
    if (error) {
      throw new Error(error);
    }
    return data!;
  },

  /**
   * PUT /api/config/files
   * Sends the entire JSON object back to the server.
   */
  updateSettings: async (payload: any): Promise<void> => {
    const { status, error } = await apiClient.put<void>(
      API_CONFIG.ENDPOINTS.CONFIG.FILES,
      payload
    );
    if (status < 200 || status >= 300) {
      throw new Error(error || `Update failed: ${status}`);
    }
  },
};
