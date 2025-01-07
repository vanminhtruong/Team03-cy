import { GET } from '@/src/config/ApiService';

export const getProduct = async (id: number) => {
    return await GET(`/v1/api/product/shop/${id}?type=1`, {});
};
