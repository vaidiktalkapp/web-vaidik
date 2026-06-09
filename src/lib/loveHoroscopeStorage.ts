const STORAGE_KEY = 'vaidik_love_horoscope_data';
const HISTORY_KEY = 'vaidik_love_horoscope_history';
import { historyApiService } from './historyApiService';

export const loveHoroscopeStorage = {
    saveData: async (data: any) => {
        if (typeof window === 'undefined') return;
        try {
            // Save current view
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

            // Save to history if it's a personalized reading (has input)
            if (data.input) {
                let history = await loveHoroscopeStorage.getHistory();
                
                // Remove duplicates by name/date if exists
                history = history.filter((item: any) => 
                    !(item.input?.name === data.input.name && item.input?.date === data.input.date)
                );

                const newItem = {
                    input: data.input,
                    timestamp: new Date().toISOString(),
                    name: data.input.name,
                    place: data.input.place
                };

                // DB Integration
                if (historyApiService.isAuthenticated()) {
                    await historyApiService.saveHistory('love-horoscope', newItem);
                }

                // Add to start (limit to 20)
                history.unshift(newItem);
                
                localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 20)));
            }
        } catch (e) {
            console.error('Error saving love horoscope data:', e);
        }
    },

    getData: () => {
        if (typeof window === 'undefined') return null;
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            return null;
        }
    },

    getHistory: async () => {
        if (typeof window === 'undefined') return [];

        // DB Integration
        if (historyApiService.isAuthenticated()) {
            const dbHistory = await historyApiService.getHistory<any>('love-horoscope');
            if (dbHistory && dbHistory.length > 0) return dbHistory;
        }

        try {
            const history = localStorage.getItem(HISTORY_KEY);
            return history ? JSON.parse(history) : [];
        } catch (e) {
            return [];
        }
    },

    clearData: async () => {
        if (typeof window === 'undefined') return;
        if (historyApiService.isAuthenticated()) {
            await historyApiService.clearHistory('love-horoscope');
        }
        localStorage.removeItem(STORAGE_KEY);
    }
};
