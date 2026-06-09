import { historyApiService } from './historyApiService';

/**
 * Free Report History — localStorage-based storage for free astrology reports.
 * Each entry stores the report type, user name, date of birth, key result, and timestamp.
 */

export interface ReportHistoryEntry {
    id: string;
    type: 'sade-sati' | 'kaal-sarp' | 'gemstone' | 'manglik';
    name: string;
    date: string;
    place: string;
    summary: string;
    timestamp: number;
    data: any;
}

const STORAGE_KEY = 'vaidik_free_report_history';
const MAX_ENTRIES = 50;

/**
 * Get internal local storage history (Synchronous for low-latency UI if needed)
 */
export function getLocalReportHistory(): ReportHistoryEntry[] {
    if (typeof window === 'undefined') return [];
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        return JSON.parse(raw) as ReportHistoryEntry[];
    } catch {
        return [];
    }
}

/**
 * NEW: Fetches unified history from both LocalStorage and DB
 */
export async function getUnifiedHistory(): Promise<ReportHistoryEntry[]> {
    const local = getLocalReportHistory();
    
    // DB Integration
    let db: ReportHistoryEntry[] = [];
    if (historyApiService.isAuthenticated()) {
        try {
            // Fetch all four types in parallel for maximum efficiency
            const [sade, kaal, gem, mang] = await Promise.all([
                historyApiService.getHistory<ReportHistoryEntry>('sade-sati'),
                historyApiService.getHistory<ReportHistoryEntry>('kaal-sarp'),
                historyApiService.getHistory<ReportHistoryEntry>('gemstone'),
                historyApiService.getHistory<ReportHistoryEntry>('manglik'),
            ]);
            db = [...sade, ...kaal, ...gem, ...mang];
        } catch (e) {
            console.error('[ReportHistory] Failed to fetch DB history:', e);
        }
    }

    if (db.length === 0) return local;

    // Merge and Deduplicate (prioritize newer timestamp if duplicates exist)
    const merged = [...db, ...local];
    const uniqueMap = new Map<string, ReportHistoryEntry>();
    
    // Use a composite key for deduplication (Name + Date + Type)
    merged.forEach(entry => {
        const key = `${entry.type}_${entry.name}_${entry.date}`.toLowerCase();
        const existing = uniqueMap.get(key);
        if (!existing || entry.timestamp > existing.timestamp) {
            uniqueMap.set(key, entry);
        }
    });

    return Array.from(uniqueMap.values())
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, MAX_ENTRIES);
}

export async function saveReportToHistory(entry: Omit<ReportHistoryEntry, 'id' | 'timestamp'>): Promise<void> {
    if (typeof window === 'undefined') return;
    try {
        const history = getLocalReportHistory();
        const newEntry: ReportHistoryEntry = {
            ...entry,
            id: `report_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            timestamp: Date.now(),
        };

        // 1. Sync to DB if authenticated
        if (historyApiService.isAuthenticated()) {
            await historyApiService.saveHistory(newEntry.type, newEntry);
        }

        // 2. Local Storage Sync (deduplicate)
        const key = `${newEntry.type}_${newEntry.name}_${newEntry.date}`.toLowerCase();
        const updated = [newEntry, ...history.filter(item => {
            const itemKey = `${item.type}_${item.name}_${item.date}`.toLowerCase();
            return itemKey !== key;
        })].slice(0, MAX_ENTRIES);

        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
        console.warn('[ReportHistory] Save failed:', e);
    }
}

export async function deleteReportFromHistory(id: string, type?: string): Promise<void> {
    if (typeof window === 'undefined') return;
    try {
        // Delete from local
        const history = getLocalReportHistory();
        const updated = history.filter(e => e.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

        // Note: Backend deletion is currently by featureType (Clear All). 
        // Individual deletion from DB would require passing the specific DB ID.
        // For now, we clear the local copy. 
        // Future: Add Individual DB Item Deletion if backend supports it.
    } catch { }
}

export async function clearReportHistory(): Promise<void> {
    if (typeof window === 'undefined') return;
    try {
        localStorage.removeItem(STORAGE_KEY);
        
        // Clear from Backend if authenticated (for all types)
        if (historyApiService.isAuthenticated()) {
            await Promise.all([
                historyApiService.clearHistory('sade-sati'),
                historyApiService.clearHistory('kaal-sarp'),
                historyApiService.clearHistory('gemstone'),
                historyApiService.clearHistory('manglik'),
            ]);
        }
    } catch { }
}

/**
 * Generate a human-readable summary for a report result.
 */
export function generateReportSummary(type: ReportHistoryEntry['type'], data: any): string {
    switch (type) {
        case 'sade-sati': {
            const sade = data?.sadeSati;
            if (sade?.is_active) {
                return `${sade.phase} — Moon in ${sade.natal_moon_sign}`;
            }
            return `No active Sade Sati — Moon in ${sade?.natal_moon_sign || 'Unknown'}`;
        }
        case 'kaal-sarp': {
            const dosha = data?.doshas;
            if (dosha?.is_present) {
                return `${dosha.type} Kaal Sarp Yoga detected`;
            }
            return 'No Kaal Sarp Yoga found';
        }
        case 'gemstone': {
            const gems = data?.gemstones;
            if (Array.isArray(gems) && gems.length > 0) {
                return gems.map((g: any) => g.gemstone).join(', ');
            }
            return 'Gemstone analysis complete';
        }
        case 'manglik': {
            const manglik = data?.manglik;
            if (manglik?.is_present) {
                return `Manglik Dosha detected — ${manglik.type || 'Present'}`;
            }
            return 'No Manglik Dosha found';
        }
        default:
            return 'Report generated';
    }
}
