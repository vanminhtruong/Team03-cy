'use client';
import React from 'react';
import { Card } from 'primereact/card';
import { Divider } from 'primereact/divider';
import { Image } from 'primereact/image';
import { OrderDetailData } from '@/src/app/[locale]/admin/orders/[order-history]/interface';
import formatMoney from '@/src/utils/formatMoney';

interface OrderItemsProps {
    orderData: OrderDetailData;
    t: (key: string, params?: any) => string;
}

export const OrderItems: React.FC<OrderItemsProps> = ({
    orderData,
    t
}) => {
    return (
        <Card className="w-2/3 max-xl:w-full max-lg:w-full">
            <div className="flex justify-between items-center mb-4 max-md:flex-col max-md:gap-2">
                <div className="flex items-center gap-2">
                    <i className="pi pi-shopping-cart text-xl max-md:text-lg"></i>
                    <h2 className="text-xl font-semibold max-md:text-lg">{t('orderItems')}</h2>
                </div>
                <div className="text-lg font-semibold text-gray-900 max-md:text-base">
                    {t('total')}: {formatMoney(orderData.order.totalPrice)}
                </div>
            </div>
            <Divider className="my-3" />
            <div className="space-y-4 max-h-96 overflow-y-auto">
                {orderData.orderDetails.map((item) => (
                    <div key={item.id} className="p-4 bg-gray-50 rounded-lg max-md:p-3">
                        <div className="flex items-center justify-between max-xl:flex-col max-xl:items-start max-xl:gap-4">
                            <div className="flex items-center gap-4 max-md:flex-col max-md:items-start max-md:gap-3">
                                <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden max-md:w-[120px] max-md:h-[120px] max-sm:w-[100px] max-sm:h-[100px]">
                                    <Image src={item.skuDto.image || 'https://via.placeholder.com/150'} alt={item.productName} width="120" height="120" className="w-full h-full object-cover" preview />
                                </div>
                                <div className="max-md:w-full">
                                    <p className="font-semibold text-gray-900 max-md:text-base">{item.productName}</p>
                                    <p className="text-sm text-gray-500 mt-1 max-md:text-sm">
                                        {item.skuDto.option1.name}: {item.skuDto.option1.value.name}
                                        {item.skuDto.option2 && `, ${item.skuDto.option2.name}: ${item.skuDto.option2.value.name}`}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-6 max-xl:flex-row max-xl:justify-between max-xl:w-full max-md:flex-col max-md:items-start max-md:gap-2">
                                <div className="text-gray-600 max-md:text-sm">
                                    <span className="font-medium">{t('quantity')}:</span> {item.quantity}
                                </div>
                                <div className="text-gray-900 font-semibold text-lg w-32 text-right max-md:text-base max-md:w-full">{formatMoney(item.price)}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
};
