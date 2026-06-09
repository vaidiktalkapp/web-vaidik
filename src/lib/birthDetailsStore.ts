/**
 * Utility to manage global birth details across all Vedic calculators
 * This helps eliminate repetitive data entry.
 */

export interface GlobalBirthDetails {
  name: string;
  date: string;
  time: string;
  place: string;
  lat: string | number;
  lon: string | number;
  tzone: number;
  gender?: string;
  updatedAt: string;
}

const STORAGE_KEY = 'vaidiktalk_global_birth_details';

export const birthDetailsStore = {
  /**
   * Saves birth details to local storage
   */
  save: (details: Partial<GlobalBirthDetails>) => {
    if (typeof window === 'undefined') return;
    
    try {
      const current = birthDetailsStore.get();
      const updated = {
        ...current,
        ...details,
        updatedAt: new Date().toISOString()
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      // Dispatch custom event so other components can react
      window.dispatchEvent(new CustomEvent('vaidiktalk_birth_details_updated', { detail: updated }));
    } catch (error) {
      console.warn('Failed to save birth details to localStorage:', error);
    }
  },

  /**
   * Retrieves birth details from local storage
   */
  get: (): GlobalBirthDetails | null => {
    if (typeof window === 'undefined') return null;
    
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return null;
      return JSON.parse(saved);
    } catch (error) {
      console.warn('Failed to parse birth details from localStorage:', error);
      return null;
    }
  },

  /**
   * Clears saved birth details
   */
  clear: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
  }
};
