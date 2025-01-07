'use client';
import React, { useState, useEffect } from "react";
import { TabView, TabPanel } from 'primereact/tabview';
import { InputText } from 'primereact/inputtext';
import { fetchUserOrders, fetchAllUserOrders, fetchUserOrdersByCode, type Order, type OrderStatusMessage, connectWebSocket, receiveOrder } from '../services/purchase';
import PurchaseOrderCard from './PurchaseOrderCard';
import { useTranslations } from 'next-intl';
import Spinner from '@/src/components/spinner/spinner';
import { Client } from '@stomp/stompjs';
import { Toast } from 'primereact/toast';
import { Modal } from 'antd';
import { InputTextarea } from 'primereact/inputtextarea';
import { cancelOrder } from '../services/purchase';

interface PurchaseTabViewProps {
    locale: string;
    searchParams: URLSearchParams;
}

interface OrderGroup {
    orders: Order[];
    totalPrice: number;
    status: string;
    shopName: string;
    shopId: number;
    shippingStatus: number;
}

interface StatusMapping {
    value: string;
    label: string;
}

export default function PurchaseTabView({ locale, searchParams }: PurchaseTabViewProps) {
    const t = useTranslations();
    const [activeIndex, setActiveIndex] = useState(0);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState(() => {
        if (typeof window !== 'undefined') {
            return new URLSearchParams(window.location.search).get('search') || '';
        }
        return '';
    });
    const [stompClient, setStompClient] = useState<Client | null>(null);
    const toast = React.useRef<Toast>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [cancelNote, setCancelNote] = useState('');
    const [isCancelling, setIsCancelling] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isReceiving, setIsReceiving] = useState(false);

    const statusMappings: StatusMapping[] = [
        { value: '', label: t('purchase.tabs.all') },
        { value: '0', label: t('purchase.tabs.created') },
        { value: '1', label: t('purchase.tabs.pending') },
        { value: '2', label: t('purchase.tabs.confirmed') },
        { value: '3', label: t('purchase.tabs.ship_pending') },
        { value: '4', label: t('purchase.tabs.ship_confirmed') },
        { value: '5', label: t('purchase.tabs.delivering') },
        { value: '6', label: t('purchase.tabs.delivered') },
        { value: '7', label: t('purchase.tabs.paid') },
        { value: '8', label: t('purchase.tabs.completed') },
        { value: '9', label: t('purchase.tabs.cancelled') }
    ];

    const tabs = statusMappings.map(mapping => mapping.label);

    useEffect(() => {
        const client = connectWebSocket(handleStatusUpdate);
        setStompClient(client);

        return () => {
            if (client) {
                client.deactivate();
            }
        };
    }, []);

    const handleStatusUpdate = async (statusUpdate: OrderStatusMessage) => {
        if (!statusUpdate || typeof statusUpdate.status === 'undefined') return;
        
        const tabIndex = getTabIndexFromStatus(statusUpdate.status.toString());
        setActiveIndex(tabIndex);
        
        const newStatusLabel = statusMappings.find(mapping => mapping.value === statusUpdate.status.toString())?.label;

        if (newStatusLabel) {
            try {
                await fetchUserOrders({ 
                    userId: statusUpdate.userId.toString(), 
                    shippingStatus: statusUpdate.status.toString() 
                });
                fetchOrdersByStatus(statusUpdate.status.toString());
            } catch (error) {
                console.error('Error fetching orders:', error);
            }
        }
    };

    const getUserId = (): string => {
        const userStorage = JSON.parse(localStorage.getItem('user') || '{}');
        return userStorage.state?.id;
    };

    const getShippingStatus = (tabIndex: number): string => {
        return statusMappings[tabIndex]?.value || '';
    };

    const getTabIndexFromStatus = (status: string): number => {
        return statusMappings.findIndex(mapping => mapping.value === status) || 0;
    };

    const getStatusText = (order: Order): string => {
        const shippingStatus = searchParams.get('shippingStatus');
        const orderStatus = order.shippingStatus?.toString() || order.status?.toString() || '';
        const status = shippingStatus === null ? orderStatus : shippingStatus;
        return statusMappings.find(mapping => mapping.value === status)?.label || t('purchase.unknown');
    };

    const fetchOrders = async (userId: string, orderCode?: string) => {
        return orderCode 
            ? await fetchUserOrdersByCode(userId, orderCode)
            : await fetchAllUserOrders(userId);
    };

    const fetchOrdersByStatus = async (status: string) => {
        try {
            setOrders([]);
            setLoading(true);
            const userId = getUserId();
            const response = status === '' 
                ? await fetchAllUserOrders(userId)
                : await fetchUserOrders({ userId, shippingStatus: status });
            setOrders(response.status === 200 && response.data?.length > 0 ? response.data : []);
        } catch (error) {
            console.error('Error fetching orders:', error);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const updateUrlParams = (status: string | null, search: string) => {
        const params = new URLSearchParams(searchParams.toString());
        
        if (status === null) {
            params.delete('shippingStatus');
        } else if (status !== '') {
            params.set('shippingStatus', status);
        }

        if (search) {
            params.set('search', search);
        } else {
            params.delete('search');
        }
 
        window.history.replaceState(null, '', `?${params.toString()}`);
    };

    const handleTabChange = (e: { index: number }) => {
        const newStatus = getShippingStatus(e.index);
        setActiveIndex(e.index);
        updateUrlParams(e.index === 0 ? null : newStatus, searchTerm);
        fetchOrdersByStatus(e.index === 0 ? '' : newStatus);
    };

    const handleSearch = async (searchTerm: string) => {
        const userId = getUserId();
        updateUrlParams(activeIndex === 0 ? null : getShippingStatus(activeIndex), searchTerm);

        try {
            const response = await fetchOrders(userId, searchTerm.trim() === '' ? undefined : searchTerm);
            if (response.status === 200) {
                setOrders(response.data);
            } else {
                console.error('Error fetching orders:', response.message);
                setOrders([]);
            }
        } catch (error) {
            console.error('Error during search:', error);
            setOrders([]);
        }
    };

    const groupOrders = (): Record<string, OrderGroup> => {
        const allShopIds = orders.reduce((shopIds: number[], order) => {
            if (order.shopId && !shopIds.includes(order.shopId)) {
                shopIds.push(order.shopId);
            }
            return shopIds;
        }, []);

        if (allShopIds.length > 0) {
            localStorage.setItem('shopIds', JSON.stringify(allShopIds));
        }

        return orders.reduce((acc, order) => {
            const groupKey = `${order.orderId !== undefined ? order.orderId.toString() : order.id.toString()}_${order.shopId}`;
            if (!acc[groupKey]) {
                acc[groupKey] = {
                    orders: [],
                    totalPrice: 0,
                    status: getStatusText(order),
                    shopName: order.user?.shop_name || t('purchase.unknown_shop'),
                    shopId: order.shopId,
                    shippingStatus: Number(order.shippingStatus)
                };
            }
            acc[groupKey].orders.push(order);
            acc[groupKey].totalPrice += order.price * order.quantity;
            return acc;
        }, {} as Record<string, OrderGroup>);
    };

    useEffect(() => {
        const status = searchParams.get('shippingStatus');
        const searchParam = searchParams.get('search');
        const userId = getUserId();

        const initializeData = async () => {
            if (searchParam) {
                setSearchTerm(searchParam);
                try {
                    const response = await fetchOrders(userId, searchParam);
                    if (response.status === 200) {
                        setOrders(response.data);
                        return;
                    }
                } catch (error) {
                    console.error('Error during search:', error);
                }
            }

            // If no search param or search failed, fetch by status
            if (status === null) {
                setActiveIndex(0);
                fetchOrdersByStatus('');
            } else {
                const tabIndex = getTabIndexFromStatus(status);
                setActiveIndex(tabIndex);
                fetchOrdersByStatus(status);
            }
        };

        initializeData();
    }, [searchParams]);

    const renderSearchInput = () => (
        <span className="p-input-icon-left w-full mb-4">
            <i className="pi pi-search" />
            <InputText 
                placeholder={t('purchase.search.placeholder')} 
                className="w-full"
                value={searchTerm}
                onChange={(e) => {
                    setSearchTerm(e.target.value);
                    handleSearch(e.target.value);
                }}
            />
        </span>
    );

    const handleCancelOrder = async () => {
        if (!selectedOrder) return;

        try {
            setIsCancelling(true);
            const cancelMessage = {
                note: cancelNote,
                content: cancelNote,
                userId: parseInt(getUserId()),
                status: 9,
                shopId: selectedOrder.shopId,
                orderId: selectedOrder.orderId || selectedOrder.id
            };

            const response = await cancelOrder(cancelMessage);

            if (response.ok) {
                toast.current?.show({ severity: 'success', summary: t('purchase.steps.cancelSuccess') });
                setIsModalVisible(false);
                setCancelNote('');
                
                // Update the order status in the local state
                setOrders(prevOrders => 
                    prevOrders.map(order => {
                        if (order.id === selectedOrder.id) {
                            return { ...order, shippingStatus: 9 };
                        }
                        return order;
                    })
                );

                // Refresh orders after cancellation
                const status = getShippingStatus(activeIndex);
                fetchOrdersByStatus(status === '0' ? '' : status);
            } else {
                toast.current?.show({ severity: 'error', summary: t('purchase.steps.cancelError') });
            }
        } catch (error) {
            console.error('Error cancelling order:', error);
            toast.current?.show({ severity: 'error', summary: t('purchase.steps.cancelError') });
        } finally {
            setIsCancelling(false);
            setSelectedOrder(null);
        }
    };

    const handleReceiveOrder = async (order: Order) => {
        try {
            setIsReceiving(true);
            const receiveMessage = {
                note: t('purchase.steps.orderReceived'),
                content: t('purchase.steps.orderReceived'),
                userId: parseInt(getUserId()),
                status: 8,
                shopId: order.shopId,
                orderId: order.orderId || order.id
            };

            const response = await receiveOrder(receiveMessage);

            if (response.ok) {
                toast.current?.show({ severity: 'success', summary: t('purchase.steps.receiveSuccess') });
                setOrders(prevOrders => 
                    prevOrders.map(o => {
                        if (o.id === order.id) {
                            return { ...o, shippingStatus: 8 };
                        }
                        return o;
                    })
                );

                // Refresh orders after receiving
                const status = getShippingStatus(activeIndex);
                fetchOrdersByStatus(status === '0' ? '' : status);
            } else {
                toast.current?.show({ severity: 'error', summary: t('purchase.steps.receiveError') });
            }
        } catch (error) {
            console.error('Error receiving order:', error);
            toast.current?.show({ severity: 'error', summary: t('purchase.steps.receiveError') });
        } finally {
            setIsReceiving(false);
        }
    };

    const renderContent = () => {
        if (loading) {
            return <div className="text-center"><Spinner isLoading={loading} /></div>;
        }

        if (orders.length === 0) {
            return <div className="text-center">{t('purchase.no_orders')}</div>;
        }

        return Object.entries(groupOrders()).map(([groupKey, orderGroup]) => (
            <PurchaseOrderCard 
                key={groupKey} 
                locale={locale}
                groupKey={groupKey} 
                orderGroup={orderGroup} 
                isAllTab={activeIndex === 0}
                onCancelOrder={(order) => {
                    setSelectedOrder(order);
                    setIsModalVisible(true);
                }}
                onReceiveOrder={handleReceiveOrder}
            />
        ));
    };

    return (
        <div className="max-w-[1280px] mx-auto">
            <Toast ref={toast} />
            <TabView 
                activeIndex={activeIndex} 
                onTabChange={handleTabChange}
                className="mb-4 [&_.p-tabview-nav-link]:hover:after:hidden [&_.p-tabview-nav-link]:text-black [&_.p-tabview-nav-link.p-highlight]:text-black"
            >
                {tabs.map((tab, index) => (
                    <TabPanel key={tab} header={tab}>
                        <div className="w-full">
                            {renderSearchInput()}
                            {renderContent()}
                        </div>
                    </TabPanel>
                ))}
            </TabView>

            <Modal
                title={t('purchase.steps.cancelOrder')}
                open={isModalVisible}
                onOk={handleCancelOrder}
                onCancel={() => {
                    setIsModalVisible(false);
                    setCancelNote('');
                    setSelectedOrder(null);
                }}
                okText={t('purchase.steps.yes')}
                cancelText={t('purchase.steps.no')}
                confirmLoading={isCancelling}
                okButtonProps={{ style: { backgroundColor: 'black', borderColor: 'black' } }}
            >
                <div className="flex flex-col gap-4">
                    <p>{t('purchase.steps.cancelConfirm')}</p>
                    <div className="flex flex-col gap-2">
                        <label htmlFor="cancel-note" className="font-medium">
                            {t('purchase.steps.cancelNote')}
                        </label>
                        <InputTextarea
                            id="cancel-note"
                            value={cancelNote}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCancelNote(e.target.value)}
                            rows={4}
                            className="w-full p-2 border rounded-md"
                            placeholder={t('purchase.steps.enterCancelNote')}
                        />
                    </div>
                </div>
            </Modal>
            <Spinner isLoading={isCancelling || isReceiving} />
        </div>
    );
}
