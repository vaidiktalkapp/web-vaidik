'use client';

import { historyApiService } from './historyApiService';

const HISTORY_KEY = 'vaidiktalk_muhurat_history';

export interface MuhuratHistoryItem {
    category: string;
    startDate: string;
    endDate: string;
    lat: string;
    lon: string;
    tzone: number;
    place: string;
    timestamp: string;
    id: string;
}

export const muhuratStorage = {
    saveHistory: async (input: Omit<MuhuratHistoryItem, 'id' | 'timestamp'>) => {
        if (typeof window === 'undefined') return;

        try {
            const history = await muhuratStorage.getHistory();
            
            // Create a unique ID or use a hash of the input to avoid duplicates
            const id = Math.random().toString(36).substring(2, 11);
            const newItem: MuhuratHistoryItem = {
                ...input,
                timestamp: new Date().toISOString(),
                id,
            };

            // Filter out exact duplicates (same category, place, and date range)
            const filteredHistory = history.filter(item => 
                !(item.category === input.category && 
                  item.place === input.place && 
                  item.startDate === input.startDate && 
                  item.endDate === input.endDate)
            );

            // DB Integration
            if (historyApiService.isAuthenticated()) {
                await historyApiService.saveHistory('muhurat', newItem);
            }

            const newHistory = [newItem, ...filteredHistory].slice(0, 50); // Keep last 50
            localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
        } catch (e) {
            console.error('Failed to save muhurat history:', e);
        }
    },

    getHistory: async (): Promise<MuhuratHistoryItem[]> => {
        if (typeof window === 'undefined') return [];

        // DB Integration
        if (historyApiService.isAuthenticated()) {
            const dbHistory = await historyApiService.getHistory<MuhuratHistoryItem>('muhurat');
            if (dbHistory && dbHistory.length > 0) return dbHistory;
        }

        try {
            const historyStr = localStorage.getItem(HISTORY_KEY);
            return historyStr ? JSON.parse(historyStr) : [];
        } catch (e) {
            console.error('Failed to get muhurat history:', e);
            return [];
        }
    },

    deleteItem: async (id: string) => {
        if (typeof window === 'undefined') return;

        try {
            const history = await muhuratStorage.getHistory();
            const newHistory = history.filter(item => item.id !== id);
            
            // Warning: DB Integration doesn't support deleting individual items yet unless we add a specific endpoint.
            // For now, it only affects localStorage. 
            localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
        } catch (e) {
            console.error('Failed to delete muhurat history item:', e);
        }
    },

    clearHistory: async () => {
        if (typeof window === 'undefined') return;
        if (historyApiService.isAuthenticated()) {
            await historyApiService.clearHistory('muhurat');
        }
        localStorage.removeItem(HISTORY_KEY);
    }
};
