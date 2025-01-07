'use client';

import React, { useEffect, useState } from "react";
import { Card } from 'primereact/card';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { PaymentHeader } from '../checkoutsuccess/_components/PaymentHeader';
import { PaymentFailure } from '../checkoutsuccess/_components/PaymentFailure';
import Spinner from '@/src/components/spinner/spinner';

function CheckoutFail() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const params = useParams();
    const locale = params.locale as string;
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        window.history.pushState(null, '', window.location.href);

        const handlePopState = () => {
            router.push(`/${locale}`);
        };

        window.addEventListener('popstate', handlePopState);
        setIsReady(true);
        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, [router, locale]);

    const handleBackToHome = () => {
        router.push(`/${locale}`);
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {isReady ? (
                <div className="h-screen pb-5">
                    <Card
                        header={<PaymentHeader paymentStatus="failure" onBackToHome={handleBackToHome} />}
                        className="overflow-hidden bg-white h-full"
                        style={{ margin: 0, height: '100vh' }}
                    >
                        <div className="text-center p-8 mt-[-100px] max-w-4xl mx-auto">
                            <PaymentFailure />
                        </div>
                    </Card>
                </div>
            ) : (
                <Spinner isLoading={!isReady} />
            )}
        </div>
    );
}

export default CheckoutFail;