import React from 'react';
import { 
    CheckCircleOutlined, 
    CloseCircleOutlined,
    SyncOutlined,
    FileTextOutlined,
    ClockCircleOutlined,
    CarOutlined,
    DollarCircleOutlined,
    ShoppingCartOutlined,
    ExclamationCircleOutlined
} from '@ant-design/icons';
import { useTranslations } from 'next-intl';

interface OrderDetailsProps {
    orderDetail: any;
    showCancelButton?: boolean;
    showReceiveButton?: boolean;
    onCancelClick?: () => void;
    onReceiveClick?: () => void;
}

const OrderDetails: React.FC<OrderDetailsProps> = ({ orderDetail, showCancelButton, showReceiveButton, onCancelClick, onReceiveClick }) => {
    const t = useTranslations('purchaseDetail');

    const getStatusConfig = (status: number) => {
        switch(status) {
            case 0: return { icon: <FileTextOutlined className="text-orange-500 text-lg sm:text-xl" />, text: 'text-orange-500' };
            case 1: return { icon: <CheckCircleOutlined className="text-green-500 text-lg sm:text-xl" />, text: 'text-green-500' };
            case 2: return { icon: <CheckCircleOutlined className="text-blue-500 text-lg sm:text-xl" />, text: 'text-blue-500' };
            case 3: return { icon: <ShoppingCartOutlined className="text-red-500 text-lg sm:text-xl" />, text: 'text-red-500' };
            case 4: return { icon: <CheckCircleOutlined className="text-blue-500 text-lg sm:text-xl" />, text: 'text-blue-500' };
            case 5: return { icon: <CarOutlined className="text-yellow-500 text-lg sm:text-xl" />, text: 'text-yellow-500' };
            case 6: return { icon: <CheckCircleOutlined className="text-lightgreen-500 text-lg sm:text-xl" />, text: 'text-lightgreen-500' };
            case 7: return { icon: <DollarCircleOutlined className="text-lightblue-500 text-lg sm:text-xl" />, text: 'text-lightblue-500' };
            case 8: return { icon: <CheckCircleOutlined className="text-green-500 text-lg sm:text-xl" />, text: 'text-green-500' };
            case 9: return { icon: <CloseCircleOutlined className="text-red-500 text-lg sm:text-xl" />, text: 'text-red-500' };
            default: return { icon: <ExclamationCircleOutlined className="text-gray-500 text-lg sm:text-xl" />, text: 'text-gray-500' };
        }
    };

    return (
        <div className="mt-4 sm:mt-6 bg-white shadow-sm border rounded-lg">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 border-b">
                <div className="flex items-center space-x-1 sm:space-x-2 mb-2 sm:mb-0">
                    <ShoppingCartOutlined className="text-orange-500 text-xl sm:text-2xl" />
                    <span className="font-bold text-lg sm:text-xl text-gray-800">{t('orderDetails.title')}</span>
                </div>
                <span className="text-sm sm:text-base text-gray-600">
                    {t('orderDetails.orderId')}: {orderDetail?.order?.orderCode}
                </span>
            </div>

            <div className="p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center border-b pb-4 mb-4">
                    <div className="w-full sm:w-32 h-48 sm:h-32 mb-4 sm:mb-0 sm:mr-4 border rounded-lg overflow-hidden">
                        <img 
                            src={orderDetail?.orderDetails?.[0]?.skuDto?.image || 'https://via.placeholder.com/150'} 
                            alt="Product Image" 
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="flex-grow">
                        <div className="font-bold text-base sm:text-[19px] text-black mb-2">
                            {orderDetail?.orderDetails?.[0]?.productName}
                        </div>
                        <div className="text-sm sm:text-base text-gray-700 space-y-2">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center">
                                <span className="mr-2">{t('orderDetails.variant')}:</span>
                                <span className="font-semibold">
                                    {[
                                        orderDetail?.orderDetails?.[0]?.skuDto?.option1?.value?.name || 
                                        orderDetail?.orderDetails?.[0]?.skuDto?.option1?.name || 
                                        t('shippingAddress.notUpdated'),
                                        orderDetail?.orderDetails?.[0]?.skuDto?.option2?.value?.name || 
                                        orderDetail?.orderDetails?.[0]?.skuDto?.option2?.name || 
                                        t('shippingAddress.notUpdated')
                                    ].filter(item => item !== t('shippingAddress.notUpdated')).join(' - ')}
                                </span>
                            </div>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center">
                                <span className="mr-2">{t('orderDetails.quantity')}:</span>
                                <span className="font-semibold">
                                    {orderDetail?.orderDetails?.[0]?.quantity}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-2 relative">
                    <div className="flex flex-col sm:flex-row justify-between text-sm sm:text-base">
                        <div className="text-gray-700 mb-1 sm:mb-0 flex items-center">{t('orderDetails.totalAmount')}</div>
                        <div className="flex flex-row items-center gap-2">
                            {orderDetail?.orderDetails?.[0]?.skuDto?.oldPrice !== orderDetail?.orderDetails?.[0]?.skuDto?.newPrice && (
                                <span className="line-through text-gray-500 text-sm sm:text-base flex items-center">
                                    {new Intl.NumberFormat('vi-VN', { 
                                        style: 'currency', 
                                        currency: 'VND' 
                                    }).format(orderDetail?.orderDetails?.[0]?.skuDto?.oldPrice * (orderDetail?.orderDetails?.[0]?.quantity || 1) || 0)}
                                </span>
                            )}
                            <span className="font-bold text-primary-text text-base sm:text-lg flex items-center">
                                {new Intl.NumberFormat('vi-VN', { 
                                    style: 'currency', 
                                    currency: 'VND' 
                                }).format(orderDetail?.orderDetails?.[0]?.skuDto?.newPrice * (orderDetail?.orderDetails?.[0]?.quantity || 1) || 0)}
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-between text-sm sm:text-base">
                        <span className="text-gray-700">{t('orderDetails.shippingFee')}</span>
                        <span className="font-bold text-green-600 mt-1 sm:mt-0">{t('orderDetails.free')}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-between text-base sm:text-lg font-bold border-t pt-2 mt-2">
                        <span className="text-black">{t('orderDetails.grandTotal')}</span>
                        <div className="flex items-center space-x-4">
                            {showCancelButton && (
                                <button
                                    onClick={onCancelClick}
                                    className="bg-black hover:bg-gray-800 text-white text-sm font-medium py-1.5 px-3 rounded"
                                >
                                    {t('steps.cancelOrder')}
                                </button>
                            )}
                            {showReceiveButton && (
                                <button
                                    onClick={onReceiveClick}
                                    className="bg-black hover:bg-gray-800 text-white text-sm font-medium py-1.5 px-3 rounded"
                                >
                                    {t('steps.receiveOrder')}
                                </button>
                            )}
                            <span className="text-primary-text mt-1 sm:mt-0">
                                {new Intl.NumberFormat('vi-VN', { 
                                    style: 'currency', 
                                    currency: 'VND' 
                                }).format(orderDetail?.orderDetails?.[0]?.skuDto?.newPrice * (orderDetail?.orderDetails?.[0]?.quantity || 1) || 0)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="bg-gray-50 p-3 sm:p-4 rounded-b-lg">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                    <div className="flex items-center space-x-1 sm:space-x-2 mb-2 sm:mb-0">
                        {(() => {
                            const status = orderDetail?.orderDetails?.[0]?.shippingStatus;
                            const statusConfig = getStatusConfig(status);
                            return (
                                <>
                                    {statusConfig.icon}
                                    <span className={`font-semibold text-sm sm:text-base ${statusConfig.text}`}>
                                        {(() => {
                                            switch(status) {
                                                case 0: return t('orderDetails.status.created');
                                                case 1: return t('orderDetails.status.pending');
                                                case 2: return t('orderDetails.status.confirmed');
                                                case 3: return t('orderDetails.status.ship_pending');
                                                case 4: return t('orderDetails.status.ship_confirmed');
                                                case 5: return t('orderDetails.status.delivering');
                                                case 6: return t('orderDetails.status.delivered');
                                                case 7: return t('orderDetails.status.paid');
                                                case 8: return t('orderDetails.status.completed');
                                                case 9: return t('orderDetails.status.cancelled');
                                                default: return '';
                                            }
                                        })()}
                                    </span>
                                </>
                            );
                        })()}
                    </div>
                    <span className="text-sm sm:text-base text-gray-600">
                        {orderDetail?.orderDetails?.[0]?.createdAt ? 
                            new Intl.DateTimeFormat(window.location.pathname.split('/')[1] === 'vi' ? 'vi-VN' : window.location.pathname.split('/')[1] === 'en' ? 'en-US' : 'ko-KR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: false
                            }).format(new Date(orderDetail.orderDetails[0].createdAt)) : ''}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default OrderDetails; 