'use client';
import React, { useEffect, useState, useRef } from 'react';
import { Toast } from 'primereact/toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { fetchNotifications, updateNotificationStatus, type NotificationResponse } from '../service/HeaderService';
import { useRouter } from 'next/navigation';

interface NotificationBellProps {
}

export default function NotificationBell({}: NotificationBellProps) {
    const toast = useRef<Toast>(null);
    const t = useTranslations('HomePage');
    const [isLoading, setIsLoading] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
    const [notificationCount, setNotificationCount] = useState(0);
    const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
    const router = useRouter();

    const fetchAndUpdateNotifications = async () => {
        try {
            const userData = localStorage.getItem('user');
            const userId = userData ? JSON.parse(userData).state.id : null;
            if (userId) {
                const notificationsData = await fetchNotifications(userId.toString());
                
                notificationsData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                
                const unreadCount = notificationsData.filter(notification => notification.isRead === 0).length;
                
                setNotifications(notificationsData);
                setNotificationCount(unreadCount);
                setHasUnreadNotifications(unreadCount > 0);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const handleMarkAsRead = async () => {
        try {
            setIsLoading(true);
            const userData = localStorage.getItem('user');
            const userId = userData ? JSON.parse(userData).state.id : null;
            if (userId) {
                await updateNotificationStatus(userId.toString());
                const updatedNotifications = notifications.map(notification => ({
                    ...notification,
                    isRead: 1
                }));
                
                setNotifications(updatedNotifications);
                setHasUnreadNotifications(false);
                setNotificationCount(0);
            }
        } catch (error) {
            console.error('Error marking notifications as read:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSingleNotificationClick = async (notification: NotificationResponse) => {
        try {
            if (notification.isRead === 0) {
                const userData = localStorage.getItem('user');
                const userId = userData ? JSON.parse(userData).state.id : null;
                if (userId) {
                    const updatedNotifications = notifications.map(n => 
                        n.id === notification.id ? { ...n, isRead: 1 } : n
                    );
                    const unreadCount = updatedNotifications.filter(n => n.isRead === 0).length;
                    
                    setNotifications(updatedNotifications);
                    setNotificationCount(unreadCount);
                    setHasUnreadNotifications(unreadCount > 0);
                    await updateNotificationStatus(userId.toString());
                }
            }
            
            const currentLang = window.location.pathname.split('/')[1];
            router.push(`/${currentLang}/purchase/purchase-detail?userId=${notification.userId}&orderId=${notification.orderId}&shopId=${notification.shopUserId}`);
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    useEffect(() => {
        if (window.location.pathname.includes('/checkoutsuccess')) {
            fetchAndUpdateNotifications();
        }
    }, [window.location.pathname]);

    useEffect(() => {
        fetchAndUpdateNotifications();
    }, []);

    return (
        <div className="relative">
            <Toast ref={toast} />
            <motion.div
                className="cursor-pointer relative mr-6"
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
                <svg className='translate-x-[10px]' xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                <AnimatePresence>
                    {notificationCount > 0 && (
                        <motion.span
                            className="absolute -top-2 -right-4 bg-red-500 text-white text-[11px] font-medium rounded-full min-w-[20px] h-[20px] flex items-center justify-center"
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
                        className={`absolute left-[-170px] max-lg:left-[-350px] max-sm:left-[-250px]  mt-2 max-sm:w-[300px] w-[400px] bg-white rounded-lg shadow-lg z-50 ${
                            showNotifications ? 'block' : 'hidden'
                        }`}
                        onHoverStart={() => setShowNotifications(true)}
                        onHoverEnd={() => setShowNotifications(false)}
                    >
                        <div className="p-3 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
                            <div className="text-base font-semibold text-gray-800 py-2 ml-2">{t('notifications.title')}</div>
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
                                                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex justify-center items-center">
                                                        <i className="pi pi-shopping-cart text-gray-400 text-lg w-[40px] h-8 flex items-center justify-center ml-[50%] translate-x-[-50%] mt-[25%]"></i>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start">
                                                    <div className="text-base font-semibold text-gray-900 hover:text-gray-600 transition-colors">
                                                        {notification.title}
                                                    </div>
                                                    <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                                                        {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                <div className="mt-1">
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
                                                    <div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-6 text-center text-gray-500">
                                    {t('notifications.noNotifications')}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
} 