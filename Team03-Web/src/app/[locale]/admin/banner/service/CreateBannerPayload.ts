import { GET, POST, DELETE } from '@/src/config/ApiService';

export interface CreateBannerPayload {
    price: number;
    image: File;
    createStart: string;
    createEnd: string;
    shopId: string;
}

export const createBanner = async (payload: CreateBannerPayload): Promise<any> => {
    const formData = new FormData();
    formData.append('price', payload.price.toString());
    formData.append('image', payload.image);
    formData.append('createStart', payload.createStart);
    formData.append('createEnd', payload.createEnd);
    formData.append('shopId', payload.shopId);

    return POST('/v1/api/banner', formData);
};
export const fetchBannersById = async (id: string) => {
    try {
        const response = await GET(`/v1/api/banner/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching banners:', error);
        throw error;
    }
};
export const deleteBanner = async (bannerId: string) => {
    try {
        const response = await DELETE(`/v1/api/banner/${bannerId}`);
        return response;
    } catch (error) {
        throw new Error('Failed to delete banner');
    }
};
