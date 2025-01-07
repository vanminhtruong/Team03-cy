import { PUT } from '@/service/ApiService';

export const updateStatustShop = (idShop, status, reason) => {
    const url = `/v1/api/admin/${idShop}/switching-status-for-shop`;
    const body = {
        status: status,
        reason: reason
    };

    return PUT(url, body);
};
