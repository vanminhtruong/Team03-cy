import { POST } from '@/src/config/ApiService';

export const createProduct = async (productData:FormData) => {
    try {
        const response = await POST('/v1/api/product', productData);
        return response;
    } catch (error: any) {
        console.error('Error creating product:', error.message || error);

        throw error;
    }
};
