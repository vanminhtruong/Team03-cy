import { GET } from '@/service/ApiService';

export const getShop = (shopName, shopStatus) => {
    let url = '/v1/api/admin/find-shop-name';

    const queryParams = [];

    if (shopName) {
        queryParams.push(`shop_name=${shopName}`);
    }

    if (shopStatus) {
        queryParams.push(`shop_status=${shopStatus}`);
    }

    if (queryParams.length > 0) {
        url += `?${queryParams.join('&')}`;
    }

    return GET(url);
};
