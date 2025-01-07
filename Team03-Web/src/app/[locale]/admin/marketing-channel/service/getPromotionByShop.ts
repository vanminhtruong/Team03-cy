import { GET } from '@/src/config/ApiService';

export const getPromotionByShop = async (id: number) => {
    return await GET(`/v1/api/promotion/${id}`, {});
};
