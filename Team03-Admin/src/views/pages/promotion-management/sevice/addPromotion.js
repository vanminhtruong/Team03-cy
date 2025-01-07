import { POST } from '@/service/ApiService';

export const addPromotion = async (data) => {
    const url = '/v1/api/promotion';
    return await POST(url, data);
};
