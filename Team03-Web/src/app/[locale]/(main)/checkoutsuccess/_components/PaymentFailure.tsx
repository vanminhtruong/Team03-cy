import React from 'react';
import { Card } from 'primereact/card';
import { useTranslations } from 'next-intl';

export function PaymentFailure() {
    const t = useTranslations('checkout');

    return (
        <>
            <h1 className="text-3xl font-bold text-red-600 mb-6 tracking-tight">
                {t('checkoutSuccess.failureTitle')}
            </h1>
            <Card className="bg-gray-50 mb-8">
                <div className="space-y-4">
                    <p className="text-lg text-gray-700">
                        {t('checkoutSuccess.failureMessage')}
                    </p>
                    <p className="text-gray-600">
                        {t('checkoutSuccess.failureSupport')}
                    </p>
                </div>
            </Card>
        </>
    );
} 