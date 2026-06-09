import api from './api';

export interface CelebrityProfile {
  _id: string;
  name: string;
  slug: string;
  image: string;
  category: string;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  latitude: number;
  longitude: number;
  timezone: number;
  summary: string;
  content: string;
  kundliData?: any;
  isActive: boolean;
}

export const celebrityService = {
  /**
   * Get all active celebrities
   */
  getCelebrities: async (category?: string): Promise<CelebrityProfile[]> => {
    const response = await api.get('/celebrities', { params: { category } });
    return response.data;
  },

  /**
   * Get a single celebrity by slug
   */
  getCelebrityBySlug: async (slug: string): Promise<CelebrityProfile> => {
    const response = await api.get(`/celebrities/profile/${slug}`);
    return response.data;
  }
};
