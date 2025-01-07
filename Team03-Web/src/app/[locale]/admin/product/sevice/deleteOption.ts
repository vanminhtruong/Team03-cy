import { DELETE } from '@/src/config/ApiService';

export const deleteOption = async (id: any, productId: any) => {
    return await DELETE(`/v1/api/option/${id}?productId=${productId}`, {});
}


