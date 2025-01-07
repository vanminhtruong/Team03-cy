import axios from 'axios';
import { GET } from '@/service/ApiService.js';

export const fetchStatistics = async () => {
    try {
        const response = await GET(`/v1/api/admin/statistics`);
        return response.data.data;
    } catch (error) {
        console.error('Error fetching statistics:', error);
        throw error;
    }
};
export const fetchRevenueDataFromApi = async (year) => {
    try {
        const response = await axios.get(`https://team03-api.cyvietnam.id.vn/v1/api/admin/revenue-statistic?year=${year}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching revenue data from API:', error);
        throw error;
    }
};

export const fetchApiData = async (year) => {
    try {
        return await GET(`/v1/api/test/revenue-statistic?year=${year}`);
    } catch (error) {
        console.error('Error fetching revenue data from API:', error);
        throw error;
    }
};
