'use client';
import React, { useState, useEffect } from 'react';
import { Modal } from 'antd';
import { useSearchParams } from 'next/navigation';
import { getPurchaseDetail, connectWebSocket, type OrderStatusMessage, cancelOrder, receiveOrder, type StatusChangeRequest } from './services/purchase-detail';
import { useTranslations } from 'next-intl';
import Spinner from '@/src/components/spinner/spinner';
import OrderStatus from './_components/OrderStatus';
import ShippingInfo from './_components/ShippingInfo';
import OrderDetails from './_components/OrderDetails';
import { InputTextarea } from 'primereact/inputtextarea';
import { Toast } from 'primereact/toast';

function PurchaseDetail() {
    const t = useTranslations('purchaseDetail');
    const searchParams = useSearchParams();
    const validSteps = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]; 
    const toast = React.useRef<Toast>(null);
    
    const getStepIndex = (status: number) => {
        return validSteps.indexOf(status);
    };

    const [current, setCurrent] = useState(0);
    const [orderDetail, setOrderDetail] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [stompClient, setStompClient] = useState<any>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [userId, setUserId] = useState<string>('');
    const [statusTimestamps, setStatusTimestamps] = useState<{ [key: string]: string }>({});
    const [cancelNote, setCancelNote] = useState('');
    const [isCancelling, setIsCancelling] = useState(false);
    const [isReceiving, setIsReceiving] = useState(false);

    useEffect(() => {
        const userStorage = JSON.parse(localStorage.getItem('user') || '{}');
        const id = userStorage.state?.id;
        setUserId(id);
    }, []);

    const handleCancelOrder = async () => {
        try {
            setIsCancelling(true);
            const cancelMessage: StatusChangeRequest = {
                note: cancelNote,
                content: cancelNote,
                userId: parseInt(searchParams.get('userId') || '0'),
                status: 9,
                shopId: parseInt(searchParams.get('shopId') || '0'),
                orderId: parseInt(searchParams.get('orderId') || '0')
            };

            const response = await cancelOrder(cancelMessage);

            if (response.ok) {
                toast.current?.show({ severity: 'success', summary: t('steps.cancelSuccess') });
                setIsModalVisible(false);
                setCancelNote('');
                
                setOrderDetail((prevDetail: any) => {
                    if (!prevDetail) return prevDetail;
                    return {
                        ...prevDetail,
                        orderDetails: prevDetail.orderDetails.map((detail: any) => ({
                            ...detail,
                            shippingStatus: 9
                        }))
                    };
                });
                setCurrent(9);
            } else {
                toast.current?.show({ severity: 'error', summary: t('steps.cancelError') });
            }
        } catch (error) {
            console.error('Error cancelling order:', error);
            toast.current?.show({ severity: 'error', summary: t('steps.cancelError') });
        } finally {
            setIsCancelling(false);
        }
    };

    const handleReceiveOrder = async () => {
        try {
            setIsReceiving(true);
            const receiveMessage: StatusChangeRequest = {
                note: t('steps.orderReceived'),
                content: t('steps.orderReceived'),
                userId: parseInt(searchParams.get('userId') || '0'),
                status: 8,
                shopId: parseInt(searchParams.get('shopId') || '0'),
                orderId: parseInt(searchParams.get('orderId') || '0')
            };

            const response = await receiveOrder(receiveMessage);

            if (response.ok) {
                toast.current?.show({ severity: 'success', summary: t('steps.receiveSuccess') });
                setOrderDetail((prevDetail: any) => {
                    if (!prevDetail) return prevDetail;
                    return {
                        ...prevDetail,
                        orderDetails: prevDetail.orderDetails.map((detail: any) => ({
                            ...detail,
                            shippingStatus: 8
                        }))
                    };
                });
                setCurrent(8);
            } else {
                toast.current?.show({ severity: 'error', summary: t('steps.receiveError') });
            }
        } catch (error) {
            console.error('Error receiving order:', error);
            toast.current?.show({ severity: 'error', summary: t('steps.receiveError') });
        } finally {
            setIsReceiving(false);
        }
    };

    useEffect(() => {
        if (Object.keys(statusTimestamps).length > 0) {
            localStorage.setItem('statusTimestamps', JSON.stringify(statusTimestamps));
        }
    }, [statusTimestamps]);

    useEffect(() => {
        const fetchOrderDetail = async () => {
            try {
                const params = {
                    orderId: searchParams.get('orderId'),
                    shopId: searchParams.get('shopId')
                };
                let userId = searchParams.get('userId');
                if (!userId) {
                    toast.current?.show({ severity: 'error', summary: 'User ID is missing' });
                    setLoading(false);
                    return;
                }
                const response = await getPurchaseDetail(userId, params);

                if (response.status === 200) {
                    setOrderDetail(response.data?.data);
                    const orderData = response.data?.data?.order;
                    if (orderData) {
                        localStorage.setItem('orderCode', orderData.orderCode || '');
                        localStorage.setItem('statusCheckout', orderData.statusCheckout?.toString() || '');
                    }
                    const shippingStatus = response.data?.data?.orderDetails?.[0]?.shippingStatus || 0;
                    const stepIndex = getStepIndex(shippingStatus);
                    setCurrent(stepIndex);
                    
                    const historyList = response.data?.data?.orderTracking?.historyStatusShippingDtoList || [];
                    const timestamps: { [key: string]: string } = {};
                    
                    historyList.forEach((history: any) => {
                        timestamps[history.status] = history.createdChangeStatus;
                    });
                    
                    setStatusTimestamps(timestamps);
                }
            } catch (error) {
                console.error('Error fetching order detail:', error);
                toast.current?.show({ severity: 'error', summary: 'Failed to fetch order detail' });
            } finally {
                setLoading(false);
            }
        };

        fetchOrderDetail();
    }, [searchParams]);

    useEffect(() => {
        const handleStatusUpdate = (message: OrderStatusMessage) => {
            
            const newStatus = message.status;
            const stepIndex = getStepIndex(newStatus);
            
            console.log('Matched order details. Updating status:', {
                previousStatus: orderDetail?.orderDetails?.[0]?.shippingStatus,
                newStatus: newStatus,
                validSteps,
                newStepIndex: stepIndex
            });
            
            if (newStatus !== 0) {
                const now = new Date().toISOString();
                setStatusTimestamps(prev => ({
                    ...prev,
                    [newStatus]: now
                }));
            }
            
            setOrderDetail((prevDetail: any) => {
                if (!prevDetail) return prevDetail;
                
                const updatedDetail = {
                    ...prevDetail,
                    orderDetails: prevDetail.orderDetails.map((detail: any) => ({
                        ...detail,
                        shippingStatus: newStatus
                    }))
                };
                console.log('Updated order detail:', updatedDetail);
                return updatedDetail;
            });

            if (stepIndex !== -1) {
                console.log('Setting new current step:', stepIndex);
                setCurrent(stepIndex);
            }
        };

        const client = connectWebSocket(handleStatusUpdate);
        setStompClient(client);

        return () => {
            if (stompClient) {
                console.log('Disconnecting WebSocket');
                stompClient.disconnect();
            }
        };
    }, [searchParams]);

    if (loading) {
        return <Spinner isLoading={loading} />;
    }

    const showCancelButton = orderDetail?.orderDetails?.[0]?.shippingStatus === 0 || 
        orderDetail?.orderDetails?.[0]?.shippingStatus === 1;
    const showReceiveButton = orderDetail?.orderDetails?.[0]?.shippingStatus === 6;

    return (
        <div className="p-4 sm:p-8 md:p-12 lg:p-14 max-w-[1360px] mx-auto">
            <Toast ref={toast} />
            {orderDetail?.orderDetails?.[0]?.shippingStatus !== 9 && (
                <OrderStatus 
                    current={current}
                    statusTimestamps={statusTimestamps}
                    validSteps={validSteps}
                />
            )}
            {orderDetail && (
                <div className='p-4 sm:p-8 md:p-12 lg:p-16'>
                    {orderDetail?.orderDetails?.[0]?.shippingStatus === 9 && (
                        <div className="bg-white shadow-sm border rounded-lg p-6 mb-4 mt-[-50px]">
                            <div className="text-red-500 text-xl font-medium mb-1">
                                {t('steps.cancelled')}
                            </div>
                            <div className="mt-4 text-gray-600">
                                {t('steps.cancelReason')}: {orderDetail?.cancelReason || t('steps.deliveryFailed')}
                            </div>
                        </div>
                    )}
                    <ShippingInfo orderDetail={orderDetail} />
                    <OrderDetails 
                        orderDetail={orderDetail}
                        showCancelButton={showCancelButton}
                        showReceiveButton={showReceiveButton}
                        onCancelClick={() => setIsModalVisible(true)}
                        onReceiveClick={handleReceiveOrder}
                    />
                </div>
            )}

            <Modal
                title={t('steps.cancelOrder')}
                open={isModalVisible}
                onOk={handleCancelOrder}
                onCancel={() => {
                    setIsModalVisible(false);
                    setCancelNote('');
                }}
                okText={t('steps.yes')}
                cancelText={t('steps.no')}
                confirmLoading={isCancelling}
                okButtonProps={{ style: { backgroundColor: 'black', borderColor: 'black' } }}
            >
                <div className="flex flex-col gap-4">
                    <p>{t('steps.cancelConfirm')}</p>
                    <div className="flex flex-col gap-2">
                        <label htmlFor="cancel-note" className="font-medium">
                            {t('steps.cancelNote')}
                        </label>
                        <InputTextarea
                            id="cancel-note"
                            value={cancelNote}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCancelNote(e.target.value)}
                            rows={4}
                            className="w-full p-2 border rounded-md"
                            placeholder={t('steps.enterCancelNote')}
                        />
                    </div>
                </div>
            </Modal>
            <Spinner isLoading={isCancelling || isReceiving} />
        </div>
    );
}

export default PurchaseDetail;