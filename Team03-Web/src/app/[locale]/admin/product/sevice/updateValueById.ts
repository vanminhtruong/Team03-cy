import { PUT } from '@/src/config/ApiService';

export const updateValueById = async (valueId: number, data: any) => {
    try {
        return await PUT(`/v1/api/value/${valueId}`, data);
    } catch (error) {
        console.error('Error updating value:', error);
        throw error;
    }
};
