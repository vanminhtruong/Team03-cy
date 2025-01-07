import { POST } from '@/src/config/ApiService';

export const addOptionService = async (id:any, payload:any) => {
    try {
        return await POST(`/v1/api/option/${id}`,payload );
    } catch (error) {
        console.error('Error updating stock:', error);
        throw error;
    }
};
