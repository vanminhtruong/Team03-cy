import SockJS from 'sockjs-client';
import { Client, IMessage } from '@stomp/stompjs';
import useChatStore from '@/src/app/[locale]/(main)/stores/useChatStore';

export const createStompClient = (senderId: string, onMessageReceived: (message: any) => void, onConnect: () => void, onDisconnect: () => void): Client => {
    const socket = new SockJS('https://team03-api.cyvietnam.id.vn/ws');
    const client = new Client({
        webSocketFactory: () => socket,
        onConnect: () => {
            console.log('STOMP connected');
            onConnect();
            client.subscribe(`/user/${senderId}/queue/messages`, (message: any) => {
                const { setStateChat } = useChatStore.getState();
                try {
                    const messageData = JSON.parse(message.body);
                    console.log('Received message:', messageData);
                    setStateChat([messageData]);
                    onMessageReceived(messageData);
                } catch (error) {
                    console.error('Error parsing message:', error);
                }
            });
        },
        onDisconnect: () => {
            console.log('STOMP disconnected');
            onDisconnect();
        }
    });

    client.activate();
    return client;
};
