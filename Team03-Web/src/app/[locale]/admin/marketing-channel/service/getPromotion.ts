import { GET } from '@/src/config/ApiService';

export const getPromotion = async () => {
    return await GET(`/v1/api/promotion`, {});
};
