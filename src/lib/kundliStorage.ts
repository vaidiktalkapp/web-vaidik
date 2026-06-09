'use client';

import { historyApiService } from './historyApiService';

const STORAGE_KEY = 'vaidiktalk_kundli_data';
const HISTORY_KEY = 'vaidiktalk_kundli_history';

export const kundliStorage = {
    saveData: async (data: any, isFromHistory: boolean = false) => {
        if (typeof window !== 'undefined') {
            try {
                // Store full data for current session/view (Always updated for currently viewed record)
                localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

                // 1. If this data was already loaded from history, don't re-save it to history
                if (isFromHistory) {
                    console.log('[KundliStorage] Skipping history save - data is from history');
                    return;
                }

                // SAFETY CHECK: Ensure coordinates are valid before saving to history
                const lat = data.input?.lat;
                const lon = data.input?.lon;
                
                const isLatValid = lat !== undefined && lat !== null && String(lat) !== 'undefined' && String(lat) !== '';
                const isLonValid = lon !== undefined && lon !== null && String(lon) !== 'undefined' && String(lon) !== '';
                const isValid = isLatValid && isLonValid;

                if (isValid) {
                    const historyItem = {
                        input: data.input,
                        timestamp: new Date().toISOString(),
                        isLightweight: true
                    };

                    // 2. DB Integration
                    if (historyApiService.isAuthenticated()) {
                        await historyApiService.saveHistory('kundali', historyItem);
                    }

                    // 3. Local Storage Sync (deduplicate)
                    const history = await kundliStorage.getHistory();
                    const newHistory = [historyItem, ...history.filter((item: any) => 
                        !(item.input?.name === data.input?.name && item.input?.date === data.input?.date)
                    )].slice(0, 50);

                    localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
                }
            } catch (e) {
                console.warn('LocalStorage error in KundliStorage:', e);
            }
        }
    },
    getData: () => {
        if (typeof window !== 'undefined') {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : null;
        }
        return null;
    },
    getHistory: async () => {
        if (typeof window !== 'undefined') {
            // DB Integration
            if (historyApiService.isAuthenticated()) {
                const dbHistory = await historyApiService.getHistory<any>('kundali');
                if (dbHistory && dbHistory.length > 0) return dbHistory;
            }

            try {
                const historyStr = localStorage.getItem(HISTORY_KEY);
                const history = historyStr ? JSON.parse(historyStr) : [];
                
                // LEGACY CLEANER: Only filter out truly broken items (literal "undefined" text or null/missing)
                return history.filter((item: any) => {
                    const lat = item.input?.lat;
                    const lon = item.input?.lon;
                    
                    // Check if they are actually defined and not the word "undefined"
                    const isLatValid = lat !== undefined && lat !== null && String(lat) !== 'undefined' && String(lat) !== '';
                    const isLonValid = lon !== undefined && lon !== null && String(lon) !== 'undefined' && String(lon) !== '';
                    
                    return isLatValid && isLonValid;
                });
            } catch (e) {
                return [];
            }
        }
        return [];
    },
    clearData: () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(STORAGE_KEY);
        }
    },
    clearHistory: async () => {
        if (typeof window !== 'undefined') {
            if (historyApiService.isAuthenticated()) {
                await historyApiService.clearHistory('kundali');
            }
            localStorage.removeItem(HISTORY_KEY);
        }
    }
};
