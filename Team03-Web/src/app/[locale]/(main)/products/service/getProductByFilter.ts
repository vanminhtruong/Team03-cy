import { GET } from '@/src/config/ApiService';

export const getProductByFilter = async (filters: { [key: string]: any }) => {
    const queryParams = new URLSearchParams(filters).toString();
    return await GET(`/v1/api/product/filter?${queryParams}`, {});
};
