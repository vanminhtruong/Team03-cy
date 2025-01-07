import { GET } from '@/src/config/ApiService';


export const getPromotionShop = async (id: number) => {
    return await GET(`/v1/api/promotion/${id}`, {});
};
