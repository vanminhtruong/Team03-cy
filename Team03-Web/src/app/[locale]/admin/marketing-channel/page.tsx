'use client';
import React, { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { TabMenu } from 'primereact/tabmenu';
import { Toast } from 'primereact/toast';
import { useTranslations } from 'next-intl';
import { getPromotion } from '@/src/app/[locale]/admin/marketing-channel/service/getPromotion';
import formatDateTime from '@/src/utils/formatDateTime';
import { getPromotionByShop } from '@/src/app/[locale]/admin/marketing-channel/service/getPromotionByShop';
import { addProductPromotion } from '@/src/app/[locale]/admin/marketing-channel/service/addProductPromotion';
import { getProductByShop } from '@/src/app/[locale]/admin/marketing-channel/service/getProductByShop';
import DialogProduct from '@/src/app/[locale]/admin/marketing-channel/component/DialogProduct';
import '@/public/css/customCSS.css';
import { cancelProductPromotion } from '@/src/app/[locale]/admin/marketing-channel/service/cancelProductPromotion';

interface Category {
    categoryId: string;
    categoryName: string;
}

export interface Product {
    productId: string;
    productName: string;
    image: string;
    category: {
        categoryName: string;
    };
    modifiedAt: string;
    oldPrice: number;
    isRegistered?: boolean;
    rating?: number;
    status?: string;
    price?: number;
}

interface Promotion {
    id: string;
    name: string;
    discountPercentage: number;
    startDate: string;
    endDate: string;
    status: string;
    description?: string;
}

export default function PromotionRegistration() {
    const t = useTranslations('promotion');
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [registeredPromotions, setRegisteredPromotions] = useState<string[]>([]);
    const [dialogVisible, setDialogVisible] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
    const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
    const [loading, setLoading] = useState(false);
    const toast = React.useRef<Toast>(null);
    const userData = localStorage.getItem('user');
    const user = userData ? JSON.parse(userData) : null;
    const shopId = user?.state?.id;

    const fetchPromotions = async () => {
        setLoading(true);
        try {
            const response = await getPromotion();
            const promotionData = response.data.data.content.map((item: Promotion) => {
                const now = new Date();
                const startDate = new Date(item.startDate);
                const endDate = new Date(item.endDate);

                let status = '';
                if (now < startDate) status = t('status.upcoming');
                else if (now >= startDate && now <= endDate) status = t('status.ongoing');
                else status = t('status.ended');

                return { ...item, status };
            });

            setPromotions(promotionData);
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'errors',
                detail: t('messages.errors.loadPromotions')
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchShopProducts = async () => {
        setLoading(true);
        try {
            if (!shopId) {
                throw new Error('Shop ID not found');
            }

            const response = await getProductByShop(shopId);
            if (Array.isArray(response)) {
                const activeProducts = response.filter((product) => product.status === 1);
                setProducts(activeProducts);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            toast.current?.show({
                severity: 'error',
                summary: '.errors',
                detail: t('messages.errors.loadProducts'),
                life: 3000
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchPromotionShop = async () => {
            try {
                if (!shopId) throw new Error('Shop ID not found');
                const res = await getPromotionByShop(shopId);
                const registeredIds = res.data.data.content.map((p: Promotion) => p.id);
                setRegisteredPromotions(registeredIds);
            } catch (e) {
                console.error(e);
            }
        };

        fetchPromotions();
        fetchShopProducts();
        fetchPromotionShop();
    }, [dialogVisible]);

    const handleOpenRegistration = (promotion: Promotion) => {
        if (promotion.status === t('status.ended')) {
            toast.current?.show({
                severity: 'warn',
                summary: 'warnings',
                detail: t('messages.warnings.promotionEnded'),
                life: 3000
            });
            return;
        }

        setSelectedPromotion(promotion);
        setSelectedProducts([]);
        setDialogVisible(true);
    };

    const handleRegisterProducts = async () => {
        if (!selectedPromotion || selectedProducts.length === 0) {
            toast.current?.show({
                severity: 'warn',
                summary: 'warnings',
                detail: t('messages.warnings.selectProducts'),
                life: 3000
            });
            return;
        }

        try {
            const productIds = selectedProducts.map((product) => product.productId);
            await addProductPromotion(selectedPromotion.id, productIds);

            toast.current?.show({
                severity: 'success',
                summary: 'success',
                detail: t('messages.success.registerSuccess'),
                life: 3000
            });

            setSelectedProducts([]);
            fetchShopProducts();
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'errors',
                detail: t('messages.errors.registerProducts'),
                life: 3000
            });
        }
    };

    const tabMenuItems = [
        { label: t('tabs.all'), icon: 'pi pi-list' },
        { label: t('tabs.upcoming'), icon: 'pi pi-clock' },
        { label: t('tabs.ongoing'), icon: 'pi pi-play' },
        { label: t('tabs.ended'), icon: 'pi pi-check' }
    ];

    const getSeverity = (status: string) => {
        switch (status) {
            case t('status.upcoming'):
                return 'info';
            case t('status.ongoing'):
                return 'success';
            case t('status.ended'):
                return 'danger';
            default:
                return 'info';
        }
    };

    const onUnregister = async () => {
        const selectedProductIds = selectedProducts.map((product) => parseInt(product.productId, 10));
        const promotionId = selectedPromotion?.id;

        if (!promotionId || selectedProductIds.length === 0) {
            toast.current?.show({
                severity: 'warn',
                summary: 'warnings',
                detail: t('messages.warnings.selectPromotionAndProducts'),
                life: 3000
            });
            return;
        }

        try {
            await cancelProductPromotion(promotionId, selectedProductIds);
            toast.current?.show({
                severity: 'success',
                summary: 'success',
                detail: t('messages.success.cancelSuccess'),
                life: 3000
            });
            setSelectedProducts([]);
            fetchShopProducts();
        } catch (e) {
            toast.current?.show({
                severity: 'error',
                summary: 'errors',
                detail: t('messages.errors.cancelPromotion'),
                life: 3000
            });
        }
    };

    return (
        <div className="card h-full">
            <Toast ref={toast} />
            <div className="p-2">
                <h1 className="text-2xl font-semibold mb-4">{t('pageTitle')}</h1>
                <TabMenu model={tabMenuItems} activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)} className="mb-4" />
                <div className="flex gap-3 flex-col">
                    {promotions
                        .filter((item) => {
                            if (activeIndex === 1) return item.status === t('status.upcoming');
                            if (activeIndex === 2) return item.status === t('status.ongoing');
                            if (activeIndex === 3) return item.status === t('status.ended');
                            return true;
                        })
                        .map((item) => (
                            <div key={item.id} className="p-4 border rounded-md shadow-md bg-white flex justify-between items-center transition-transform duration-300 ease-in-out hover:scale-104 hover:-translate-y-1 hover:shadow-lg">
                                <div>
                                    <p className="flex gap-3">
                                        <Tag value={item.status} severity={getSeverity(item.status)} className="text-sm mb-2" />
                                        <span className="text-3xl font-bold">{item.name}</span>
                                    </p>
                                    <p className="text-xl font-semibold">{t('discount', { percentage: item.discountPercentage })}</p>
                                    <p className="text-gray-600">
                                        {t('programPeriod', {
                                            startDate: formatDateTime(item.startDate),
                                            endDate: formatDateTime(item.endDate)
                                        })}
                                    </p>
                                    {item.description && <p className="text-gray-500 mt-2">{item.description}</p>}
                                </div>
                                <Button
                                    className={registeredPromotions.includes(item.id) ? 'bg-black text-white' : 'bg-black text-white'}
                                    onClick={() => item.status !== t('status.ended') && handleOpenRegistration(item)}
                                    label={item.status === t('status.ended') ? t('buttons.ended') : registeredPromotions.includes(item.id) ? t('buttons.registered') : t('buttons.register')}
                                    severity={item.status === t('status.ended') ? 'secondary' : 'info'}
                                    disabled={item.status === t('status.ended')}
                                />
                            </div>
                        ))}
                </div>
            </div>

            <DialogProduct
                visible={dialogVisible}
                onHide={() => {
                    setDialogVisible(false);
                    setSelectedProducts([]);
                    setSelectedPromotion(null);
                }}
                selectedPromotion={selectedPromotion}
                products={products}
                selectedProducts={selectedProducts}
                onSelectionChange={(products) => setSelectedProducts(products)}
                onRegister={handleRegisterProducts}
                loading={loading}
                onUnregister={onUnregister}
            />
        </div>
    );
}
