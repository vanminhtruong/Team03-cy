import { DELETE, GET, PUT } from '@/service/ApiService.js';

const prefix = '/v1/api/banner';

export const fetchBanners = async () => {
    try {
        const response = await GET(prefix);
        return response.data.content;
    } catch (error) {
        console.error('Error fetching banners:', error);
        throw error;
    }
};

export const activateBanner = async (bannerId) => {
    try {
        if (!bannerId) {
            throw new Error('Banner ID is required');
        }
        return await PUT(`${prefix}/${bannerId}`);
    } catch (error) {
        console.error('Error activating banner:', error);
        throw error;
    }
};
export const deleteBanner = (bannerId) => {
    return DELETE(`/v1/api/banner/${bannerId}`);
};
