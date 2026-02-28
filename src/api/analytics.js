import api from './axios';

export const getAnalyticsData = async () => {
    try {
        const response = await api.get('/api/analytics/');
        return response.data;
    } catch (error) {
        throw error;
    }
};
