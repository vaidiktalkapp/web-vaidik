const LAL_KITAB_STORAGE_KEY = 'v_lal_kitab_data';
const LAL_KITAB_LAST_VIEWED = 'v_lal_kitab_last_viewed';
import { historyApiService } from './historyApiService';

export const lalKitabStorage = {
    saveData: async (data: any) => {
        if (typeof window === 'undefined') return;
        try {
            // Save to history
            const existing = localStorage.getItem(LAL_KITAB_STORAGE_KEY);
            let history = existing ? JSON.parse(existing) : [];
            
            if (!Array.isArray(history)) {
                history = history ? [history] : [];
            }

            const newItem = {
                ...data,
                id: `lk_${Date.now()}`,
                timestamp: Date.now(),
            };

            // DB Integration
            if (historyApiService.isAuthenticated()) {
                await historyApiService.saveHistory('lal-kitab', newItem);
            }

            history = await lalKitabStorage.getAllHistory();
            history.unshift(newItem);
            history = history.slice(0, 50); // Keep last 50

            localStorage.setItem(LAL_KITAB_STORAGE_KEY, JSON.stringify(history));

            // Save as last viewed for autoloading
            localStorage.setItem(LAL_KITAB_LAST_VIEWED, JSON.stringify(newItem));
        } catch (e) {
            console.error('Error saving Lal Kitab data:', e);
        }
    },

    getData: () => {
        if (typeof window === 'undefined') return null;
        try {
            // Priority 1: Last viewed entry specifically for this page
            const lastViewed = localStorage.getItem(LAL_KITAB_LAST_VIEWED);
            if (lastViewed) return JSON.parse(lastViewed);

            // Priority 2: Latest from history (legacy support/fallback)
            const data = localStorage.getItem(LAL_KITAB_STORAGE_KEY);
            if (!data) return null;
            const parsed = JSON.parse(data);
            
            if (Array.isArray(parsed)) {
                return parsed[0] || null;
            }
            return parsed;
        } catch (e) {
            console.error('Error reading Lal Kitab data:', e);
            return null;
        }
    },

    getAllHistory: async () => {
        if (typeof window === 'undefined') return [];

        // DB Integration
        if (historyApiService.isAuthenticated()) {
            const dbHistory = await historyApiService.getHistory<any>('lal-kitab');
            if (dbHistory && dbHistory.length > 0) return dbHistory;
        }

        try {
            const data = localStorage.getItem(LAL_KITAB_STORAGE_KEY);
            if (!data) return [];
            const parsed = JSON.parse(data);
            
            if (Array.isArray(parsed)) return parsed;
            
            if (parsed && (parsed.planets || parsed.analysis)) {
                return [parsed];
            }
            
            return [];
        } catch (e) {
            console.error('Error reading Lal Kitab history:', e);
            return [];
        }
    },

    setLastViewed: (data: any) => {
        if (typeof window === 'undefined') return;
        localStorage.setItem(LAL_KITAB_LAST_VIEWED, JSON.stringify(data));
    },

    clearLastViewed: () => {
        if (typeof window === 'undefined') return;
        localStorage.removeItem(LAL_KITAB_LAST_VIEWED);
    },

    clearData: async () => {
        if (typeof window === 'undefined') return;
        if (historyApiService.isAuthenticated()) {
            await historyApiService.clearHistory('lal-kitab');
        }
        localStorage.removeItem(LAL_KITAB_STORAGE_KEY);
        localStorage.removeItem(LAL_KITAB_LAST_VIEWED);
    }
};
