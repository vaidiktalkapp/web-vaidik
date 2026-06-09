import apiClient from './api';
import { Festival } from './mockFestivals'; // You can reuse the interface from here or extract it

export const festivalService = {
  /**
   * Fetch all festivals from the backend
   */
  async getAllFestivals(): Promise<Festival[]> {
    const response = await apiClient.get('/festivals');
    return response.data;
  },

  /**
   * Fetch a specific festival by its slug
   */
  async getFestivalBySlug(slug: string): Promise<Festival> {
    const response = await apiClient.get(`/festivals/slug/${slug}`);
    return response.data;
  }
};
