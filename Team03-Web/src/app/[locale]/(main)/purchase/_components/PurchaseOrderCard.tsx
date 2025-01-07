'use client';
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { type Order } from '../services/purchase';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import RatingModal from './RatingModal';
import { buyAgain, connectWebSocket, type OrderStatusMessage } from '../services/purchase';
import { Toast } from 'primereact/toast';
import useChatStore from '@/src/app/[locale]/(main)/stores/useChatStore';
import useHandleCart from '@/src/layout/store/useHandleCart';

interface PurchaseOrderCardProps {
    locale: string;
    groupKey: string;
    orderGroup: {
        orders: Order[];
        totalPrice: number;
        shopName: string;
        shopId: number;
        status?: string;
        shippingStatus?: number;
    };
    isAllTab?: boolean;
    onCancelOrder?: (order: Order) => void;
    onReceiveOrder?: (order: Order) => void;
}

export default function PurchaseOrderCard({ locale, groupKey, orderGroup, isAllTab = false, onCancelOrder, onReceiveOrder }: PurchaseOrderCardProps) {
    const t = useTranslations();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [ratingModalVisible, setRatingModalVisible] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [orders, setOrders] = useState<Order[]>(orderGroup.orders);
    const userStorage = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = userStorage.state?.id;
    const shippingStatus = isAllTab ? orderGroup.orders[0]?.shippingStatus ?? 0 : Number(searchParams.get('shippingStatus')) || 0;
    const toast = useRef<Toast>(null);
    const { setOpenChat, setRecipientId, setimageShop, setShopName } = useChatStore();
    const { triggerFetch, setTriggerFetch } = useHandleCart();
    useEffect(() => {
        if (!userId) return;

        const handleStatusUpdate = (statusUpdate: OrderStatusMessage) => {
            if (statusUpdate.userId === userId) {
                setOrders(prevOrders =>
                    prevOrders.map(order => {
                        if (order.orderId === statusUpdate.orderId && order.shopId === statusUpdate.shopId) {
                            return {
                                ...order,
                                shippingStatus: statusUpdate.status
                            };
                        }
                        return order;
                    })
                );
            }
        };

        const client = connectWebSocket(handleStatusUpdate);

        return () => {
            if (client.connected) {
                client.deactivate();
            }
        };
    }, [userId]);

    // Group orders by productId and track the last index of each product group
    const { groupedByProduct, productGroups } = useMemo(() => {
        const groups: { [key: string]: Order[] } = {};
        const productSequence: string[] = [];

        orders.forEach((order) => {
            const key = `${order.skuDto?.productId}`;
            if (!groups[key]) {
                groups[key] = [];
                productSequence.push(key);
            }
            groups[key].push(order);
        });

        return {
            groupedByProduct: groups,
            productGroups: productSequence
        };
    }, [orders]);

    const isProductRated = (productId: string | number | undefined) => {
        if (!productId) return false;
        const variants = groupedByProduct[productId] || [];
        return variants.every((order) => order.hasFeedback === 1);
    };

    const getFirstUnratedOrder = (productId: string | number | undefined) => {
        if (!productId) return null;
        const variants = groupedByProduct[productId] || [];
        return variants.find((order) => order.hasFeedback !== 1) || variants[0];
    };

    const orderStatusConfig = {
        0: { status: 'created', color: 'text-orange-500' },
        1: { status: 'pending', color: 'text-green-500' },
        2: { status: 'confirmed', color: 'text-blue-500' },
        3: { status: 'ship_pending', color: 'text-red-500' },
        4: { status: 'ship_confirmed', color: 'text-blue-500' },
        5: { status: 'delivering', color: 'text-yellow-500' },
        6: { status: 'delivered', color: 'text-lightgreen-500' },
        7: { status: 'paid', color: 'text-lightblue-500' },
        8: { status: 'completed', color: 'text-green-500' },
        9: { status: 'cancelled', color: 'text-red-500' }
    } as const;

    const getShippingStatus = (status: number): string => {
        return orderStatusConfig[status as keyof typeof orderStatusConfig]?.status || 'created';
    };

    const getStatusColor = (status: number): string => {
        return orderStatusConfig[status as keyof typeof orderStatusConfig]?.color || 'text-orange-500';
    };

    const shippingStatusString = getShippingStatus(shippingStatus);
    const statusColor = getStatusColor(shippingStatus);

    const handleRatingSuccess = () => {
        if (selectedOrder) {
            const productId = selectedOrder.skuDto?.productId;
            const relatedOrders = groupedByProduct[productId!] || [];

            setOrders((prevOrders) =>
                prevOrders.map((order) =>
                    relatedOrders.some((relatedOrder) => relatedOrder.skuDto?.productId === order.skuDto?.productId)
                        ? {...order, hasFeedback: 1}: order
                )
            );
        }
    };

    const handleOpenChat = (e: React.MouseEvent) => {
        e.stopPropagation();
        setOpenChat(true);
        setRecipientId(userId);
        setShopName(orderGroup.shopName);
    };

    return (
        <>
            <Toast ref={toast} />
            <Card key={groupKey} className="mb-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto mb-2 sm:mb-0">
                        <span className="font-bold">{orderGroup.shopName}</span>
                        <div className="translate-x-0 sm:translate-x-8 mt-2 sm:mt-0">
                            <Button label={t('purchase.button.chat')} severity="secondary" className="bg-black text-white text-xs px-2 py-1 h-8 mr-2" onClick={handleOpenChat} />
                            <Link href={`/${locale}/shop/${orderGroup.shopId}`}>
                                <Button label={t('purchase.button.view_shop')} outlined className="text-xs px-2 py-1 h-8 border-black text-black hover:bg-black hover:text-white" />
                            </Link>
                        </div>
                    </div>
                    <span className={`font-medium ${statusColor} mt-2 sm:mt-0 flex items-center gap-2`}>
                        {isAllTab && shippingStatus === 8 && (
                            <>
                                <i className="pi pi-car text-black" />
                                <span className="text-black">{t('purchase.delivery.success')}</span>
                            </>
                        )}
                        {t(`purchase.status.${shippingStatusString}`)}
                    </span>
                </div>

                {productGroups.map((productId) => {
                    const productOrders = groupedByProduct[productId] || [];

                    return (
                        <div key={productId} className="mb-4">
                            {productOrders.map((order) => (
                                <div
                                    key={order.id}
                                    className="flex flex-col sm:flex-row gap-4 border-t pt-5 pb-5 cursor-pointer hover:bg-gray-50 transition-colors"
                                    onClick={() => {
                                        const userStorage = JSON.parse(localStorage.getItem('user') || '{}');
                                        const userId = userStorage.state?.id;
                                        const purchaseDetailPath = `/${locale}/purchase/purchase-detail?userId=${userId}&orderId=${order.orderId}&shopId=${order.shopId}`;
                                        router.push(purchaseDetailPath);
                                    }}
                                >
                                    <div className="w-full sm:w-20 h-40 sm:h-20 relative mt-0 sm:mt-2">
                                        <img
                                            src={order.skuDto?.image && order.skuDto.image.trim() !== '' ? order.skuDto.image : 'https://via.placeholder.com/150'}
                                            alt={order.productName || 'Product Image'}
                                            className="w-full h-full object-cover absolute top-0 left-0"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-base font-semibold text-gray-900 mb-1 max-sm:text-[18px]">{order.productName}</h3>
                                        <p className="text-sm text-gray-700 mb-1">
                                            {order.skuDto?.option1?.value?.name !== 'Default' && order.skuDto?.option1 && (
                                                <>
                                                    {order.skuDto.option1.name}: {order.skuDto.option1.value.name}
                                                </>
                                            )}
                                            {order.skuDto?.option2?.value?.name !== 'Default' && order.skuDto?.option2 && (
                                                <>
                                                    {order.skuDto?.option1?.value?.name !== 'Default' && ', '}
                                                    {order.skuDto.option2.name}: {order.skuDto.option2.value.name}
                                                </>
                                            )}
                                        </p>
                                        <p className="text-sm text-gray-800">x{order.quantity}</p>
                                    </div>
                                    <div className="flex text-right items-center justify-end sm:justify-start mt-2 sm:mt-0">
                                        {order.skuDto?.oldPrice === order.skuDto?.newPrice ? (
                                            <p className="text-base font-semibold text-gray-900">₫{order.skuDto?.newPrice.toLocaleString()}</p>
                                        ) : (
                                            <div className="flex flex-col items-end">
                                                <p className="text-base font-semibold text-gray-900">₫{order.skuDto?.newPrice.toLocaleString()}</p>
                                                <p className="text-sm text-gray-500 line-through">₫{order.skuDto?.oldPrice.toLocaleString()}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {shippingStatus === 8 && !isProductRated(productId) && (
                                <div className="flex flex-col sm:flex-row gap-4 px-4">
                                    <div className="w-full sm:w-20"></div>
                                    <div className="flex-1"></div>
                                    <div className="w-[120px]"></div>
                                </div>
                            )}

                            {(shippingStatus === 0 || shippingStatus === 1) && onCancelOrder && (
                                <div className="flex flex-col sm:flex-row gap-4 px-4">
                                    <div className="w-full sm:w-20"></div>
                                    <div className="flex-1"></div>
                                    <div className="w-[120px]"></div>
                                </div>
                            )}

                            {shippingStatus === 6 && onReceiveOrder && (
                                <div className="flex flex-col sm:flex-row gap-4 px-4">
                                    <div className="w-full sm:w-20"></div>
                                    <div className="flex-1"></div>
                                    <div className="w-[120px]"></div>
                                </div>
                            )}
                        </div>
                    );
                })}

                <div className="mt-4 border-t pt-4">
                    <div className="flex flex-col sm:flex-row justify-end items-end sm:items-center mb-4 translate-y-[18px]">
                        <div className="flex flex-wrap gap-2 mb-2 sm:mb-0 w-full sm:w-auto justify-end">
                            {shippingStatus === 8 && !isProductRated(productGroups[0]) && (
                                <Button
                                    label={t('purchase.button.rate')}
                                    severity="secondary"
                                    className="text-xs px-3 py-2 h-8 bg-black text-white hover:bg-gray-800 w-full sm:w-auto"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const orderToRate = getFirstUnratedOrder(productGroups[0]);
                                        setSelectedOrder(orderToRate);
                                        setRatingModalVisible(true);
                                    }}
                                />
                            )}
                            {(shippingStatus === 0 || shippingStatus === 1) && onCancelOrder && (
                                <Button
                                    label={t('purchase.button.cancel')}
                                    severity="secondary"
                                    className="text-xs px-3 py-2 h-8 bg-black text-white hover:bg-gray-800 w-full sm:w-auto mr-2"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const orderToCancel = orders[0];
                                        onCancelOrder(orderToCancel);
                                    }}
                                />
                            )}
                            {shippingStatus === 6 && onReceiveOrder && (
                                <Button
                                    label={t('purchase.steps.orderReceived')}
                                    severity="secondary"
                                    className="text-xs px-3 py-2 h-8 bg-black text-white hover:bg-gray-800 w-full sm:w-auto mr-2"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const orderToReceive = orders[0];
                                        onReceiveOrder(orderToReceive);
                                    }}
                                />
                            )}
                            {shippingStatus === 8 && (
                                <Button
                                    label={t('purchase.button.buyAgain')}
                                    severity="secondary"
                                    className="text-xs px-3 py-2 h-8 mr-0 sm:mr-4 bg-black text-white hover:bg-gray-800 w-full sm:w-auto"
                                    onClick={async (e) => {
                                        e.stopPropagation();
                                        try {
                                            if (userId && orders.length > 0) {
                                                const variantIds = orders
                                                    .filter((order) => order.skuDto && order.skuDto.variantId)
                                                    .map((order) => ({
                                                        variantId: order.skuDto!.variantId,
                                                        quantity: order.quantity || 1
                                                    }));

                                                for (const item of variantIds) {
                                                    await buyAgain(userId, item.variantId, item.quantity);
                                                }

                                                toast.current?.show({
                                                    severity: 'success',
                                                    summary: 'Success',
                                                    detail: 'All items added to cart successfully'
                                                });
                                                setTriggerFetch(!triggerFetch);
                                                router.push(`/${locale}/cart`);
                                            }
                                        } catch (error) {
                                            toast.current?.show({
                                                severity: 'error',
                                                summary: 'Error',
                                                detail: 'Failed to add items to cart'
                                            });
                                        }
                                    }}
                                />
                            )}
                        </div>
                        <div className="flex items-center">
                            <span className="text-sm text-gray-600 mr-1">{t('purchase.order.total')}</span>
                            <span className="text-lg font-bold text-gray-900">₫{orders.reduce((total, order) => total + (order.skuDto?.newPrice || order.price) * order.quantity, 0).toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </Card>

            <RatingModal
                visible={ratingModalVisible && selectedOrder?.hasFeedback !== 1}
                onHide={() => setRatingModalVisible(false)}
                productId={selectedOrder?.skuDto?.productId?.toString() || ''}
                orderId={selectedOrder?.orderId?.toString() || ''}
                userId={userId?.toString() || ''}
                orderDetailId={selectedOrder?.id || 0}
                onRatingSuccess={handleRatingSuccess}
            />
        </>
    );
}
