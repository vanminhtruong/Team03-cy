import { GET } from '@/src/config/ApiService';

export const getStatistics = async (userId: number, period: string, startDate?: string, endDate?: string) => {
    let url = `/v1/api/shop/${userId}/statistics?period=${period}`;

    if (period === 'custom' && startDate && endDate) {
        url += `&startDate=${startDate}&endDate=${endDate}`;
    }
    try {
        const response = await GET(url);
        return response.data.data || {};
    } catch (error) {
        console.error('Error fetching statistics data:', error);
        throw error;
    }
};

export const getPeriodicStatistics = async (userId: number) => {
    try {
        const response = await GET(`/v1/api/shop/${userId}/periodic-statistics`);
        return response.data.data || [];
    } catch (error) {
        console.error('Error fetching periodic statistics data:', error);
        throw error;
    }
};
export const getRevenueStatistic = async (shopId: number, year: number) => {
    try {
        const response = await GET(`/v1/api/shop/${shopId}/revenue-statistic?year=${year}`);
        return response.data || {};
    } catch (error) {
        console.error('Error fetching revenue statistic:', error);
        throw error;
    }
};
