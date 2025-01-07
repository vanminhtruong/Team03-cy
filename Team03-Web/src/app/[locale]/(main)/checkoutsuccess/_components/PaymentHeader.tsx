import React from 'react';
import { Button } from 'primereact/button';
import { useTranslations } from 'next-intl';

interface PaymentHeaderProps {
    paymentStatus: 'success' | 'failure';
    onBackToHome: () => void;
}

export function PaymentHeader({ paymentStatus, onBackToHome }: PaymentHeaderProps) {
    const t = useTranslations('checkout');

    return (
        <div className="relative">
            <Button
                label={t('checkoutSuccess.backToHome')}
                icon="pi pi-home"
                onClick={onBackToHome}
                className="p-button-text p-button-secondary absolute top-4 left-[100px] z-10 mt-[-50px] max-sm:left-0"
                severity="secondary"
                text
            />
            <div className="flex items-center justify-center w-full py-8 mt-[50px]">
                {paymentStatus === 'success' ? (
                    <i className="pi pi-check-circle text-6xl text-green-500 translate-y-[-20px]"></i>
                ) : (
                    <i className="pi pi-times-circle text-6xl text-red-500 translate-y-[-20px] mt-[100px]"></i>
                )}
            </div>
        </div>
    );
} 