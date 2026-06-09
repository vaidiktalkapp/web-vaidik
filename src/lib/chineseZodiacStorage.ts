'use client';

const STORAGE_KEY = 'chinese_zodiac_history';
const LAST_VIEWED_KEY = 'chinese_zodiac_last_viewed';
import { historyApiService } from './historyApiService';

export const chineseZodiacStorage = {
    saveData: async (data: any, isFromHistory: boolean = false) => {
        if (typeof window === 'undefined' || !data) return;
        
        try {
            // 1. If this data was already loaded from history, don't re-save it
            if (isFromHistory) {
                console.log('[ChineseZodiacStorage] Skipping save - data is from history');
                return;
            }

            const history = await chineseZodiacStorage.getHistory();
            const record = {
                id: Date.now().toString(),
                timestamp: new Date().toISOString(),
                ...data
            };
            
            // 2. Avoid duplicate recent entries
            const isDuplicate = history.length > 0 && 
                               ((history[0].name === data.name && history[0].date === data.date && data.name) || 
                                (history[0].sign === data.sign && !data.name));
                               
            if (!isDuplicate) {
                // 3. DB Integration
                if (historyApiService.isAuthenticated()) {
                    await historyApiService.saveHistory('chinese-zodiac', record);
                }

                const newHistory = [record, ...history].slice(0, 50);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
            }
            
            localStorage.setItem(LAST_VIEWED_KEY, JSON.stringify(record));
        } catch (error) {
            console.error('Error saving chinese zodiac to storage:', error);
        }
    },

    getHistory: async () => {
        if (typeof window === 'undefined') return [];

        // DB Integration
        if (historyApiService.isAuthenticated()) {
            const dbHistory = await historyApiService.getHistory<any>('chinese-zodiac');
            if (dbHistory && dbHistory.length > 0) return dbHistory;
        }

        try {
            const history = localStorage.getItem(STORAGE_KEY);
            return history ? JSON.parse(history) : [];
        } catch (error) {
            console.error('Error reading chinese zodiac history:', error);
            return [];
        }
    },

    getLastViewed: () => {
        if (typeof window === 'undefined') return null;
        try {
            const last = localStorage.getItem(LAST_VIEWED_KEY);
            return last ? JSON.parse(last) : null;
        } catch (error) {
            console.error('Error reading last viewed chinese zodiac:', error);
            return null;
        }
    },

    setLastViewed: (record: any) => {
        if (typeof window === 'undefined') return;
        localStorage.setItem(LAST_VIEWED_KEY, JSON.stringify(record));
    },

    clearHistory: async () => {
        if (typeof window === 'undefined') return;
        if (historyApiService.isAuthenticated()) {
            await historyApiService.clearHistory('chinese-zodiac');
        }
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(LAST_VIEWED_KEY);
    }
};
