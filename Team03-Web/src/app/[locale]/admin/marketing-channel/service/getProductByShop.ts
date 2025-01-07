import { GET } from '@/src/config/ApiService';

export const getProductByShop = async (id: any) => {
    const response = await GET(`/v1/api/product/shop/${id}?type=0`, {});
    return response.data.data.content;
};
