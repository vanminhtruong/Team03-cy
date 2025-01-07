import { DELETE } from '@/src/config/ApiService';

export const deleteImageProduct = async (id:any) => {
    return await DELETE(`/v1/api/image/product/${id}`, {
    })
}
