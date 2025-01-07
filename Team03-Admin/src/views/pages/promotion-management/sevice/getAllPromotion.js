import { GET } from '@/service/ApiService';

export const getAllPromotion = async () => {
    const url = '/v1/api/promotion';
    return await GET(url);
};
