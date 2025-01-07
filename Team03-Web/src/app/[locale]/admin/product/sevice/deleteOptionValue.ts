import { DELETE } from '@/src/config/ApiService';

export const deleteOptionValue= async (id:any) => {
    return await DELETE(`/v1/api/value/${id}`, {
    })
}
