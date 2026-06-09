'use client';

import { historyApiService } from './historyApiService';

const STORAGE_KEY = 'moon_sign_history';

export const moonSignStorage = {
    saveData: async (data: any) => {
        if (typeof window === 'undefined' || !data) return;
        
        try {
            // Get current history
            const history = await moonSignStorage.getHistory();
            
            // Generate a unique ID for this entry
            const id = Date.now().toString();
            const record = {
                id,
                timestamp: new Date().toISOString(),
                ...data
            };

            // DB Integration
            if (historyApiService.isAuthenticated()) {
                await historyApiService.saveHistory('moon-sign', record);
            }
            
            // Add to front of array
            const newHistory = [record, ...history].slice(0, 50); // Keep last 50
            
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
            
            // Also save as "last viewed" for the main page
            localStorage.setItem('moon_sign_last_viewed', JSON.stringify(record));
        } catch (error) {
            console.error('Error saving moon sign to storage:', error);
        }
    },

    getHistory: async () => {
        if (typeof window === 'undefined') return [];

        // DB Integration
        if (historyApiService.isAuthenticated()) {
            const dbHistory = await historyApiService.getHistory<any>('moon-sign');
            if (dbHistory && dbHistory.length > 0) return dbHistory;
        }

        try {
            const history = localStorage.getItem(STORAGE_KEY);
            return history ? JSON.parse(history) : [];
        } catch (error) {
            console.error('Error reading moon sign history:', error);
            return [];
        }
    },

    getLastViewed: () => {
        if (typeof window === 'undefined') return null;
        try {
            const last = localStorage.getItem('moon_sign_last_viewed');
            return last ? JSON.parse(last) : null;
        } catch (error) {
            console.error('Error reading last viewed moon sign:', error);
            return null;
        }
    },

    setLastViewed: (record: any) => {
        if (typeof window === 'undefined') return;
        localStorage.setItem('moon_sign_last_viewed', JSON.stringify(record));
    },

    clearLastViewed: () => {
        if (typeof window === 'undefined') return;
        localStorage.removeItem('moon_sign_last_viewed');
    },

    clearHistory: async () => {
        if (typeof window === 'undefined') return;
        if (historyApiService.isAuthenticated()) {
            await historyApiService.clearHistory('moon-sign');
        }
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem('moon_sign_last_viewed');
    }
};
