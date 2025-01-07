import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toast } from 'primereact/toast';
import { useTranslations } from 'next-intl';
import { connectWebSocket, type NotificationMessage } from '@/src/layout/components/Web/service/HeaderService';
import { fetchShopNotifications, markNotificationsAsRead, type NotificationResponse } from '../services/NotificationService';

interface NotificationBellProps {
    userId: string | null;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ userId }) => {
    const t = useTranslations('AdminTopbar');
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
    const [notificationCount, setNotificationCount] = useState(0);
    const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
    const wsConnectionRef = useRef<{ disconnect: () => void } | null>(null);
    const toast = useRef<Toast>(null);

    useEffect(() => {
        if (userId) {
            fetchNotifications(userId);
        }
    }, [userId]);

    const fetchNotifications = async (userId: string) => {
        try {
            const notificationsData = await fetchShopNotifications(userId);
            setNotifications(notificationsData);
            const unreadCount = notificationsData.filter((notification: NotificationResponse) => notification.isRead === 0).length;
            setNotificationCount(unreadCount);
            setHasUnreadNotifications(unreadCount > 0);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    useEffect(() => {
        if (userId) {
            console.log('Initializing WebSocket with userId:', userId);
            const connection = connectWebSocket(userId, {
                onNotification: (notification) => {
                    console.log('Notification matches userId, updating state');
                    setNotifications(prevNotifications => {
                        const newNotification: NotificationResponse = {
                            id: Date.now(),
                            title: notification.notifyTitle,
                            content: notification.notifyTitle,
                            userId: parseInt(userId),
                            adminId: null,
                            isRead: 0,
                            image: '',
                            shopId: notification.shopId,
                            createdAt: new Date().toISOString()
                        };
                        return [newNotification, ...prevNotifications];
                    });

                    setNotificationCount(prev => prev + 1);
                    setHasUnreadNotifications(true);
                    
                    toast.current?.show({
                        severity: 'info',
                        summary: t('notifications.newOrder'),
                        detail: notification.notifyTitle,
                        life: 5000
                    });
                },
                onError: (error) => {
                    console.error('WebSocket error:', error);
                }
            });
            
            if (connection) {
                wsConnectionRef.current = connection;
            }
        }
        return () => {
            if (wsConnectionRef.current) {
                wsConnectionRef.current.disconnect();
            }
        };
    }, [userId, t]);

    const handleMarkAsRead = async () => {
        if (userId) {
            try {
                setNotifications(prevNotifications => 
                    prevNotifications.map(notification => ({
                        ...notification,
                        isRead: 1
                    }))
                );
                setNotificationCount(0);
                setHasUnreadNotifications(false);
                setShowNotifications(false);

                await markNotificationsAsRead(userId);
            } catch (error) {
                console.error('Error marking notifications as read:', error);
                toast.current?.show({
                    severity: 'error',
                    summary: t('notifications.error'),
                    detail: t('notifications.markAsReadError'),
                    life: 3000
                });
            }
        }
    };

    const handleSingleNotificationClick = async (notification: NotificationResponse) => {
        if (userId && notification.isRead === 0) {
            try {
                // Update UI immediately
                setNotifications(prevNotifications => 
                    prevNotifications.map(n => 
                        n.id === notification.id ? { ...n, isRead: 1 } : n
                    )
                );
                const updatedUnreadCount = notifications.filter(n => 
                    n.id !== notification.id && n.isRead === 0
                ).length;
                setNotificationCount(updatedUnreadCount);
                setHasUnreadNotifications(updatedUnreadCount > 0);

                // Update in backend
                await markNotificationsAsRead(userId);
            } catch (error) {
                console.error('Error marking notification as read:', error);
                toast.current?.show({
                    severity: 'error',
                    summary: t('notifications.error'),
                    detail: t('notifications.markAsReadError'),
                    life: 3000
                });
            }
        }
    };

    return (
        <div className="relative">
            <Toast ref={toast} position="bottom-right" />
            <motion.div
                className="cursor-pointer relative"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                animate={hasUnreadNotifications ? {
                    rotate: [0, -10, 10, -10, 10, 0],
                    transition: {
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear"
                    }
                } : {
                    rotate: 0,
                    transition: {
                        duration: 0.2,
                        ease: "easeOut"
                    }
                }}
                onHoverStart={() => setShowNotifications(true)}
                onHoverEnd={() => setShowNotifications(false)}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                <AnimatePresence>
                    {notificationCount > 0 && (
                        <motion.span
                            className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[11px] font-medium rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        >
                            {notificationCount}
                        </motion.span>
                    )}
                </AnimatePresence>
            </motion.div>
            <AnimatePresence>
                {showNotifications && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute left-[-180px] mt-2 w-[400px] bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-sm:left-[-120px] max-h-[400px] overflow-hidden"
                        onHoverStart={() => setShowNotifications(true)}
                        onHoverEnd={() => setShowNotifications(false)}
                    >
                        <div className="p-3 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
                            <h3 className="text-lg font-semibold text-gray-800 py-2 ml-2">{t('notifications.title')}</h3>
                            {hasUnreadNotifications && (
                                <button
                                    onClick={handleMarkAsRead}
                                    className="text-sm text-[#000000] hover:text-btn-hover-dart font-medium"
                                >
                                    {t('notifications.markAsRead')}
                                </button>
                            )}
                        </div>
                        <div className="overflow-y-auto max-h-[300px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                            {notifications.length > 0 ? (
                                notifications.map((notification, index) => (
                                    <div 
                                        key={index} 
                                        className="p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                                        onClick={() => handleSingleNotificationClick(notification)}
                                    >
                                        <div className="flex items-start space-x-3">
                                            <div className="flex-shrink-0">
                                                {notification.image ? (
                                                    <img 
                                                        src={notification.image} 
                                                        alt="Product" 
                                                        className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                                                        onError={(e) => {
                                                            const target = e.target as HTMLImageElement;
                                                            target.src = '/layout/images/home-page/GRThree.png';
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                                                        <i className="pi pi-shopping-cart text-gray-400 text-lg w-[40px] h-8 flex items-center justify-center"></i>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start">
                                                    <h4 className="text-sm font-semibold text-gray-900 mb-1">
                                                        {notification.title}
                                                    </h4>
                                                    <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                                                        {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                <div className="mt-1 space-y-1">
                                                    {notification.content.split('\n').map((line, i) => (
                                                        <p key={i} className="text-sm text-gray-600">
                                                            {line.trim()}
                                                        </p>
                                                    ))}
                                                </div>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {new Date(notification.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            {notification.isRead === 0 && (
                                                <div className="flex-shrink-0">
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-4 text-center text-gray-500">
                                    {t('notifications.noNotifications')}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationBell; 