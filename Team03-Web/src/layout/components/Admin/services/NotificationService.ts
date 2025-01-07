import { GET, PUT } from '@/src/config/ApiService';

export interface NotificationResponse {
    id: number;
    title: string;
    content: string;
    userId: number;
    adminId: number | null;
    isRead: number;
    image: string;
    shopId: number;
    createdAt: string;
}

export const fetchShopNotifications = async (userId: string): Promise<NotificationResponse[]> => {
    try {
        const response = await GET(`/v1/api/notification/${userId}/shop`);
        if (response?.data?.status === 200) {
            return response.data.data;
        }
        return [];
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return [];
    }
};

export const markNotificationsAsRead = async (shopId: string) => {
    try {
        const response = await PUT(`/v1/api/notification/${shopId}/shop`, {});
        return response?.data?.status === 200;
    } catch (error) {
        console.error('Error marking notifications as read:', error);
        return false;
    }
}; 