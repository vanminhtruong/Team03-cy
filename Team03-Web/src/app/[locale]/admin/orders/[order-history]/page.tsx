'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { App, Spin } from 'antd';
import { Toast } from 'primereact/toast';
import fetchOrderDetails, { 
    createWebSocketClient, 
    initializeWebSocket, 
    sendStatusUpdate 
} from './services/orderDetail';
import { Client } from '@stomp/stompjs';
import { OrderStatusType, OrderDetailData } from './interface/types';
import { OrderStatusTimeline } from './_components/OrderStatusTimeline';
import { CustomerInformation } from './_components/CustomerInformation';
import { OrderItems } from './_components/OrderItems';

export default function OrderHistoryPage({ params }: { 
    params: { 
        'order-history': string;
        locale: string;
    }
}) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const orderId = searchParams?.get('orderId');
    const toast = useRef<Toast>(null);
    const [currentStatus, setCurrentStatus] = useState<OrderStatusType>(OrderStatusType.PENDING);
    const [loading, setLoading] = useState(true);
    const [orderData, setOrderData] = useState<OrderDetailData | null>(null);
    const [shopId, setShopId] = useState<string>('');
    const stompClientRef = useRef<Client | null>(null);
    const [isLocalUpdate, setIsLocalUpdate] = useState(false);
    const previousStatusRef = useRef<OrderStatusType | null>(null);
    const t = useTranslations('orderHistory');

    const statusNames: Record<OrderStatusType, string> = {
        [OrderStatusType.CREATED]: t('status.created'),
        [OrderStatusType.PENDING]: t('status.pending'),
        [OrderStatusType.CONFIRMED]: t('status.confirmed'),
        [OrderStatusType.SHIPPING_PENDING]: t('status.shippingPending'),
        [OrderStatusType.SHIPPING_CONFIRMED]: t('status.shippingConfirmed'),
        [OrderStatusType.DELIVERING]: t('status.delivering'),
        [OrderStatusType.DELIVERED]: t('status.delivered'),
        [OrderStatusType.PAID]: t('status.paid'),
        [OrderStatusType.COMPLETED]: t('status.completed'),
        [OrderStatusType.CANCELLED]: t('status.cancelled'),
    };

    useEffect(() => {
        if (!searchParams || !orderId) {
            toast.current?.show({
                severity: 'error',
                summary: t('error'),
                detail: t('errors.missingOrderInfo')
            });
            router.push('/admin/orders');
            return;
        }
    }, [orderId, searchParams, router]);

    useEffect(() => {
        if (!stompClientRef.current) {
            const client = createWebSocketClient();
            stompClientRef.current = client;

            const cleanup = initializeWebSocket(
                client,
                () => {
                    console.log('Connected to WebSocket');
                },
                (error) => {
                    console.error('WebSocket error:', error);
                    toast.current?.show({
                        severity: 'error',
                        summary: t('error'),
                        detail: t('errors.connectionError')
                    });
                },
                (statusUpdate) => {
                    console.log('Received status update:', statusUpdate);
                    if (statusUpdate.orderId === parseInt(orderId || '0')) {
                        const newStatus = statusUpdate.status as OrderStatusType;
                        
                        if (newStatus === OrderStatusType.CANCELLED) {
                            setOrderData((prevData) => {
                                if (!prevData) return prevData;
                                
                                const newHistoryId = (prevData.orderTracking.historyStatusShippingDtoList || []).length + 1;
                                return {
                                    ...prevData,
                                    orderTracking: {
                                        ...prevData.orderTracking,
                                        status: OrderStatusType.CANCELLED,
                                        cancelledAt: new Date().toISOString(),
                                        historyStatusShippingDtoList: [
                                            ...(prevData.orderTracking.historyStatusShippingDtoList || []),
                                            {
                                                id: newHistoryId,
                                                status: OrderStatusType.CANCELLED,
                                                createdChangeStatus: new Date().toISOString()
                                            }
                                        ]
                                    }
                                };
                            });
                        } else {
                            setOrderData((prevData) => {
                                if (!prevData) return prevData;
                                
                                const newHistoryId = (prevData.orderTracking.historyStatusShippingDtoList || []).length + 1;
                                return {
                                    ...prevData,
                                    orderTracking: {
                                        ...prevData.orderTracking,
                                        status: newStatus,
                                        historyStatusShippingDtoList: [
                                            ...(prevData.orderTracking.historyStatusShippingDtoList || []),
                                            {
                                                id: newHistoryId,
                                                status: newStatus,
                                                createdChangeStatus: new Date().toISOString()
                                            }
                                        ]
                                    }
                                };
                            });
                        }

                        if (!isLocalUpdate && previousStatusRef.current !== newStatus) {
                            toast.current?.show({
                                severity: 'success',
                                summary: t('success'),
                                detail: t('statusChanged', { status: statusNames[newStatus] }),
                            });
                        }
                        
                        previousStatusRef.current = newStatus;
                        setCurrentStatus(newStatus);
                        setIsLocalUpdate(false);
                    }
                }
            );

            return () => {
                cleanup();
                if (client.connected) {
                    client.deactivate();
                }
                stompClientRef.current = null;
            };
        }
    }, [orderId]); 

    const handleStepChange = async (step: number) => {
        if (step >= 0 && step <= OrderStatusType.CANCELLED) {
            try {
                if (!stompClientRef.current || !orderData) {
                    toast.current?.show({
                        severity: 'error',
                        summary: t('error'),
                        detail: t('errors.connectionError')
                    });
                    return;
                }

                setIsLocalUpdate(true);
                await sendStatusUpdate(stompClientRef.current, {
                    orderId: parseInt(orderId || '0'),
                    shopId: parseInt(shopId),
                    status: step,
                    userId: orderData.order.user.userId
                });
            } catch (error) {
                console.error('Error updating status:', error);
                toast.current?.show({
                    severity: 'error',
                    summary: t('error'),
                    detail: t('errors.updateStatusFailed')
                });
                setIsLocalUpdate(false);
            }
        }
    };

    useEffect(() => {
        const userStorage = JSON.parse(localStorage.getItem('user') || '{}');
        const id = userStorage.state?.id;
        setShopId(id);
    }, []);

    useEffect(() => {
        const loadOrderDetails = async () => {
            try {
                if (!orderId) {
                    toast.current?.show({
                        severity: 'error',
                        summary: t('error'),
                        detail: t('errors.missingOrderInfo')
                    });
                    return;
                }
                const response = await fetchOrderDetails({ 
                    shopId: shopId,
                    orderId: orderId,  
                });

                setOrderData(response);
                setCurrentStatus(response.orderTracking.status as OrderStatusType);
            } catch (error) {
                toast.current?.show({
                    severity: 'error',
                    summary: t('error'),
                    detail: t('errors.loadDetailsFailed')
                });
            } finally {
                setLoading(false);
            }
        };

        if (shopId) {
            loadOrderDetails();
        }
    }, [orderId, shopId]);

    const formatDate = (date: string) => {
        if (!date) return t('dateFormat.noDate');
        const dateObj = new Date(date);
        return `${dateObj.toLocaleDateString()} ${t('dateFormat.at')} ${dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Spin size="large" />
            </div>
        );
    }

    if (!orderData) {
        return <div>No order data found</div>;
    }

    return (
        <App>
            <div className="container mx-auto px-4 py-6 max-w-full">
                <Toast ref={toast} />
                <div className="flex justify-between items-center mb-6 max-md:flex-col max-md:gap-4">
                    <h1 className="text-2xl font-bold max-md:text-xl">{t('title')}</h1>
                    <div className="text-gray-600 max-md:text-sm">
                        {t('orderCode')}: {orderData.order.orderCode}
                    </div>
                </div>

                <OrderStatusTimeline 
                    currentStatus={currentStatus}
                    orderData={orderData}
                    handleStepChange={handleStepChange}
                    formatDate={formatDate}
                    t={t}
                />

                <div className="flex gap-6 w-full max-xl:gap-4 max-lg:flex-col max-xl:flex-col">
                    <CustomerInformation orderData={orderData} t={t} />
                    <OrderItems orderData={orderData} t={t} />
                </div>
            </div>
        </App>
    );
}
