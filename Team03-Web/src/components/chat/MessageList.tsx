import React, { useEffect, useRef, useState, useCallback } from 'react';
import dayjs from 'dayjs';
import useChatStore from '@/src/app/[locale]/(main)/stores/useChatStore';
import { ProgressSpinner } from 'primereact/progressspinner';

interface Message {
    messageId?: number;
    chatId?: string;
    senderId: string;
    senderName?: string;
    recipientId: string;
    recipientUsername?: string;
    message?: string;
    mediaUrls?: string[];
    sentAt: string;
}

interface GroupedItem {
    type: 'date' | 'message';
    date?: string;
    senderId?: string;
    senderName?: string;
    message?: string;
    mediaUrls?: string[];
    sentAt?: string;
    recipientId?: string;
}

interface MessageListProps {
    messages: Message[];
    idSender: string;
    recipientId: any;
    fetchMoreMessages: (page: number) => Promise<Message[]>;
}

const MessageList: React.FC<MessageListProps> = ({ messages, idSender, recipientId, fetchMoreMessages }) => {
    const messageEndRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const { shopName } = useChatStore();
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [prevScrollHeight, setPrevScrollHeight] = useState(0);

    const scrollToBottom = useCallback(() => {
        if (messageEndRef.current) {
            const offset = 5;
            const scrollPosition = messageEndRef.current.offsetTop + offset;
            containerRef.current?.scrollTo({ top: scrollPosition, behavior: 'smooth' });
        }
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [scrollToBottom]);

    const formatTime = useCallback((time: string) => {
        return dayjs(time).format('HH:mm:ss');
    }, []);

    const groupMessagesByDate = useCallback(
        (messages: Message[]): GroupedItem[] => {
            const grouped: GroupedItem[] = [];
            let currentDay: string | null = null;

            const filteredMessages = messages.filter((msg) => (msg.senderId === idSender && msg.recipientId === recipientId) || (msg.senderId === recipientId && msg.recipientId === idSender));

            filteredMessages.forEach((msg) => {
                const messageDate = dayjs(msg.sentAt).format('YYYY-MM-DD');

                if (!currentDay || messageDate !== currentDay) {
                    currentDay = messageDate;
                    grouped.push({ type: 'date', date: messageDate });
                }
                grouped.push({ type: 'message', ...msg });
            });

            return grouped;
        },
        [idSender, recipientId]
    );

    const renderMediaContent = useCallback((url: string) => {
        const isImage = url.match(/\.(jpeg|jpg|gif|png)$/i);

        const commonStyles = 'rounded-lg shadow-lg transition-transform duration-300 ';
        const mediaStyles = {
            width: '100%',
            height: 'auto',
            objectFit: 'cover' as const
        };

        return isImage ? <img src={url} alt="media" className={commonStyles} style={mediaStyles} /> : <video src={url} controls className={commonStyles} style={mediaStyles} />;
    }, []);

    const renderMediaDescription = useCallback(
        (item: GroupedItem) => {
            if (!item.mediaUrls?.length) return null;

            const isImage = item.mediaUrls[0].match(/\.(jpeg|jpg|gif|png)$/i);
            const isVideo = item.mediaUrls[0].match(/\.(ogg|webm|mp4)$/i);
            const isSender = item.senderId === idSender;

            if (isImage) return isSender ? 'Bạn đã gửi 1 ảnh' : `${shopName} đã gửi 1 ảnh`;
            if (isVideo) return isSender ? 'Bạn đã gửi 1 video' : `${shopName} đã gửi 1 video`;
            return '';
        },
        [idSender]
    );

    const renderDateSeparator = useCallback(
        (date: string) => (
            <div className="flex justify-between w-full mx-auto my-6">
                <div className="w-1/3 transform -translate-y-1/2 border-b border-gray-300" />
                <span className="bg-white px-4 text-gray-500 text-sm relative z-10">{dayjs(date).format('DD/MM/YYYY')}</span>
                <div className="w-1/3 transform -translate-y-1/2 border-b border-gray-300" />
            </div>
        ),
        []
    );

    const renderMessage = useCallback(
        (item: GroupedItem, index: number) => {
            const isSender = item.senderId === idSender;
            const messageClasses = `my-3 p-4 rounded-lg max-w-[70%] ${isSender ? 'bg-gray-400 border border-gray-300 self-end text-right ml-auto text-black' : 'bg-gray-100 border border-gray-300 self-start mr-auto text-black'}`;

            return (
                <div key={`message-${index}`} className={messageClasses}>
                    <div className="w-full">
                        <div className={`flex w-full mb-2 text-md font-bold ${isSender ? 'justify-end' : 'justify-start'}`}>{isSender ? 'Bạn' : shopName || 'Người dùng'}</div>

                        {item.message ? <p className="text-sm w-full max-w-[300px]  text-black break-words">{item.message}</p> : <p className="text-sm  w-full max-w-[300px]  text-gray-600 break-words">{renderMediaDescription(item)}</p>}

                        {item.mediaUrls && item.mediaUrls.length > 0 && (
                            <div className="flex flex-col gap-2 mt-3">
                                {item.mediaUrls.map((url, idx) => (
                                    <div key={idx} className="relative">
                                        {renderMediaContent(url)}
                                    </div>
                                ))}
                            </div>
                        )}

                        <span className="text-xs text-gray-500 mt-1">{formatTime(item.sentAt!)}</span>
                    </div>
                </div>
            );
        },
        [idSender, shopName, renderMediaContent, renderMediaDescription, formatTime]
    );

    const handleScroll = async (e: React.UIEvent<HTMLDivElement>) => {
        const container = e.currentTarget;

        if (container.scrollTop === 0 && !loading && hasMore) {
            try {
                setLoading(true);
                setPrevScrollHeight(container.scrollHeight);

                const newMessages = await fetchMoreMessages(page);

                if (newMessages.length === 0) {
                    setHasMore(false);
                } else {
                    setPage((prev) => prev + 1);
                }

                setTimeout(() => {
                    if (containerRef.current) {
                        const newScrollHeight = containerRef.current.scrollHeight;
                        containerRef.current.scrollTop = newScrollHeight - prevScrollHeight;
                    }
                }, 0);
            } catch (error) {
                console.error('Error loading more messages:', error);
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div ref={containerRef} className="h-full overflow-y-auto scroll-container pb-24 p-4 bg-white" onScroll={handleScroll}>
            {loading && (
                <div className="flex justify-center items-center py-4">
                    <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="8" fill="var(--surface-ground)" animationDuration=".5s" />
                </div>
            )}

            {groupMessagesByDate(messages).map((item, index) => (item.type === 'date' ? <div key={`date-${index}`}>{renderDateSeparator(item.date!)}</div> : renderMessage(item, index)))}

            <div ref={messageEndRef} />
        </div>
    );
};

export default MessageList;
