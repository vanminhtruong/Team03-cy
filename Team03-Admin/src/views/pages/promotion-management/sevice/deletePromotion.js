import { DELETE } from '@/service/ApiService.js';

export const deletePromotion = (id) => {
    const url = `/v1/api/promotion/${id}`;
    return DELETE(url);
};
