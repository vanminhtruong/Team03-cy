import { GET, PUT, DELETE_ARRAY } from '@/src/config/ApiService';

export const getCart = async (userId: number) => {
    const response = await GET(`/v1/api/cart/${userId}`);
    if(response.status !== 200) return null;
    return await response.data?.data;
};

export const updateCart = async (userId: number, productId: number, quantity: number) => {
    return await PUT(`/v1/api/cart/${userId}`, { productId, quantity });
};

export const deleteCart = async (userId: number, listCartDetailId: number | number[]) => {
    const productsToDelete = Array.isArray(listCartDetailId) ? listCartDetailId : [listCartDetailId];
    return await DELETE_ARRAY(`/v1/api/cart/${userId}`, productsToDelete);
};
