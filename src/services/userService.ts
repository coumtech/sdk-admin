import axiosClient from './apiClient';

interface ProfileData {
    name: string;
    stageName: string;
    country: string;
    roleId: string;
}

const userService = {

    updateProfile: async (profileData: ProfileData): Promise<void> => {
        try {
            return await axiosClient.patch('/api/users/profile', profileData).then(res => res.data);
        } catch (error) {
            console.error('Update profile failed:', error);
            throw error;
        }
    },
    getProfile: async (): Promise<any> => {
        try {
            return await axiosClient.get('/api/users/profile').then(res => res.data);
        } catch (error) {
            console.error('get profile failed:', error);
            throw error;
        }
    },
    updateSocialLinks: async (socialLinks: unknown): Promise<void> => {
        try {
            await axiosClient.patch('/api/users/social-links', { socialLinks });
        } catch (error) {
            console.error('Update social links failed:', error);
            throw error;
        }
    },
    addPaymentMethod: async (payload: unknown): Promise<void> => {
        try {
            return await axiosClient.post('/api/users/payment-method', payload);
        } catch (error) {
            console.error('Payment method linking failed:', error);
            throw error;
        }
    },
    removePaymentMethod: async (paymentMethodId: unknown): Promise<void> => {
        try {
            return await axiosClient.post('/api/users/remove-payment-method', { paymentMethodId });
        } catch (error) {
            console.error('Payment method removing failed:', error);
            throw error;
        }
    },
    listPaymentMethods: async (): Promise<void> => {
        try {
            return await axiosClient.get('/api/users/payment-method').then(res => res.data);
        } catch (error) {
            console.error('Payment methods getting failed:', error);
            throw error;
        }
    },
    listPaymentHistory: async (): Promise<any> => {
        try {
            return await axiosClient.get('/api/users/payment-history').then(res => res.data);
        } catch (error) {
            console.error('Payment history getting failed:', error);
            throw error;
        }
    },
    activateSubscription: async (paymentMethodId: string, productPriceId: string): Promise<void> => {
        try {
            return await axiosClient.post('/api/users/activate-premium', { paymentMethodId, productPriceId }).then(res => res.data);
        } catch (error) {
            console.error('Activating subscription failed:', error);
            throw error;
        }
    },
    topupWallet: async (amount: number, paymentMethodId: string): Promise<void> => {
        try {
            return await axiosClient.post('/api/users/wallet/topup', { amount, paymentMethodId });
        } catch (error) {
            console.error('Payment method linking failed:', error);
            throw error;
        }
    },
    deactivateSubscription: async (): Promise<void> => {
        try {
            return await axiosClient.delete('/api/users/deactivate-premium').then(res => res.data);
        } catch (error) {
            console.error('Activating subscription failed:', error);
            throw error;
        }
    },
    activateDevSubscription: async (paymentMethodId: string): Promise<void> => {
        try {
            return await axiosClient.post('/api/users/activate-developer-premium', { paymentMethodId }).then(res => res.data);
        } catch (error) {
            console.error('Activating subscription failed:', error);
            throw error;
        }
    },
    deactivateDevSubscription: async (): Promise<void> => {
        try {
            return await axiosClient.delete('/api/users/deactivate-developer-premium').then(res => res.data);
        } catch (error) {
            console.error('Activating subscription failed:', error);
            throw error;
        }
    },
    getStorageBreakdown: async (): Promise<any> => {
        try {
            return await axiosClient.get('/api/users/storage-breakdown').then(res => res.data);
        } catch (error) {
            console.error('get storage breakdown failed:', error);
            throw error;
        }
    },
    getAdminDashboardAnalytics: async (): Promise<any> => {
        try {
            return await axiosClient.get('/api/users/admin-dashboard').then(res => res.data);
        } catch (error) {
            console.error('get storage breakdown failed:', error);
            throw error;
        }
    },
    getArtistDashboardAnalytics: async (): Promise<any> => {
        try {
            return await axiosClient.get('/api/users/artist-dashboard').then(res => res.data);
        } catch (error) {
            console.error('get storage breakdown failed:', error);
            throw error;
        }
    },
    getDeveloperDashboardAnalytics: async (): Promise<any> => {
        try {
            return await axiosClient.get('/api/users/developer-dashboard').then(res => res.data);
        } catch (error) {
            console.error('get storage breakdown failed:', error);
            throw error;
        }
    },
    getUserSongEngagement: async (): Promise<any> => {
        try {
            return await axiosClient.get('/api/users/engagement').then(res => res.data);
        } catch (error) {
            console.error('get storage breakdown failed:', error);
            throw error;
        }
    },
    createGoogleAds: async (): Promise<any> => {
        try {
            return await axiosClient.get('/api/ads/google-ads').then(res => res.data);
        } catch (error) {
            console.error('get storage breakdown failed:', error);
            throw error;
        }
    },
};

export default userService;
