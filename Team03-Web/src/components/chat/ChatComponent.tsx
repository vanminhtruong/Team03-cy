import React, { useEffect, useRef, useState } from 'react';
import Cookies from 'js-cookie';
import { Client } from '@stomp/stompjs';
import { createStompClient } from '@/src/app/[locale]/(main)/products/chat/StompConfig';
import { fetchMessages, fetchUsersChatBySenderId, uploadMediaFiles } from '@/src/app/[locale]/(main)/service/chatService';
import useChatStore from '@/src/app/[locale]/(main)/stores/useChatStore';
import Sidebar from './Sidebar';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

interface Message {
    messageId?: number;
    chatId?: string;
    senderId: string;
    senderName?: string;
    recipientId: any;
    recipientUsername?: any;
    message?: string;
    mediaUrls?: string[];
    sentAt: string;
}

interface ChatComponentProps {
    isChatOpen: boolean;
}

const ChatComponent: React.FC<ChatComponentProps> = ({ isChatOpen }) => {
    const { openChat, setUser, stateChat, imageShop, shopName, setOpenChat, recipientId } = useChatStore();

    const [messages, setMessages] = useState<Message[]>([]);
    const [idSender, setIdSender] = useState<string | null>(null);
    const [message, setMessage] = useState<string>('');
    const [mediaFiles, setMediaFiles] = useState<FileList | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [loading, setLoading] = useState(false);
    const [connectionError, setConnectionError] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    const client = useRef<Client | null>(null);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    const token = Cookies.get('token');

    const initializeStompClient = (userId: string) => {
        try {
            client.current?.deactivate();

            client.current = createStompClient(
                userId,
                (newMessage: Message) => {
                    setMessages((prev) => [...prev, newMessage]);
                },
                () => {
                    setIsConnected(true);
                    setConnectionError(null);
                },
                () => {
                    setIsConnected(false);
                    setConnectionError('Connection lost. Attempting to reconnect...');
                    if (idSender) {
                        setTimeout(() => initializeStompClient(idSender), 5000);
                    }
                }
            );

            client.current.activate();
        } catch (error) {
            console.error('Failed to initialize STOMP client:', error);
            setConnectionError('Failed to establish connection. Retrying...');
            if (idSender) {
                setTimeout(() => initializeStompClient(idSender), 5000);
            }
        }
    };

    useEffect(() => {
        if (token) {
            const userData = localStorage.getItem('user');
            if (userData) {
                const user = JSON.parse(userData);
                setIdSender(user.state.id);
            }
        }
    }, [token]);

    useEffect(() => {
        if (idSender) {
            initializeStompClient(idSender);
            return () => {
                client.current?.deactivate();
            };
        }
    }, [idSender]);

    useEffect(() => {
        if (idSender) {
            const fetchChatUsers = async () => {
                try {
                    const res = await fetchUsersChatBySenderId(idSender);
                    setUser(res);
                } catch (error) {
                    console.error('Failed to fetch chat users:', error);
                }
            };
            fetchChatUsers();
        }
    }, [idSender, stateChat, setUser]);

    const fetchMoreMessages = async (pageNum: number): Promise<Message[]> => {
        if (!recipientId || !idSender) return [];

        try {
            setLoading(true);
            const userIdString = idSender.toString();
            const recipientIdString = recipientId.toString();
            const newMessages = await fetchMessages(userIdString, recipientIdString, pageNum, 20);

            if (newMessages.length === 0) {
                setHasMore(false);
            } else {
                setMessages((prev) => [...newMessages, ...prev]);
                setPage(pageNum + 1);
            }

            return newMessages;
        } catch (error) {
            console.error('Failed to fetch more messages:', error);
            return [];
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchInitialMessages = async () => {
            if (!recipientId || !idSender) return;
            try {
                setLoading(true);
                const userIdString = idSender.toString();
                const recipientIdString = recipientId.toString();
                const initialMessages = await fetchMessages(userIdString, recipientIdString, 0, 20);
                setMessages(initialMessages);
                setPage(1);
                setHasMore(true);
            } catch (error) {
                console.error('Failed to fetch initial messages:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialMessages();
    }, [recipientId, idSender]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async () => {
        if (!message && (!mediaFiles || mediaFiles.length === 0)) return;
        if (!recipientId || !idSender) return;
        if (!client.current?.connected) {
            setConnectionError('Not connected to chat server. Please wait...');
            return;
        }

        setLoading(true);

        try {
            const chatMessage: Message = {
                messageId: Date.now(),
                chatId: `${idSender}_${recipientId}`,
                senderId: idSender,
                senderName: 'me',
                recipientId: recipientId,
                recipientUsername: shopName,
                message: message,
                mediaUrls: [],
                sentAt: new Date().toISOString()
            };

            if (mediaFiles && mediaFiles.length > 0) {
                const formData = new FormData();
                Array.from(mediaFiles).forEach((file) => formData.append('files', file));
                chatMessage.mediaUrls = await uploadMediaFiles(formData);
            }

            client.current.publish({
                destination: '/app/chat',
                body: JSON.stringify(chatMessage)
            });

            setMessages((prevMessages) => [...prevMessages, chatMessage]);
            setMessage('');
            setMediaFiles(null);
            setConnectionError(null);
        } catch (error) {
            console.error('Failed to send message:', error);
            setConnectionError('Failed to send message. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveFile = (index: number) => {
        if (mediaFiles) {
            const filesArray = Array.from(mediaFiles);
            filesArray.splice(index, 1);
            const updatedFiles = new DataTransfer();
            filesArray.forEach((file) => updatedFiles.items.add(file));
            setMediaFiles(updatedFiles.files);
        }
    };

    if (!isChatOpen) return null;

    return (
        <div className="fixed mb-4 bottom-16 right-4 bg-[#2C3E50] shadow-lg rounded-lg w-full h-full max-w-[800px] max-h-[600px] z-50 flex">
            <Sidebar />
            <div className="flex-1 flex flex-col relative">
                <ChatHeader shopName={shopName} toggleChat={() => setOpenChat(!openChat)} profilePicture={imageShop} />

                {connectionError && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 text-sm">{connectionError}</div>}

                {recipientId ? (
                    <MessageList messages={messages} idSender={idSender || ''} recipientId={recipientId} fetchMoreMessages={fetchMoreMessages} />
                ) : (
                    <div className="flex-1 bg-white flex items-center justify-center">
                        <p className="text-gray-500">Choose a conversation to start</p>
                    </div>
                )}
                <MessageInput message={message} setMessage={setMessage} mediaFiles={mediaFiles} setMediaFiles={setMediaFiles} handleSendMessage={handleSendMessage} handleRemoveFile={handleRemoveFile} loading={loading} isConnected={isConnected} />

                <div ref={messagesEndRef} />
            </div>
        </div>
    );
};

export default ChatComponent;
