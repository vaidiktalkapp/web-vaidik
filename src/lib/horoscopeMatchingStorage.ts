'use client';

import { historyApiService } from './historyApiService';

const HISTORY_KEY = 'horoscope_match_history';

export const horoscopeMatchingStorage = {
    saveData: async (matchRecord: any, isFromHistory: boolean = false) => {
        if (typeof window === 'undefined') return;

        try {
            // 1. If this data was already loaded from history, don't re-save it
            if (isFromHistory) {
                console.log('[HoroscopeMatchingStorage] Skipping save - data is from history');
                return;
            }

            const history = await horoscopeMatchingStorage.getHistory();
            
            // 2. Check for duplicates (using the corrected field names)
            const boy = matchRecord.boy || matchRecord.boyRecord;
            const girl = matchRecord.girl || matchRecord.girlRecord;
            
            const existingIndex = history.findIndex((h: any) => {
                const hBoy = h.boy || h.boyRecord;
                const hGirl = h.girl || h.girlRecord;
                return hBoy?.name === boy?.name && 
                       hGirl?.name === girl?.name &&
                       hBoy?.date === boy?.date &&
                       hGirl?.date === girl?.date;
            });

            // 3. DB Integration
            if (historyApiService.isAuthenticated()) {
                await historyApiService.saveHistory('horoscope-matching', matchRecord);
            }

            // 4. Local Storage Sync
            if (existingIndex !== 0) {
                let newHistory = [...history];
                if (existingIndex !== -1) {
                    newHistory.splice(existingIndex, 1);
                }
                newHistory = [matchRecord, ...newHistory].slice(0, 50);
                localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
            }
        } catch (e) {
            console.error('Failed to save matching history:', e);
        }
    },

    getHistory: async () => {
        if (typeof window === 'undefined') return [];

        // DB Integration
        if (historyApiService.isAuthenticated()) {
            const dbHistory = await historyApiService.getHistory<any>('horoscope-matching');
            if (dbHistory && dbHistory.length > 0) return dbHistory;
        }

        try {
            const historyStr = localStorage.getItem(HISTORY_KEY);
            return historyStr ? JSON.parse(historyStr) : [];
        } catch (e) {
            console.error('Failed to get matching history:', e);
            return [];
        }
    },

    clearHistory: async () => {
        if (typeof window === 'undefined') return;
        if (historyApiService.isAuthenticated()) {
            await historyApiService.clearHistory('horoscope-matching');
        }
        localStorage.removeItem(HISTORY_KEY);
    }
};
