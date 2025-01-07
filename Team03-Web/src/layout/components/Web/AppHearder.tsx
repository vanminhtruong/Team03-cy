'use client';
import React, { useEffect, useRef, useState } from 'react';
import LanguageSelector from '@/src/components/LanguageSelector/LanguageSelector';
import { useRouter } from '@/src/i18n/routing';
import Cookies from 'js-cookie';
import { useTranslations } from 'next-intl';
import { Toast } from 'primereact/toast';
import Spinner from '@/src/components/spinner/spinner';
import { countCart, logOut, connectWebSocket, type NotificationResponse, fetchNotifications, updateNotificationStatus } from '@/src/layout/components/Web/service/HeaderService';
import useHandleCart from '@/src/layout/store/useHandleCart';
import { ProductResponse } from '@/src/interface/product.interface';
import { fetchProducts } from '@/src/app/[locale]/(main)/service/homePageService';
import NotificationBell from './component/NotificationBell';
import { useUserStore } from '@/src/app/[locale]/admin/stores/user';
import SearchComponent from '@/src/layout/components/Web/component/SearchComponent';

type NavItem = {
    label: string;
    href: string;
    onClick?: React.MouseEventHandler<HTMLLIElement>;
};

export default function AppHeader() {
    const router = useRouter();
    const toast = useRef<Toast>(null);
    const [userName, setUserName] = useState<string | null>(null);
    const [useId, setUserId] = useState<string | null>(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const ti = (key: string) => key;
    const t = useTranslations('HomePage');
    const [loading, setLoading] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [currentPath, setCurrentPath] = useState<string>('');

    const { triggerFetch, setTriggerFetch } = useHandleCart();
    const [cartCount, setCartCount] = useState(0);
    const [showProducts, setShowProducts] = useState(false);
    const [products, setProducts] = useState<ProductResponse[]>([]);

    const token = Cookies.get('token');
    const userData = localStorage.getItem('user');
    const user = userData ? JSON.parse(userData) : {};
    const name = useUserStore((state) => state.name);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
    const [notificationCount, setNotificationCount] = useState(0);
    const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
    const wsConnectionRef = useRef<{ disconnect: () => void } | null>(null);

    const fetchAndUpdateNotifications = async (userId: string) => {
        try {
            const notificationsData = await fetchNotifications(userId);

            const unreadCount = notificationsData.filter((notification) => notification.isRead === 0).length;

            setNotifications(notificationsData);
            setNotificationCount(unreadCount);
            setHasUnreadNotifications(unreadCount > 0);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

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
    }, [useId, triggerFetch, setTriggerFetch]);

    useEffect(() => {
        if (useId) {
            fetchAndUpdateNotifications(useId);
        }
    }, [useId]);

    useEffect(() => {
        if (useId) {
            console.log('Initializing WebSocket with userId:', useId);
            const connection = connectWebSocket(useId, {
                onNotification: (notification) => {
                    console.log('Notification matches userId, updating state');
                    fetchAndUpdateNotifications(useId);

                    toast.current?.show({
                        severity: 'info',
                        summary: t('notifications.newOrder'),
                        detail: notification.notifyTitle,
                        life: 5000
                    });
                },
                onError: (error) => {
                    console.error('WebSocket error:', error);
                }
            });

            if (connection) {
                wsConnectionRef.current = connection;
            }
        }
        return () => {
            if (wsConnectionRef.current) {
                wsConnectionRef.current.disconnect();
            }
        };
    }, [useId, t]);

    const handleMarkAsRead = async () => {
        if (!useId) return;

        try {
            setIsLoading(true);
            const success = await updateNotificationStatus(useId);

            if (!success) {
                throw new Error('Failed to update notification status');
            }

            const updatedNotifications = notifications.map((notification) => ({
                ...notification,
                isRead: 1
            }));

            setNotifications(updatedNotifications);
            setHasUnreadNotifications(false);
            setNotificationCount(0);
        } catch (error) {
            console.error('Error marking notifications as read:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (window.location.pathname.includes('/checkoutsuccess') && useId) {
            fetchAndUpdateNotifications(useId);
        }
    }, [useId, window.location.pathname]);

    if (loading) {
        return null;
    }
    const handleLogout = async () => {
        const token = Cookies.get('token');
        setMenuOpen(false);
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
    const handleScrollToJustForYou = () => {
        const element = document.getElementById('justForYou');
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    };

    const handleScrollToCategory = () => {
        const element = document.getElementById('category');
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    };

    const navItems: NavItem[] = [
        { label: t('home'), href: '/' },
        { label: t('products'), href: '', onClick: handleScrollToJustForYou },
        { label: t('category'), href: '', onClick: handleScrollToCategory },
        { label: t('kids'), href: '' }
    ];
    const handleRegisterShop = async () => {
        if (!useId) {
            router.push('/login');
            return;
        } else {
            router.push('/register-shop');
        }
    };
    return (
        <header className="hidden lg:flex shadow-md bg-white py-4 sm:px-8 px-6 min-h-[80px] tracking-wide sticky top-0 left-0 right-0 justify-center item-center z-50">
            <Toast ref={toast} />
            <Spinner isLoading={isLoading} />
            <div className="flex flex-col items-center lg:gap-y-2 gap-3 max-w-[1280px] w-full">
                <div className="flex w-full justify-between text-[14px] items-center">
                    <div>
                        <div className="flex justify-content-center items-center gap-5">
                            <div className="border-3 cursor-pointer" onClick={() => router.push('/')}>
                                <img className="w-[50px] height-[50px] rounded-sm object-cover" src="/layout/images/home-page/GRThree.png" alt="" />
                            </div>
                            <div>
                                <span onClick={handleRegisterShop} className="cursor-pointer hover:text-blue-600">
                                    {t('seller')}
                                </span>{' '}
                                | <span className=" cursor-pointer hover:text-blue-600">{t('connect')}</span>
                            </div>
                        </div>
                    </div>
                    <div className="hidden lg:block">
                        <SearchComponent products={products} />
                    </div>
                    <div className="flex items-center space-x-4">
                        <NotificationBell />
                        <div
                            onClick={() => {
                                router.push('/cart');
                            }}
                            className="cursor-pointer mr-5 ml-2"
                        >
                            <div className="flex items-center space-x-8">
                                <span className="relative">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="30px" height="30px" className="fill-[#333] inline" viewBox="0 0 512 512">
                                        <path
                                            d="M164.96 300.004h.024c.02 0 .04-.004.059-.004H437a15.003 15.003 0 0 0 14.422-10.879l60-210a15.003 15.003 0 0 0-2.445-13.152A15.006 15.006 0 0 0 497 60H130.367l-10.722-48.254A15.003 15.003 0 0 0 105 0H15C6.715 0 0 6.715 0 15s6.715 15 15 15h77.969c1.898 8.55 51.312 230.918 54.156 243.71C131.184 280.64 120 296.536 120 315c0 24.812 20.188 45 45 45h272c8.285 0 15-6.715 15-15s-6.715-15-15-15H165c-8.27 0-15-6.73-15-15 0-8.258 6.707-14.977 14.96-14.996zM477.114 90l-51.43 180H177.032l-40-180zM150 405c0 24.813 20.188 45 45 45s45-20.188 45-45-20.188-45-45-45-45 20.188-45 45zm45-15c8.27 0 15 6.73 15 15s-6.73 15-15 15-15-6.73-15-15 6.73-15 15-15zm167 15c0 24.813 20.188 45 45 45s45-20.188 45-45-20.188-45-45-45-45 20.188-45 45zm45-15c8.27 0 15 6.73 15 15s-6.73 15-15 15-15-6.73-15-15 6.73-15 15-15zm0 0"
                                            data-original="#000000"
                                        ></path>
                                    </svg>
                                    {cartCount > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{cartCount}</span>}
                                </span>
                            </div>
                        </div>
                        <div className="relative">
                            <LanguageSelector />
                        </div>
                        {userName ? (
                            <div className="relative cursor-pointer" onMouseEnter={() => setMenuOpen(true)} onMouseLeave={() => setMenuOpen(false)}>
                                <span className="hover:text-blue-600">
                                    {t('title')}, {userName}
                                </span>
                                {menuOpen && <div className="fixed inset-0 bg-black opacity-30 z-40 pointer-events-none"></div>}
                                {menuOpen && (
                                    <div
                                        className={` absolute right-0 w-[300px] bg-white rounded-3xl shadow-xl z-50 p-4 transition-duration-3000 duration-300 ${
                                            menuOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-4 scale-95 pointer-events-none'
                                        }`}
                                    >
                                        <div className="flex items-center ml-2 mb-4">
                                            <div>
                                                <p className="text-gray-800 className='text-[16px]'">
                                                    {t('chillGuy')}, {userName}
                                                </p>
                                            </div>
                                        </div>
                                        <ul className="text-gray-700 text-sm space-y-2">
                                            <li
                                                onClick={() => {
                                                    router.push('/profile');
                                                    setMenuOpen(false);
                                                }}
                                                className="flex items-center space-x-2 hover:bg-gray-100 p-2 rounded cursor-pointer"
                                            >
                                                <i className="pi pi-user"></i>
                                                <span className="text-[14px]">{t('profile')}</span>
                                            </li>
                                            <li
                                                onClick={() => {
                                                    router.push('/verify/password');
                                                    setMenuOpen(false);
                                                }}
                                                className="flex items-center space-x-2 hover:bg-gray-100 p-2 rounded cursor-pointer"
                                            >
                                                <i className="pi pi-key"></i>
                                                <span className="text-[14px]">{t('change')}</span>
                                            </li>
                                            <li
                                                onClick={() => {
                                                    router.push('/address');
                                                    setMenuOpen(false);
                                                }}
                                                className="flex items-center space-x-2 hover:bg-gray-100 p-2 rounded cursor-pointer"
                                            >
                                                <i className="pi pi-align-left"></i>
                                                <span className="text-[14px]">{t('address')}</span>
                                            </li>
                                            <li
                                                onClick={() => {
                                                    router.push('/purchase');
                                                    setMenuOpen(false);
                                                }}
                                                className="flex items-center space-x-2 hover:bg-gray-100 p-2 rounded cursor-pointer"
                                            >
                                                <i className="pi pi-shopping-bag"></i>
                                                <span className="text-[14px]">{t('purchase')}</span>
                                            </li>
                                            <li onClick={() => handleLogout()} className="flex items-center space-x-2 hover:bg-gray-100 p-2 rounded cursor-pointer text-red-600">
                                                <i className="pi pi-sign-out"></i>
                                                <span className="text-[14px]">{t('logout')}</span>
                                            </li>
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center space-x-4">
                                <span
                                    onClick={() => {
                                        router.push('/login');
                                    }}
                                    className="cursor-pointer hover:text-blue-600"
                                >
                                    {t('login')}
                                </span>
                                <span
                                    onClick={() => {
                                        router.push('/signup');
                                    }}
                                    className="cursor-pointer hover:text-blue-600"
                                >
                                    {t('signup')}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
