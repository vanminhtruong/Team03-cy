'use client';
import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from '@/src/i18n/routing';
import Cookies from 'js-cookie';
import { useTranslations } from 'next-intl';
import { Toast } from 'primereact/toast';
import { Sidebar } from 'primereact/sidebar';
import { Button } from 'primereact/button';
import SearchComponent from './component/SearchComponent';
import NotificationBell from './component/NotificationBell';
import LanguageSelector from '@/src/components/LanguageSelector/LanguageSelector';
import { countCart, logOut } from './service/HeaderService';
import useHandleCart from '@/src/layout/store/useHandleCart';
import { useUserStore } from '@/src/app/[locale]/admin/stores/user';
import { ProductResponse } from '@/src/interface/product.interface';
import { fetchProducts } from '@/src/app/[locale]/(main)/service/homePageService';

export default function AppHeaderMobile() {
    const router = useRouter();
    const toast = useRef<Toast>(null);
    const [userName, setUserName] = useState<string | null>(null);
    const [useId, setUserId] = useState<string | null>(null);
    const [sidebarVisible, setSidebarVisible] = useState(false);
    const t = useTranslations('HomePage');
    const [loading, setLoading] = useState(true);
    const { triggerFetch } = useHandleCart();
    const [cartCount, setCartCount] = useState(0);
    const [products, setProducts] = useState<ProductResponse[]>([]);
    const [isLargeScreen, setIsLargeScreen] = useState(false);

    const token = Cookies.get('token');
    const userData = localStorage.getItem('user');
    const user = userData ? JSON.parse(userData) : {};
    const name = useUserStore((state) => state.name);

    useEffect(() => {
        const fetchInitialProducts = async () => {
            try {
                const { products, totalRecords } = await fetchProducts(0, 5);
                const randomProducts = products.sort(() => Math.random() - 0.5).slice(0, 5);
                setProducts(randomProducts);
            } catch (error) {
                console.error('Error fetching products:', error);
            }
        };
        fetchInitialProducts();
    }, []);

    useEffect(() => {
        if (token) {
            if (userData) {
                setUserName(user.state.name);
                setUserId(user.state.id);
            }
        }
        setLoading(false);
    }, [token, name]);

    useEffect(() => {
        if (useId) {
            const fetchCartCount = async () => {
                try {
                    const res = await countCart(useId);
                    setCartCount(res.data.data);
                } catch (error) {
                    console.error('Error fetching cart count:', error);
                }
            };
            fetchCartCount();
        }
    }, [useId, triggerFetch]);

    useEffect(() => {
        if (sidebarVisible) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [sidebarVisible]);

    useEffect(() => {
        const checkScreenSize = () => {
            setIsLargeScreen(window.innerWidth >= 1024);
            if (window.innerWidth >= 1024) {
                setSidebarVisible(false);
            }
        };

        checkScreenSize();

        window.addEventListener('resize', checkScreenSize);

        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    const handleLogout = async () => {
        const token = Cookies.get('token');
        setSidebarVisible(false);
        try {
            await logOut(token as string);
            window.location.href = '/';
            Cookies.remove('token');
            Cookies.remove('shop_status');
            localStorage.removeItem('user');
            setUserName('');
            setUserId(null);
            toast.current?.show({ severity: 'info', summary: t('info'), detail: t('logoutSuccess') });
        } catch (error) {
            console.error('Error while logging out:', error);
        }
    };

    const handleRegisterShop = () => {
        if (!useId) {
            router.push('/login');
            return;
        } else {
            router.push('/register-shop');
        }
    };

    if (loading) {
        return null;
    }

    return (
        <header className="lg:hidden shadow-md bg-white py-3 px-4 min-h-[70px] sticky top-0 left-0 right-0 z-50">
            <Toast ref={toast} />
            <div className="flex items-center justify-between">
                <Button 
                    icon="pi pi-bars" 
                    onClick={() => setSidebarVisible(true)}
                    className="p-button-text text-gray-700 hover:bg-gray-100"
                    style={{ padding: '0.5rem' }}
                />
                
                <div className="cursor-pointer" onClick={() => router.push('/')}>
                    <img 
                        className="w-[40px] h-[40px] rounded-sm object-cover" 
                        src="/layout/images/home-page/GRThree.png" 
                        alt="logo" 
                    />
                </div>

                <div className="flex items-center gap-3">
                    <NotificationBell />
                    <div 
                        onClick={() => router.push('/cart')}
                        className="cursor-pointer relative"
                    >
                        <i className="pi pi-shopping-cart text-2xl text-gray-700"></i>
                        {cartCount > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                                {cartCount}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-3 pr-4 max-sm:max-w-full">
                <SearchComponent products={products}/>
            </div>

            <Sidebar
                visible={sidebarVisible}
                onHide={() => setSidebarVisible(false)}
                className="w-[300px] p-0 border-0 overflow-hidden"
                showCloseIcon={false}
                modal={true}
                position="left"
                closeOnEscape={false}
                dismissable={false}
            >
                <div className="flex flex-col h-full overflow-hidden">
                    {/* Header */}
                    <div className="p-4 border-b bg-gray-50">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-lg font-medium text-gray-800">{t('menu')}</h2>
                            <Button
                                icon="pi pi-times"
                                onClick={() => setSidebarVisible(false)}
                                className="p-button-text p-button-rounded text-gray-600 hover:bg-gray-100"
                            />
                        </div>
                        {userName ? (
                            <div>
                                <p className="text-lg font-medium text-gray-800">
                                    {t('chillGuy')}, {userName}
                                </p>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <Button 
                                    label={t('login')}
                                    onClick={() => router.push('/login')}
                                    className="p-button-outlined flex-1 text-blue-600 border-blue-600 hover:bg-blue-50"
                                />
                                <Button 
                                    label={t('signup')}
                                    onClick={() => router.push('/signup')}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                                />
                            </div>
                        )}
                    </div>

                    {/* Menu Items */}
                    <div className="flex-1">
                        <div className="p-3">
                            <Button
                                label={t('seller')}
                                onClick={handleRegisterShop}
                                className="p-button-text w-full text-left text-gray-700 hover:bg-gray-100"
                                icon="pi pi-store"
                                style={{ justifyContent: 'flex-start', textAlign: 'left' }}
                            />
                            
                            {userName && (
                                <div className="space-y-1">
                                    <Button
                                        label={t('profile')}
                                        onClick={() => router.push('/profile')}
                                        className="p-button-text w-full text-left text-gray-700 hover:bg-gray-100"
                                        icon="pi pi-user"
                                        style={{ justifyContent: 'flex-start', textAlign: 'left' }}
                                    />
                                    <Button
                                        label={t('change')}
                                        onClick={() => router.push('/verify/password')}
                                        className="p-button-text w-full text-left text-gray-700 hover:bg-gray-100"
                                        icon="pi pi-key"
                                        style={{ justifyContent: 'flex-start', textAlign: 'left' }}
                                    />
                                    <Button
                                        label={t('purchase')}
                                        onClick={() => router.push('/purchase')}
                                        className="p-button-text w-full text-left text-gray-700 hover:bg-gray-100"
                                        icon="pi pi-shopping-bag"
                                        style={{ justifyContent: 'flex-start', textAlign: 'left' }}
                                    />
                                    <Button
                                        label={t('logout')}
                                        onClick={handleLogout}
                                        className="p-button-text w-full text-left text-red-600 hover:bg-red-50"
                                        icon="pi pi-sign-out"
                                        style={{ justifyContent: 'flex-start', textAlign: 'left' }}
                                    />
                                </div>
                            )}
                        </div>
                        <div className="border-t p-3 bg-gray-50">
                            <div className="flex items-center justify-between">
                                <LanguageSelector />
                            </div>
                        </div>
                    </div>
                </div>
            </Sidebar>
        </header>
    );
} 