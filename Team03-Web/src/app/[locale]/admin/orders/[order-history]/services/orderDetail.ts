import { GET } from '@/src/config/ApiService';
import { Client, Message, IFrame } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const WEBSOCKET_URL = 'https://team03-api.cyvietnam.id.vn/ws';

export interface OrderStatusMessage {
    orderId: number;
    shopId: number;
    status: number;
    userId: number;
}

interface OrderDetailResponse {
  status: number;
  message: string;
  data: {
    order: {
      id: number;
      totalPrice: number;
      phoneReception: string | null;
      shippingAddress: string;
      statusCheckout: number;
      methodCheckout: string;
      createdAt: string;
      orderCode: string;
      user: {
        userId: number;
        name: string;
        username: string;
        email: string;
        phone: string;
        addresses: Array<{
          addressLine1: string;
          addressLine2: string;
        }>;
      };
    };
    orderDetails: Array<{
      id: number;
      quantity: number;
      price: number;
      productName: string;
      option1: number;
      option2: number;
      skuDto: {
        image: string;
        option1: {
          name: string;
          value: {
            name: string;
          };
        };
        option2: {
          name: string;
          value: {
            name: string;
          };
        };
      };
    }>;
    orderTracking: {
      status: number;
      createdAt: string;
      note: string | null;
      paidDate: string | null;
    };
  };
  timestamp: string;
}

// Function to fetch order details
const fetchOrderDetails = async (params: { shopId: string; orderId: string }) => {
  try {
    if (!params.shopId || !params.orderId) {
      throw new Error('Missing shopId or orderId in URL parameters');
    }

    const response = await GET(`/v1/api/shop/${params.shopId}/detail-order?orderId=${params.orderId}`);
    return response.data.data as OrderDetailResponse['data'];
  } catch (error) {
    console.error('Error fetching order details:', error);
    throw error;
  }
};

// Create WebSocket client instance
export const createWebSocketClient = () => {
  const socket = new SockJS(WEBSOCKET_URL);
  return new Client({
    webSocketFactory: () => socket,
    brokerURL: WEBSOCKET_URL,
    debug: (str) => console.log('STOMP:', str),
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000
  });
};

export const initializeWebSocket = (
  client: Client,
  onConnect?: () => void,
  onError?: (error: IFrame) => void,
  onStatusUpdate?: (message: OrderStatusMessage) => void
) => {
  client.onConnect = () => {
    console.log('WebSocket connected successfully');
    if (onStatusUpdate) {
      client.subscribe('/user/sent', (message: Message) => {
        try {
          const statusUpdate: OrderStatusMessage = JSON.parse(message.body);
          onStatusUpdate(statusUpdate);
        } catch (error) {
          console.error('Error parsing status update:', error);
        }
      });
    }

    onConnect?.();
  };

  client.onStompError = (frame: IFrame) => {
    console.error('WebSocket connection error:', frame.body);
    onError?.(frame);
  };

  try {
    client.activate();
  } catch (error) {
    console.error('Error activating WebSocket client:', error);
    throw error;
  }

  return () => {
    if (client.connected) {
      client.deactivate();
    }
  };
};

export const sendStatusUpdate = (
  client: Client, 
  message: OrderStatusMessage
): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!client?.connected) {
      console.log('WebSocket Connection Status:', {
        connected: client?.connected,
        client: client
      });
      reject(new Error('WebSocket not connected'));
      return;
    }

    try {
      console.log('Sending WebSocket Message:', {
        destination: '/app/changeStatusShipping',
        message: message
      });
      client.publish({
        destination: '/app/changeStatusShipping',
        body: JSON.stringify(message),
        headers: { 'content-type': 'application/json' }
      });
      console.log('WebSocket Message Sent Successfully');
      resolve();
    } catch (error) {
      console.error('Error sending status update:', error);
      reject(error);
    }
  });
};

export default fetchOrderDetails; 