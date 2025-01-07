'use client';

import EmptyCartPage from './empty-cart/page';
import WithCartItemPage from './with-cart-item/page';
import { PrimeReactProvider } from 'primereact/api';
import useUserStore from '@/src/app/[locale]/(auth)/stores/useStore';
import { useEffect, useRef, useState } from 'react';
import { Toast } from 'primereact/toast';
import { getCart } from './service/serviceCart';
import Spinner from '@/src/components/spinner/spinner';
import { useTranslations } from 'next-intl';

const CartPage = () => {
    const { id } = useUserStore();
    const t = useTranslations("cart");
    const toast = useRef<Toast>(null);
    const [aliasData, setAliasData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const showMess = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({
            severity,
            summary,
            detail,
            life: 3000
        });
    };

    const getProductsInCart = async (userId: number) => {
        try {
            const response = await getCart(userId);
            setAliasData(response?.cartItems || []);
        } catch (error: any) {
            showMess('error', 'Error', error.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            getProductsInCart(id);
        }
    }, [id]);

    if (isLoading) {
        return (
            <div className="font-sans flex items-center justify-center min-h-screen">
                <Spinner isLoading={true} />
            </div>
        );
    }

    return (
        <div className="font-sans flex items-center justify-center min-h-screen">
            <Toast ref={toast} />
            <div className="p-6 max-w-[1280px] w-full">
                <PrimeReactProvider value={{ unstyled: false }}>
                    <h2>{t('title')}</h2>
                    {aliasData.length === 0 ? <EmptyCartPage /> : <WithCartItemPage />}
                </PrimeReactProvider>
            </div>
        </div>
    );
};

export default CartPage;
