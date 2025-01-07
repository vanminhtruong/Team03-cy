import { GET } from '@/src/config/ApiService';

export const getProductByShop = async (id: any, idShop: any) => {
    const response = await GET(`v1/api/product/promotion/${id}?type=1&shopId=${idShop}`, {});
    return response.data.data.content;
};
