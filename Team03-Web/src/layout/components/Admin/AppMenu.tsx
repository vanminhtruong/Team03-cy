import React, { useContext } from 'react';
import AppMenuitem from './AppMenuitem';
import { LayoutContext } from '../../context/layoutcontext';
import { MenuProvider } from '../../context/menucontext';
import { AppMenuItem } from '@/src/types';
import { useLocale, useTranslations } from 'next-intl';

const AppMenu = () => {
    const locale = useLocale();
    const t = useTranslations('AdminMenu');

    const model: AppMenuItem[] = [
        {
            label: t('Home'),
            items: [{ label: t('Dashboard'), icon: 'pi pi-fw pi-chart-line', to: `/${locale}/admin` }]
        },
        {
            label: t('Product'),
            icon: 'pi pi-fw pi-box',
            to: `/${locale}/product`,
            items: [
                {
                    label: t('AddNewProduct'),
                    icon: 'pi pi-fw pi-plus-circle',
                    to: `/${locale}/admin/product/create`
                },
                {
                    label: t('AllProducts'),
                    icon: 'pi pi-fw pi-list',
                    to: `/${locale}/admin/products`
                }
            ]
        },
        {
            label: t('marketingChannel'),
            icon: 'pi pi-fw pi-megaphone',
            to: `/${locale}/admin/marketing-channel`,
            items: [
                {
                    label: t('promotion'),
                    icon: 'pi pi-fw pi-percentage',
                    to: `/${locale}/admin/marketing-channel`
                },
                {
                    label: t('banner'),
                    icon: 'pi pi-fw pi-image',
                    to: `/${locale}/admin/banner`
                }
            ]
        },
        {
            label: t('Orders'),
            icon: 'pi pi-fw pi-shopping-bag',
            to: `/${locale}/admin/orders`,
            items: [
                {
                    label: t('OrderHistory'),
                    icon: 'pi pi-fw pi-history',
                    to: `/${locale}/admin/orders`
                }
            ]
        }
    ];

    return (
        <MenuProvider>
            <ul className="layout-menu">
                {model.map((item, i) => {
                    return !item?.seperator ? <AppMenuitem item={item} root={true} index={i} key={item.label} /> : <li className="menu-separator"></li>;
                })}
            </ul>
        </MenuProvider>
    );
};

export default AppMenu;
