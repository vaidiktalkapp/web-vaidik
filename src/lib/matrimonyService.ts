import { historyApiService } from './historyApiService';
import apiClient from './api';

export const matrimonyService = {
    async getProfile() {
        if (!historyApiService.isAuthenticated()) return null;
        try {
            const res = await apiClient.get('/matrimony/profile');
            return res.data.success ? res.data.data : null;
        } catch (err) {
            console.error('Error fetching matrimony profile:', err);
            return null;
        }
    },

    async updateProfile(profileData: any) {
        if (!historyApiService.isAuthenticated()) return { success: false, message: 'Not authenticated' };
        try {
            const res = await apiClient.post('/matrimony/profile', profileData);
            return res.data;
        } catch (err) {
            console.error('Error updating matrimony profile:', err);
            return { success: false, message: 'Server error' };
        }
    },

    async getSuggestions(limit: number = 20, location?: string) {
        if (!historyApiService.isAuthenticated()) return [];
        try {
            const queryParams = new URLSearchParams({ limit: limit.toString() });
            if (location) queryParams.append('location', location);
            const res = await apiClient.get(`/matrimony/suggestions?${queryParams}`);
            return res.data.success ? res.data.data : [];
        } catch (err) {
            console.error('Error fetching suggestions:', err);
            return [];
        }
    },

    async getMatchDetails(partnerUserId: string) {
        if (!historyApiService.isAuthenticated()) return null;
        try {
            const res = await apiClient.get(`/matrimony/match/${partnerUserId}`);
            return res.data.success ? res.data.data : null;
        } catch (err) {
            console.error('Error fetching match details:', err);
            return null;
        }
    },

    async sendInterest(receiverId: string) {
        try {
            const res = await apiClient.post(`/matrimony/interests/${receiverId}`);
            return res.data;
        } catch (err) {
            console.error('Error sending interest:', err);
            return { success: false };
        }
    },

    async handleInterestResponse(requestId: string, status: 'accepted' | 'rejected') {
        try {
            const res = await apiClient.patch(`/matrimony/interests/${requestId}/response`, { status });
            return res.data;
        } catch (err) {
            console.error('Error responding to interest:', err);
            return { success: false };
        }
    },

    async getInterests(type: 'incoming' | 'outgoing') {
        try {
            const res = await apiClient.get(`/matrimony/interests/${type}`);
            return res.data.success ? res.data.data : [];
        } catch (err) {
            console.error('Error fetching interests:', err);
            return [];
        }
    }
};
