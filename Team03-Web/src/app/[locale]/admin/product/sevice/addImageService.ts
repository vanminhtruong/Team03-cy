import { POST } from '@/src/config/ApiService';

interface UploadResponse {
    success: boolean;
    message: string;
    data?: any;
}

export const addImage = async (file: File): Promise<UploadResponse> => {
    try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await POST('/v1/api/image/upload', formData);

        return response.data;
    } catch (error: unknown) {
        if (error instanceof Error) {
            throw new Error(error.message);
        }
        throw error;
    }
};
