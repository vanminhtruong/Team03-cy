import { POST } from '@/src/config/ApiService';

export const updateStock = async (data:any) => {
    try {
        return await POST('/v1/api/stock',data );
    } catch (error) {
        console.error('Error updating stock:', error);
        throw error;
    }
};
