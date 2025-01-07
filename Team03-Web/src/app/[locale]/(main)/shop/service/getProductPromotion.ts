import { GET } from '@/src/config/ApiService';

export const getProductPromotion = async (id: number, idShop: number) => {
    return await GET(`/v1/api/product/promotion/${id}?type=1&shopId=${idShop}`, {});
};
