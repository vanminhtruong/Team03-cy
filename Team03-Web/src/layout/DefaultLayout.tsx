'use client';
import React, { useContext, useEffect, useRef } from 'react';
import { classNames } from 'primereact/utils';
import { LayoutContext } from './context/layoutcontext';
import AppFooter from './components/Web/AppFooter';
import AppHeaderWrapper from './components/Web/AppHeaderWrapper';

const DefaultLayout = ({ children }: { children: React.ReactNode }) => {
    const { layoutConfig, layoutState, setLayoutState } = useContext(LayoutContext);
    const sidebarRef = useRef<HTMLDivElement>(null);

    const hideMenu = () => {
        setLayoutState((prev) => ({
            ...prev,
            overlayMenuActive: false,
            staticMenuMobileActive: false,
            menuHoverActive: false
        }));
        unblockBodyScroll();
    };

    const blockBodyScroll = () => {
        document.body.classList.add('blocked-scroll');
    };

    const unblockBodyScroll = () => {
        document.body.classList.remove('blocked-scroll');
    };

    useEffect(() => {
        if (layoutState.overlayMenuActive || layoutState.staticMenuMobileActive) {
            blockBodyScroll();
        } else {
            unblockBodyScroll();
        }
    }, [layoutState.overlayMenuActive, layoutState.staticMenuMobileActive]);

    const containerClass = classNames('layout-wrapper', {
        'layout-overlay': layoutConfig.menuMode === 'overlay',
        'layout-static': layoutConfig.menuMode === 'static',
        'layout-overlay-active': layoutState.overlayMenuActive,
        'layout-mobile-active': layoutState.staticMenuMobileActive
    });

    return (
        <div className={containerClass}>
            <AppHeaderWrapper />
            <div className="flex flex-col min-h-screen">
                <div>{children}</div>
            </div>
            <AppFooter />
            <div className="layout-mask"></div>
        </div>
    );
};

export default DefaultLayout;
