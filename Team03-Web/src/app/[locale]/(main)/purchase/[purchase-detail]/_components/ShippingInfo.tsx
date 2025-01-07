import React from 'react';
import { CarOutlined } from '@ant-design/icons';
import { useTranslations } from 'next-intl';

interface ShippingInfoProps {
    orderDetail: any;
}

const ShippingInfo: React.FC<ShippingInfoProps> = ({ orderDetail }) => {
    const t = useTranslations('purchaseDetail');

    return (
        <div className="mt-4 sm:mt-6 bg-white shadow-sm border rounded-lg">
            <div className="flex items-center justify-between p-3 sm:p-4 border-b">
                <div className="flex items-center space-x-1 sm:space-x-2">
                    <CarOutlined className="text-green-500 text-xl sm:text-2xl" />
                    <span className="font-bold text-lg sm:text-xl text-gray-800">{t('shippingAddress.title')}</span>
                </div>
            </div>
            <div className="p-3 sm:p-4 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center">
                    <span className="sm:w-1/4 text-gray-700 font-semibold">{t('shippingAddress.receiver')}:</span>
                    <span className="mt-1 sm:mt-0">{orderDetail?.order?.customerName || t('shippingAddress.notUpdated')}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center">
                    <span className="sm:w-1/4 text-gray-700 font-semibold">{t('shippingAddress.phone')}:</span>
                    <span className="mt-1 sm:mt-0">{orderDetail?.order?.phoneReception || t('shippingAddress.notUpdated')}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center">
                    <span className="sm:w-1/4 text-gray-700 font-semibold">{t('shippingAddress.address')}:</span>
                    <div className="mt-1 sm:mt-0">
                        <div>{orderDetail?.order?.shippingAddress || t('shippingAddress.notUpdated')}</div>
                    </div>
                </div>
                {orderDetail?.order?.note && (
                    <div className="flex flex-col sm:flex-row sm:items-center">
                        <span className="sm:w-1/4 text-gray-700 font-semibold">{t('shippingAddress.note')}:</span>
                        <span className="mt-1 sm:mt-0">{orderDetail.order.note}</span>
                    </div>
                )}
                {orderDetail?.orderDetails?.[0]?.shippingStatus === 9 && (
                    <div className="flex flex-col sm:flex-row sm:items-center">
                        <span className="sm:w-1/4 text-gray-700 font-semibold">{t('shippingAddress.status')}:</span>
                        <span className="mt-1 sm:mt-0 text-red-500">{t('steps.cancelled')}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ShippingInfo; 