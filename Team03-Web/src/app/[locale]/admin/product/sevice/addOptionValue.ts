import { POST } from '@/src/config/ApiService';

export const addOptionValueService = async (id: any, data: any) => {
    try {
        const url = `/v1/api/value/${id}?name=${data.name}&optionId=${data.optionId}`;
        return await POST(url, data);
    } catch (error) {
        console.error('Error updating stock:', error);
        throw error;
    }
};
