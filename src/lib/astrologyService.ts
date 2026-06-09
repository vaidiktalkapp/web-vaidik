import apiClient from './api';

export interface AstrologyCalculationRequest {
  name: string;
  date: string;
  time: string;
  lat: string;
  lon: string;
  place: string;
  tzone?: number;
}

const sanitize = (data: AstrologyCalculationRequest) => {
    const clean = (val: any) => {
        const s = String(val);
        if (!val || s === 'undefined' || s === 'null' || s === '') return '0';
        return s;
    };
    return {
        ...data,
        lat: clean(data.lat),
        lon: clean(data.lon),
        tzone: (data.tzone && String(data.tzone) !== 'undefined') ? Number(data.tzone) : 5.5
    };
};

export const astrologyService = {
  calculateKundli: async (data: AstrologyCalculationRequest) => {
    const response = await apiClient.post('/astrology/calculate', sanitize(data));
    return response.data;
  },
  calculateMatch: async (boy: AstrologyCalculationRequest, girl: AstrologyCalculationRequest, system: string = 'north_indian') => {
    const response = await apiClient.post('/astrology/match', { boy: sanitize(boy), girl: sanitize(girl), system });
    return response.data;
  },
  calculateLalKitab: async (data: AstrologyCalculationRequest) => {
    const response = await apiClient.post('/astrology/lal-kitab', sanitize(data));
    return response.data;
  },


  calculateMoonSign: async (data: AstrologyCalculationRequest) => {
    const response = await apiClient.post('/astrology/moon-sign', sanitize(data));
    return response.data;
  },
  calculateLoveHoroscope: async (data: AstrologyCalculationRequest) => {
    const response = await apiClient.post('/astrology/love-horoscope', sanitize(data));
    return response.data;
  },
  calculateZodiacLove: async (sign: string, period: string = 'daily', language: string = 'English') => {
    const response = await apiClient.post('/astrology/zodiac-love', { sign, period, language });
    return response.data;
  },

  // -------------------------------------------------------------------------
  // CHINESE ZODIAC ENDPOINTS
  // -------------------------------------------------------------------------

  calculateChineseZodiac: async (sign: string, period: string = 'daily', language: string = 'English') => {
    const response = await apiClient.post('/astrology/chinese-zodiac', { sign, period, language });
    return response.data;
  },

  calculateChinesePersonal: async (data: { name: string; date: string; language?: string }) => {
    const response = await apiClient.post('/astrology/chinese-personal', data);
    return response.data;
  },

  getChineseProfiles: async () => {
    const response = await apiClient.post('/astrology/chinese-profiles');
    return response.data;
  },

  getZodiacProfiles: async () => {
    const response = await apiClient.post('/astrology/zodiac-profiles');
    return response.data;
  }
};




export default astrologyService;
// Force HMR update
