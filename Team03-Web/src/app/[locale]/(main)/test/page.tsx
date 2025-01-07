'use client';
import React, { useEffect, useState } from "react";
import { Client, IMessage } from '@stomp/stompjs';

interface StatusMessage {
    userId: string;
    status: string;
    shopId: string;
    orderId: string;
}

interface ReceivedMessage {
    id?: string;
    content?: string;
    timestamp?: string;
    [key: string]: any;
}

function Test() {
    const [stompClient, setStompClient] = useState<Client | null>(null);
    const [messages, setMessages] = useState<ReceivedMessage[]>([]);
    const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected');

    useEffect(() => {
        const client = new Client({
            brokerURL: 'https://team02-api.cyvietnam.id.vn/ws',
            reconnectDelay: 5000, 
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            onConnect: () => {
                console.log('Connected to WebSocket');
                setConnectionStatus('connected');
                client.subscribe('/user/sent', (message: IMessage) => {
                    try {
                        const receivedMessage = JSON.parse(message.body);
                        setMessages(prev => [...prev, receivedMessage]);
                    } catch (error) {
                        console.error('Error parsing message:', error);
                    }
                });
            },
            onDisconnect: () => {
                console.log('Disconnected from WebSocket');
                setConnectionStatus('disconnected');
            },
            onStompError: (frame) => {
                console.error('STOMP error:', frame);
                setConnectionStatus('disconnected');
            },
            onWebSocketError: (event) => {
                console.error('WebSocket error:', event);
                setConnectionStatus('disconnected');
            }
        });

        try {
            setConnectionStatus('connecting');
            client.activate();
            setStompClient(client);
        } catch (error) {
            console.error('Error activating STOMP client:', error);
            setConnectionStatus('disconnected');
        }

        return () => {
            if (client.active) {
                client.deactivate();
            }
        };
    }, []);

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">WebSocket Test</h1>
            <div className="mb-4">
                <span className={`inline-block px-2 py-1 rounded ${
                    connectionStatus === 'connected' ? 'bg-green-500' :
                    connectionStatus === 'connecting' ? 'bg-yellow-500' :
                    'bg-red-500'
                } text-white`}>
                    {connectionStatus.charAt(0).toUpperCase() + connectionStatus.slice(1)}
                </span>
            </div>
            <h2>Show: </h2>
            <div className="mt-4">
                <h2 className="text-xl font-semibold mb-2">Received Messages:</h2>
                <div className="space-y-2">
                    {messages.map((msg, index) => (
                        <pre key={index} className="bg-gray-100 p-2 rounded">
                            {JSON.stringify(msg, null, 2)}
                        </pre>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Test;