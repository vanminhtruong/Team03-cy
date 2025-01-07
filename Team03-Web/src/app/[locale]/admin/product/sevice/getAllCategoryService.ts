import { GET } from '@/src/config/ApiService';

export const getAllCategory = async () => {
    return await GET('/v1/api/category', {

    })
}
