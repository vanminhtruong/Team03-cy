'use client';
import React from 'react';
import { Card } from 'primereact/card';
import { Divider } from 'primereact/divider';
import { OrderDetailData } from '@/src/app/[locale]/admin/orders/[order-history]/interface';

interface CustomerInformationProps {
    orderData: OrderDetailData;
    t: (key: string, params?: any) => string;
}

export const CustomerInformation: React.FC<CustomerInformationProps> = ({
    orderData,
    t
}) => {
    return (
        <Card className="w-1/3 h-full max-xl:w-full max-lg:w-full">
            <div className="flex flex-col h-full">
                <div className="flex items-center gap-2 mb-2 max-md:text-base">
                    <i className="pi pi-user text-lg text-gray-900 max-md:text-base"></i>
                    <h2 className="text-lg font-semibold max-md:text-base">{t('customerInformation')}</h2>
                </div>
                <Divider className="my-2" />
                <div className="flex-1 space-y-2">
                    <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors max-md:p-2">
                        <div className="flex items-center mb-1 max-sm:flex-wrap">
                            <i className="pi pi-id-card text-gray-900 mr-2"></i>
                            <span className="text-sm font-medium text-gray-700 max-md:text-xs">{t('customerName')}</span>
                        </div>
                        <div className="text-sm pl-6 text-gray-900 max-md:text-xs max-md:pl-4">{orderData.order.customerName || orderData.order.user.name}</div>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors max-md:p-2">
                        <div className="flex items-center mb-1 max-sm:flex-wrap">
                            <i className="pi pi-phone text-gray-900 mr-2"></i>
                            <span className="text-sm font-medium text-gray-700 max-md:text-xs">{t('phoneNumber')}</span>
                        </div>
                        <div className="text-sm pl-6 text-gray-900 max-md:text-xs max-md:pl-4">{orderData.order.phoneReception || orderData.order.user.phone || t('notUpdated')}</div>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors max-md:p-2">
                        <div className="flex items-center mb-1 max-sm:flex-wrap">
                            <i className="pi pi-envelope text-gray-900 mr-2"></i>
                            <span className="text-sm font-medium text-gray-700 max-md:text-xs">{t('email')}</span>
                        </div>
                        <div className="text-sm pl-6 text-gray-900 max-md:text-xs max-md:pl-4">{orderData.order.user.email}</div>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors max-md:p-2">
                        <div className="flex items-center mb-1 max-sm:flex-wrap">
                            <i className="pi pi-map-marker text-gray-900 mr-2"></i>
                            <span className="text-sm font-medium text-gray-700 max-md:text-xs">{t('deliveryAddress')}</span>
                        </div>
                        <div className="text-sm pl-6 text-gray-900 max-md:text-xs max-md:pl-4">{orderData.order.shippingAddress}</div>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors max-md:p-2">
                        <div className="flex items-center mb-1 max-sm:flex-wrap">
                            <i className="pi pi-wallet text-gray-900 mr-2"></i>
                            <span className="text-sm font-medium text-gray-700 max-md:text-xs">{t('paymentMethod')}</span>
                        </div>
                        <div className="text-sm pl-6 text-gray-900 max-md:text-xs max-md:pl-4">{orderData.order.methodCheckout}</div>
                    </div>
                </div>
            </div>
        </Card>
    );
}; 