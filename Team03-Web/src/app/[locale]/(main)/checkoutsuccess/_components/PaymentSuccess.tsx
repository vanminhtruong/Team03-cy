import React from 'react';
import { Card } from 'primereact/card';
import { Divider } from 'primereact/divider';
import { useTranslations } from 'next-intl';
import formatMoney from '@/src/utils/formatMoney';
import { ShippingInformation } from '@/src/app/[locale]/(main)/checkoutsuccess/_components/ShippingInformation';

interface ShippingInfo {
    name: string;
    phone: string;
    address: string;
}

interface PaymentSuccessProps {
    amount: number;
    transactionId: string;
    shipping: ShippingInfo | null;
}

export function PaymentSuccess({ amount, transactionId, shipping }: PaymentSuccessProps) {
    const t = useTranslations('checkout');

    return (
        <>
            <h1 className="text-3xl font-bold text-green-600 mb-6 tracking-tight">{t('checkoutSuccess.title')}</h1>
            <Card className="bg-gray-50 mb-8">
                <div className="space-y-4">
                    <div className="flex items-center justify-between py-3">
                        <span className="text-gray-600 text-lg">{t('checkoutSuccess.amount')}</span>
                        <span className="font-bold text-xl text-blue-600">{formatMoney(amount)}</span>
                    </div>
                    <Divider className="my-2" />
                    <div className="flex items-center justify-between py-3">
                        <span className="text-gray-600 text-lg">{t('checkoutSuccess.orderId')}</span>
                        <span className="font-semibold text-green-600">{transactionId}</span>
                    </div>
                </div>
            </Card>

            {shipping && <ShippingInformation shipping={shipping} />}

            <p className="text-gray-600 italic text-lg">{t('checkoutSuccess.thankYou')}</p>
        </>
    );
}
