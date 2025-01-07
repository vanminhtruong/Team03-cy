import { AxiosResponse } from 'axios';
import { GET, POST } from '@/src/config/ApiService';
import { Client, Message, IFrame } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const WEBSOCKET_URL = 'https://team03-api.cyvietnam.id.vn/ws';
const API_URL = 'https://team03-api.cyvietnam.id.vn';

export interface OrderResponse {
    status: number;
    message?: string;
    data: Order[];
}

export interface Order {
    id: number;
    shopId: number;
    orderId?: number;
    productId?: number;
    quantity: number;
    price: number;
    oldPrice: number;
    newPrice: number;
    option1: number;
    option2: number;
    productName: string;
    status: number;
    shippingStatus?: number;
    hasFeedback?: number | null;
    user: {
        userId: number;
        name: string;
        username: string;
        email: string | null;
        phone: string;
        shop_name: string;
        shop_status: number;
    };
    createdAt: string | null;
    skuDto?: {
        variantId: number;
        productId: number;
        option1: {
            optionId: number;
            name: string;
            value: {
                valueId: number;
                name: string;
            };
        };
        option2: {
            optionId: number;
            name: string;
            value: {
                valueId: number;
                name: string;
            };
        };
        oldPrice: number;
        newPrice: number;
        image?: string;
    };
}

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

export const fetchUserOrders = async (params: { userId: string; shippingStatus?: string }): Promise<OrderResponse> => {
    const { userId, shippingStatus = "0" } = params;
    
    try {
        const response: AxiosResponse<any> = await GET(`/v1/api/user-tracking/${userId}/ship-status?shippingStatus=${shippingStatus}`);

        if (!response || (response.status !== 200 && response.status !== 201)) {
            throw new Error(`API error: ${response?.data?.message || 'Unknown error'}`);
        }

        const orders = Array.isArray(response.data) 
            ? response.data 
            : response.data?.content || response.data?.data || [];

        return {
            status: response.status,
            message: response.data?.message,
            data: orders
        };
    } catch (error) {
        console.error('Error fetching orders:', error);
        throw error;
    }
}

export const fetchAllUserOrders = async (userId: string): Promise<OrderResponse> => {
    try {
        const response: AxiosResponse<any> = await GET(`/v1/api/user-tracking/${userId}`);

        if (!response || (response.status !== 200 && response.status !== 201)) {
            throw new Error(`API error: ${response?.data?.message || 'Unknown error'}`);
        }

        return {
            status: response.status,
            message: response.data?.message,
            data: response.data?.data || []
        };
    } catch (error) {
        console.error('Error fetching all user orders:', error);
        throw error;
    }
};

export const fetchUserOrdersByCode = async (userId: string, orderCode: string): Promise<OrderResponse> => {
    try {
        const response: AxiosResponse<any> = await GET(`/v1/api/user-tracking/${userId}/find-order?orderCode=${orderCode}`);

        if (!response || (response.status !== 200 && response.status !== 201)) {
            throw new Error(`API error: ${response?.data?.message || 'Unknown error'}`);
        }

        return {
            status: response.status,
            message: response.data?.message,
            data: response.data?.data || []
        };
    } catch (error) {
        console.error('Error fetching orders by code:', error);
        throw error;
    }
};

export const connectWebSocket = (onStatusUpdate: (statusUpdate: OrderStatusMessage) => void) => {
    const client = new Client({
        webSocketFactory: () => new SockJS(WEBSOCKET_URL),
        onConnect: () => {
            console.log('Connected to WebSocket');
            client.subscribe('/user/sent', (message: Message) => {
                const statusUpdate: OrderStatusMessage = JSON.parse(message.body);
                onStatusUpdate(statusUpdate);
            });
        },
        onStompError: (frame: IFrame) => {
            console.error('WebSocket connection error:', frame.body);
        }
    });

    client.activate();
    return client;
};

export const submitFeedback = async (
    userId: string,
    productId: string | number,
    rating: number,
    content: string,
    files?: File[]
): Promise<{ success: boolean; message?: string }> => {
    try {
        const formData = new FormData();
        formData.append('userId', userId);
        formData.append('productId', productId.toString());
        formData.append('rate', rating.toString());
        formData.append('content', content);
        
        if (files && files.length > 0) {
            files.forEach((file) => {
                formData.append('files', file);
            });
        }

        const response = await fetch(`${API_URL}/v1/api/feedback`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Failed to submit review');
        }

        return { success: true };
    } catch (error) {
        console.error('Error submitting feedback:', error);
        return { 
            success: false, 
            message: error instanceof Error ? error.message : 'Failed to submit review' 
        };
    }
};

export const updateOrderTracking = async (orderDetailId: number): Promise<{ success: boolean; message?: string }> => {
    try {
        const response = await fetch(`${API_URL}/v1/api/user-tracking/${orderDetailId}`, {
            method: 'PUT',
            headers: {
                'accept': '*/*'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to update order tracking');
        }

        return { success: true };
    } catch (error) {
        console.error('Error updating order tracking:', error);
        return { 
            success: false, 
            message: error instanceof Error ? error.message : 'Failed to update order tracking' 
        };
    }
};

export const buyAgain = async (userId: number, productId: number, quantity: number) => {
    try {
        const response = await POST(`/v1/api/cart/${userId}`, {
            userId: userId,
            productId: productId,
            quantity: quantity
        });
        
        if (!response || (response.status !== 200 && response.status !== 201)) {
            throw new Error(`API error: ${response?.data?.message || 'Unknown error'}`);
        }

        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        console.error('Error buying again:', error);
        throw error;
    }
};

export const cancelOrder = async (request: StatusChangeRequest) => {
    try {
        const response = await fetch(`${API_URL}/v1/api/user-tracking/change-status-ship`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request)
        });

        return { ok: response.ok };
    } catch (error) {
        console.error('Error cancelling order:', error);
        throw error;
    }
};

export const receiveOrder = async (request: StatusChangeRequest) => {
    try {
        const response = await fetch(`${API_URL}/v1/api/user-tracking/change-status-ship`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request)
        });

        return { ok: response.ok };
    } catch (error) {
        console.error('Error receiving order:', error);
        throw error;
    }
};
