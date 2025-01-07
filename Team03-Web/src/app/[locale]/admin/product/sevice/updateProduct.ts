import { PUT } from '@/src/config/ApiService';

export const updateProduct = async (id:any, data:any) => {
    try {
        return await PUT(`/v1/api/product/${id}`,data );
    } catch (error) {
        console.error('Error updating stock:', error);
        throw error;
    }
};
