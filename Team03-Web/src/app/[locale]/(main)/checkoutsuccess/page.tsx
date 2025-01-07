'use client';

import React, { useEffect, useState } from "react";
import { Card } from 'primereact/card';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Spinner from '@/src/components/spinner/spinner';
import { PaymentHeader } from './_components/PaymentHeader';
import { PaymentSuccess } from './_components/PaymentSuccess';
import { PaymentFailure } from './_components/PaymentFailure';

interface ShippingInfo {
    name: string;
    phone: string;
    address: string;
}

function CheckoutSuccess() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const params = useParams();
    const locale = params.locale as string;
    const t = useTranslations('checkout.checkoutSuccess');
    
    const [paymentStatus, setPaymentStatus] = useState<'success' | 'failure'>('success');
    const [paymentInfo, setPaymentInfo] = useState({
        amount: 0,
        transactionId: '',
        shipping: null as ShippingInfo | null
    });
    const [isReady, setIsReady] = useState(false);

    const amount = searchParams.get('amount');
    const tex = searchParams.get('tex');
    const shipping = searchParams.get('shipping');

    useEffect(() => {
        window.history.pushState(null, '', window.location.href);

        const handlePopState = () => {
            router.push(`/${locale}`);
        };

        window.addEventListener('popstate', handlePopState);
        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, [router, locale]);

    useEffect(() => {
        if (amount === null && tex === null) {
            setPaymentStatus('failure');
            setPaymentInfo({
                amount: 0,
                transactionId: '',
                shipping: null
            });
            setIsReady(true);
            return;
        }

        if (
            amount === null ||
            tex === null ||
            amount.trim() === '' ||
            tex.trim() === '' ||
            isNaN(parseFloat(amount)) ||
            parseFloat(amount) <= 0
        ) {
            setPaymentStatus('failure');
            setPaymentInfo({
                amount: 0,
                transactionId: '',
                shipping: null
            });
        } else {
            setPaymentStatus('success');
            let shippingInfo = null;
            try {
                if (shipping) {
                    shippingInfo = JSON.parse(decodeURIComponent(shipping));
                }
            } catch (error) {
                console.error('Error parsing shipping info:', error);
            }
            setPaymentInfo({
                amount: parseFloat(amount),
                transactionId: tex,
                shipping: shippingInfo
            });
        }
        setIsReady(true);
    }, [amount, tex, shipping]);

    const handleBackToHome = () => {
        router.push(`/${locale}`);
    };

    return (
        <div className="min-h-screen bg-white" >
                {isReady ? (
                    <div className="h-screen pb-5">
                        <Card
                            header={<PaymentHeader paymentStatus={paymentStatus} onBackToHome={handleBackToHome} />}
                            className="overflow-hidden bg-white h-full"
                            style={{ margin: 0, height: '100vh' }}
                        >
                            <div className="text-center p-8 mt-[-100px] max-w-4xl mx-auto">
                                {paymentStatus === 'success' ? (
                                    <PaymentSuccess
                                        amount={paymentInfo.amount}
                                        transactionId={paymentInfo.transactionId}
                                        shipping={paymentInfo.shipping}
                                    />
                                ) : (
                                    <PaymentFailure />
                                )}
                            </div>
                        </Card>
                    </div>
                ) : (
                <Spinner isLoading={!isReady} />
            )}
        </div>
    );
}

export default CheckoutSuccess;