import { PUT } from '@/service/ApiService';

export const updatePromotion = async (id, data) => {
    const url = `/v1/api/promotion/${id}`;
    return await PUT(url, data);
};
