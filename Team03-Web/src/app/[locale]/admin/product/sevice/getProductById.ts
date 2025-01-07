import { GET } from '@/src/config/ApiService';

export const getProductById = async (id: number) => {
    return await GET(`/v1/api/product/${id}?type=0 `, {});
};
