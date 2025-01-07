import { DELETE, GET, POST } from '@/src/config/ApiService';

export const uploadMediaFiles = async (formData: FormData) => {
    try {
        const response = await POST('/v1/api/image/chat/upload', formData);
        return response.data || [];
    } catch (error) {
        console.error('Error uploading media files:', error);
        return [];
    }
};
export const fetchMessages = async (senderId: any, recipientId: any, page: any, size: any) => {
    try {
        const response = await GET(`/v1/api/message/${senderId}/${recipientId}?page=${page}&size=${size}`);
        return response.data?.data?.content.reverse() || [];
    } catch (error) {
        console.error('Error fetching messages:', error);
        return [];
    }
};

export const fetchUsersChatBySenderId = async (useIdBuyer: any) => {
    try {
        const response = await GET(`v1/api/message/${useIdBuyer}`);
        return response.data?.data || [];
    } catch (error) {
        console.error('Error fetching chat data:', error);
        return [];
    }
};
export const deleteChat = async (sendId: any, chattId: any) => {
    try {
        return await DELETE(`/v1/api/message/${sendId}/${chattId}`);
    } catch (error) {}
};
