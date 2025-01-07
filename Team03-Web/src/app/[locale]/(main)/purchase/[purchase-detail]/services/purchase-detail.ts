import { GET } from '@/src/config/ApiService';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

const WEBSOCKET_URL = 'https://team03-api.cyvietnam.id.vn/ws';
const API_URL = 'https://team03-api.cyvietnam.id.vn/v1/api';

export interface OrderStatusMessage {
    orderId: number;
    shopId: number;
    status: number;
    userId: number;
}

export interface StatusChangeRequest {
    note: string;
    content: string;
    userId: number;
    status: number;
    shopId: number;
    orderId: number;
}

export const getPurchaseDetail = async (userId: string | null, params?: any) => {
    if (!userId) {
        throw new Error('User ID is required');
    }
    
    try {
        const response = await GET(`/v1/api/user-tracking/${userId}/detail-order`, params);
        return response;
    } catch (error) {
        console.error('Error fetching purchase details:', error);
        throw error;
    }
};

export const cancelOrder = async (request: StatusChangeRequest) => {
    try {
        const response = await fetch(`${API_URL}/user-tracking/change-status-ship`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': '*/*'
            },
            body: JSON.stringify(request)
        });
        
        if (!response.ok) {
            throw new Error('Failed to cancel order');
        }
        
        return response;
    } catch (error) {
        console.error('Error cancelling order:', error);
        throw error;
    }
};

export const receiveOrder = async (request: StatusChangeRequest) => {
    try {
        const response = await fetch(`${API_URL}/user-tracking/change-status-ship`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': '*/*'
            },
            body: JSON.stringify(request)
        });
        
        if (!response.ok) {
            throw new Error('Failed to confirm order receipt');
        }
        
        return response;
    } catch (error) {
        console.error('Error confirming order receipt:', error);
        throw error;
    }
};

export const connectWebSocket = (onStatusUpdate: (message: OrderStatusMessage) => void) => {
    const socket = new SockJS(WEBSOCKET_URL);
    const client = Stomp.over(socket);
    
    client.connect({}, () => {
        console.log('Successfully connected to WebSocket');
        client.subscribe('/user/sent', (payload) => {
            const message = JSON.parse(payload.body);
            onStatusUpdate(message);
        });
    }, (error: any) => {
        console.error('WebSocket connection failed:', error);
    });

    return client;
};