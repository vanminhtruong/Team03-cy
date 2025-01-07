import { POST, GET, PUT } from '@/src/config/ApiService';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

export interface NotificationResponse {
    id: number;
    title: string;
    content: string;
    userId: number;
    adminId: number | null;
    isRead: number;
    image: string;
    shopUserId: number;
    orderId: number;
    createdAt: string;
}

export const fetchNotifications = async (userId: string): Promise<NotificationResponse[]> => {
    try {
        const response = await GET(`/v1/api/notification/${userId}`);
        if (response.data.status === 200) {
            return response.data.data;
        }
        return [];
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return [];
    }
};

export const updateNotificationStatus = async (userId: string): Promise<boolean> => {
    try {
        const response = await PUT(`/v1/api/notification/${userId}`, {});
        return response.status === 200;
    } catch (error) {
        console.error('Error updating notification status:', error);
        return false;
    }
};

export const logOut = async (token: string) => {
    return await POST(`/v1/api/authentication/logout?token=${encodeURIComponent(token)}`, {});
};

export const countCart = async (id: any) => {
    return await GET(`/v1/api/cart/${id}/quantity`, {});
};

export type NotificationMessage = {
    notifyTitle: string;
    shopId: number;
};

interface StompFrame {
    body: string;
}

export type WebSocketHandlers = {
    onNotification: (notification: NotificationMessage) => void;
    onError?: (error: any) => void;
};

export const connectWebSocket = (userId: string, handlers: WebSocketHandlers) => {
    try {
        console.log('Starting WebSocket connection to:', 'https://team03-api.cyvietnam.id.vn/ws');
        
        const socket = new SockJS('https://team03-api.cyvietnam.id.vn/ws');
        const stompClient = Stomp.over(socket);

        const onConnected = () => {
            console.log('WebSocket Connected Successfully');
            console.log('Subscribing to /note/notify channel');
            
            stompClient.subscribe('/note/notify', (frame: StompFrame) => {
                console.log('Received WebSocket message:', frame);
                try {
                    const notification = JSON.parse(frame.body) as NotificationMessage;
                    console.log('Parsed notification:', notification);
                    console.log('Current userId:', userId);
                    console.log('Notification shopId:', notification.shopId);
                    
                    if (notification.shopId === parseInt(userId)) {
                        console.log('Notification matches userId, calling handler');
                        handlers.onNotification(notification);
                    } else {
                        console.log('Notification shopId does not match userId, ignoring');
                    }
                } catch (error) {
                    console.error('Error parsing notification:', error);
                }
            });
        };

        const onError = (error: any) => {
            console.error('WebSocket connection failed:', error);
            if (handlers.onError) {
                handlers.onError(error);
            }
        };

        stompClient.debug = () => {};
        
        stompClient.connect({}, onConnected, onError);
        
        return {
            client: stompClient,
            disconnect: () => {
                if (stompClient.connected) {
                    console.log('Disconnecting WebSocket');
                    stompClient.disconnect(() => {
                        console.log('Disconnected from WebSocket');
                    });
                }
            }
        };
    } catch (error) {
        console.error('Error setting up WebSocket:', error);
        if (handlers.onError) {
            handlers.onError(error);
        }
        return null;
    }
};
