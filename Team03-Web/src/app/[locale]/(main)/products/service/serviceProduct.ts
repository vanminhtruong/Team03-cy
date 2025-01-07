import { GET, POST } from '@/src/config/ApiService';

export const getRelative = async (id: number) => {
    return await GET(`/v1/api/product/relative/${id}`);
};
export const getProductById = async (id: number) => {
    return await GET(`/v1/api/product/${id}?type=1`);
};
export const createCart = async (userId: number, productId: number, quantity: number) => {
    return await POST(`/v1/api/cart/${userId}`, {
        userId: userId,
        productId: productId,
        quantity: quantity
    });
};
export const createFavourite = async (userId: number, productId: number) => {
    return await POST(`/v1/api/product/favorite`, {
        userId: userId,
        productId: productId
    });
};
export const getFilteredFeedbacks = async (productId: number, hasImage?: number, hasComment?: number, rating?: number) => {
    try {
        const response = await GET(`/v1/api/feedback/${productId}`, {
            params: { hasImage, hasComment, rating }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching feedbacks:', error);
        throw error;
    }
};
