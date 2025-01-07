import React, { forwardRef, useContext, useEffect, useImperativeHandle, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { classNames } from 'primereact/utils';
import Cookies from 'js-cookie';
import { AppTopbarRef } from '@/src/types';
import { LayoutContext } from '../../context/layoutcontext';
import { useRouter } from '@/src/i18n/routing';
import { useTranslations } from 'next-intl';
import LanguageSelector from '@/src/components/LanguageSelector/LanguageSelector';
import NotificationBell from './component/NotificationBell';
import { useParams } from 'next/navigation';

const AppTopbar = forwardRef<AppTopbarRef>((props, ref) => {
    const { layoutConfig, layoutState, onMenuToggle, showProfileSidebar } = useContext(LayoutContext);

    const menubuttonRef = useRef<HTMLButtonElement>(null);
    const topbarmenuRef = useRef<HTMLDivElement>(null);
    const topbarmenubuttonRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const t = useTranslations('AdminTopbar');
    const [userName, setUserName] = useState<string | null>(null);
    const [useId, setUserId] = useState<string | null>(null);
    const [isDropdownVisible, setDropdownVisible] = useState<boolean>(false);
    const params = useParams();
    const locale = params.locale;

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            const user = JSON.parse(userData);
            setUserName(user.state.name);
            setUserId(user.state.id);
        }
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownVisible(false);
            }
        };

        const handleEscapeKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setDropdownVisible(false);
            }
        };

        if (isDropdownVisible) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleEscapeKey);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscapeKey);
        };
    }, [isDropdownVisible]);

    useImperativeHandle(ref, () => ({
        menubutton: menubuttonRef.current,
        topbarmenu: topbarmenuRef.current,
        topbarmenubutton: topbarmenubuttonRef.current
    }));

    const handleLogout = useCallback(() => {
        Cookies.remove('token');
        localStorage.removeItem('user');
        router.push('/login')
    }, []);

    return (
        <div className="layout-topbar">
            <div className="cursor-pointer layout-topbar-logo">
                <img className="w-[50px] h-[50px] rounded-sm object-cover"  src="/layout/images/home-page/GRThree.png" alt="Logo" />
                <span className="text-xl font-medium ml-2">{t('SellerChannel')}</span>
            </div>

            <button ref={menubuttonRef} type="button" className="p-link layout-menu-button layout-topbar-button" onClick={onMenuToggle} aria-label="Toggle Menu">
                <i className="pi pi-bars" />
            </button>

            <button ref={topbarmenubuttonRef} type="button" className="p-link layout-topbar-menu-button layout-topbar-button" onClick={showProfileSidebar} aria-label="Profile Sidebar">
                <i className="pi pi-ellipsis-v" />
            </button>

            <div
                ref={topbarmenuRef}
                className={classNames('layout-topbar-menu', {
                    'layout-topbar-menu-mobile-active': layoutState.profileSidebarVisible
                })}
            >
                <div ref={dropdownRef} className="flex justify-center items-center relative">
                    <div className="relative mr-4">
                        <NotificationBell userId={useId} />
                    </div>
                    <LanguageSelector />
                    <button className="cursor-pointer flex items-center ml-4" onClick={() => setDropdownVisible(!isDropdownVisible)} aria-expanded={isDropdownVisible} aria-haspopup="true">
                        <span className="mr-2">{t('Greeting')}</span>
                        <span>{userName || 'Guest'}</span>
                        <i className={`ml-2 pi ${isDropdownVisible ? 'pi-angle-up' : 'pi-angle-down'}`} />
                    </button>

                    {isDropdownVisible && (
                        <div className="absolute p-2 right-0 top-[40px] mt-2 w-auto bg-white border rounded-md shadow-lg z-50" role="menu" aria-orientation="vertical">
                            <ul className="py-2">
                                <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer" role="menuitem">
                                    <button onClick={handleLogout} className="w-full text-left">
                                        {t('Logout')}
                                    </button>
                                </li>
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});

AppTopbar.displayName = 'AppTopbar';

export default AppTopbar;
