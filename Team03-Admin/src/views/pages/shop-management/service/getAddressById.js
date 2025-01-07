import { GET } from '@/service/ApiService';

export const getAddressById = (id) => {
    const url = `/v1/api/address/${id}/full-address`;
    return GET(url);
};
