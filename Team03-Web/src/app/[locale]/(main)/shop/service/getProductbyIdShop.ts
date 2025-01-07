import { GET } from '@/src/config/ApiService';


export const getProductbyIdShop = async (id: number, pageSize: number , pageIndex: number) => {
    const params = new URLSearchParams({
        pageSize: pageSize.toString(),
        pageIndex: pageIndex.toString()
    });

    return await GET(`/v1/api/product/shop/${id}?type=1&${params.toString()}`, {});
};
