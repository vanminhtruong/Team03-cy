import { PUT } from '@/src/config/ApiService';

export const updateOptionById = async (optionId: number, data: any) => {
    try {
        return await PUT(`/v1/api/option/${optionId}`, data);
    } catch (error) {
        console.error('Error updating optionId:', error);
        throw error;
    }
};
