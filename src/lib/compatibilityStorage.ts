'use client';

import { historyApiService } from './historyApiService';

const STORAGE_KEY_NAME = 'vaidiktalk_name_compat_data';
const STORAGE_KEY_LOVE = 'vaidiktalk_love_compat_data';
const HISTORY_KEY = 'vaidiktalk_compatibility_history';

export const compatibilityStorage = {
    // ------------------------------------------------------------------------
    // SINGLE ITEM LOAD/SAVE (For passing data between history page and main page)
    // ------------------------------------------------------------------------
    saveActiveData: (data: any, type: 'name' | 'love') => {
        if (typeof window !== 'undefined') {
            const key = type === 'name' ? STORAGE_KEY_NAME : STORAGE_KEY_LOVE;
            localStorage.setItem(key, JSON.stringify(data));
        }
    },
    
    getActiveData: (type: 'name' | 'love') => {
        if (typeof window !== 'undefined') {
            const key = type === 'name' ? STORAGE_KEY_NAME : STORAGE_KEY_LOVE;
            const data = localStorage.getItem(key);
            if (!data || data === 'undefined') return null;
            try {
                return JSON.parse(data);
            } catch (e) {
                console.warn('[CompatibilityStorage] Parse error:', e);
                return null;
            }
        }
        return null;
    },

    clearActiveData: (type: 'name' | 'love') => {
        if (typeof window !== 'undefined') {
            const key = type === 'name' ? STORAGE_KEY_NAME : STORAGE_KEY_LOVE;
            localStorage.removeItem(key);
        }
    },

    // ------------------------------------------------------------------------
    // HISTORY MANAGER (API + Local Backup)
    // ------------------------------------------------------------------------
    saveHistoryItem: async (type: 'name' | 'love', data: any, inputMeta: any, isFromHistory: boolean = false) => {
        if (typeof window !== 'undefined') {
            try {
                if (isFromHistory) {
                    console.log(`[CompatibilityStorage] Skipping history save - data is already from history`);
                    return;
                }

                // featureType maps directly to backend ENUM if one exists
                const featureType = type === 'name' ? 'name-compatibility' : 'love-horoscope';
                
                // Construct the rich history object
                const historyItem = {
                    type,
                    featureType,
                    input: inputMeta,
                    result: data,
                    timestamp: new Date().toISOString()
                };

                // 1. DB Sync
                if (historyApiService.isAuthenticated()) {
                    await historyApiService.saveHistory(featureType, historyItem);
                }

                // 2. Local Storage Sync (For Guests and quick access)
                let localHistory = await compatibilityStorage.getAllHistory();
                
                // Keep history capped at 50 to prevent localStorage bloat
                localHistory = [historyItem, ...localHistory].slice(0, 50);
                localStorage.setItem(HISTORY_KEY, JSON.stringify(localHistory));
                
            } catch (e) {
                console.warn('Error saving to compatibility history:', e);
            }
        }
    },

    getAllHistory: async () => {
        if (typeof window !== 'undefined') {
            let combinedHistory: any[] = [];

            // 1. DB Fetch (if logged in, pull both types and merge)
            if (historyApiService.isAuthenticated()) {
                try {
                    const nameHistory = await historyApiService.getHistory<any>('name-compatibility') || [];
                    const loveHistory = await historyApiService.getHistory<any>('love-horoscope') || [];
                    
                    combinedHistory = [...nameHistory, ...loveHistory].sort((a, b) => {
                        return new Date(b.timestamp || b.createdAt).getTime() - new Date(a.timestamp || a.createdAt).getTime();
                    });
                    
                    if (combinedHistory.length > 0) return combinedHistory;
                } catch (err) {
                    console.warn("DB History fetch failed, falling back to local");
                }
            }

            // 2. Local Fetch (Fallback)
            try {
                const historyStr = localStorage.getItem(HISTORY_KEY);
                const local = historyStr ? JSON.parse(historyStr) : [];
                
                // If we have DB data, we use it; otherwise local
                const all = combinedHistory.length > 0 ? combinedHistory : local;

                // Normalize and filter
                return all.map((item: any) => {
                    // Infer type if missing
                    let type = item.type;
                    if (!type) {
                        if (item.featureType === 'name-compatibility' || item.featureType === 'name_match') type = 'name';
                        else if (item.featureType === 'love-horoscope' || item.featureType === 'love_match') type = 'love';
                    }

                    // Strict validation: Only allow items that have our compatibility structure
                    // Valid ones MUST have input or result. Compatibility results saved by us have item.result.result
                    const hasValidInput = item.input && (item.input.name1 || item.input.nameA || item.input.sign1);
                    const isCompatType = type === 'name' || type === 'love';

                    if (!isCompatType || !hasValidInput) return null;

                    return {
                        ...item,
                        type,
                        // Ensure result structure { result: { ... }, report: { ... } }
                        result: (item.result && item.result.result) ? item.result : { result: item.result, report: item.report }
                    };
                }).filter(Boolean);
            } catch (e) {
                return [];
            }
        }
        return [];
    },

    clearAllHistory: async () => {
        if (typeof window !== 'undefined') {
            if (historyApiService.isAuthenticated()) {
                await historyApiService.clearHistory('name-compatibility');
                await historyApiService.clearHistory('love-horoscope');
            }
            localStorage.removeItem(HISTORY_KEY);
        }
    }
};
