import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { GET } from '@/src/config/ApiService';

const PATHS = {
    SIGNUP: ['signup', 'signup/otp', 'signup/success'],
    SHOP_REGISTRATION: ['register-shop', 'register-shop/success', 'register-shop/refuse', 'register-shop/lock'],
    PROTECTED: ['admin', 'checkout', 'cart'],
    ADMIN_ROUTES: ['admin/dashboard', 'admin/products', 'admin/orders', 'admin/product/create', 'admin/product/update']
};

const ShopStatus = {
    NOT_REGISTERED: 0,
    ACTIVE: 1,
    APPROVED: 2,
    REFUSED: 3,
    LOCKED: 4
};

export default async function middleware(request: any) {
    const [, locale, ...segments] = request.nextUrl.pathname.split('/');
    const currentPath = segments.join('/');
    const redirectTo = (path: any) => NextResponse.redirect(new URL(`/${locale}/${path}`, request.url));
    const handleI18nRouting = createMiddleware({
        locales: ['en', 'vi', 'ko'],
        defaultLocale: 'en'
    });
    let shopStatus = null;
    const clearCookiesAndRedirect = (path: any) => {
        const response = NextResponse.redirect(new URL(`/${locale}/${path}`, request.url));
        response.cookies.set('token', '', { maxAge: -1 });
        response.cookies.set('userId', '', { maxAge: -1 });
        response.cookies.set('registration-step', '', { maxAge: -1 });
        return response;
    };
    const cookies = {
        token: request.cookies.get('token')?.value,
        userId: request.cookies.get('userId')?.value,
        registrationStep: request.cookies.get('registration-step')?.value
    };

    const isAuthenticated = cookies.token && cookies.token !== 'undefined';

    if (segments[0] === 'login') {
        return isAuthenticated ? redirectTo('') : handleI18nRouting(request);
    }

    if (PATHS.PROTECTED.includes(segments[0]) || PATHS.SHOP_REGISTRATION.includes(segments[0])) {
        if (!isAuthenticated) {
            return redirectTo('login');
        }
    }

    if (currentPath === 'purchase' || currentPath === 'checkout') {
        if (!isAuthenticated) {
            return redirectTo('login');
        }
    }

    if (segments[0] === 'admin' || PATHS.ADMIN_ROUTES.some((route) => currentPath.startsWith(route))) {
        if (isAuthenticated && cookies.userId) {
            try {
                const response = await GET(`/v1/api/user/${cookies.userId}`);
                shopStatus = response.data.data.shop_status;
            } catch (error) {
                return clearCookiesAndRedirect('login');
            }
        }
        if (!isAuthenticated) return redirectTo('login');

        switch (shopStatus) {
            case ShopStatus.NOT_REGISTERED:
                return currentPath !== 'register-shop' ? redirectTo('register-shop') : handleI18nRouting(request);
            case ShopStatus.REFUSED:
                return currentPath !== 'register-shop/refuse' ? redirectTo('register-shop/refuse') : handleI18nRouting(request);
            case ShopStatus.LOCKED:
                return currentPath !== 'register-shop/lock' ? redirectTo('register-shop/lock') : handleI18nRouting(request);
            case ShopStatus.APPROVED:
                return currentPath !== 'register-shop/success' ? redirectTo('register-shop/success') : handleI18nRouting(request);
            case ShopStatus.ACTIVE:
                return handleI18nRouting(request);
            default:
                return clearCookiesAndRedirect('login');
        }
    }

    if (PATHS.SHOP_REGISTRATION.includes(currentPath) && isAuthenticated) {
        if (isAuthenticated && cookies.userId) {
            try {
                const response = await GET(`/v1/api/user/${cookies.userId}`);
                shopStatus = response.data.data.shop_status;
            } catch (error) {
                return clearCookiesAndRedirect('login');
            }
        }
        if (!isAuthenticated) return redirectTo('login');
        switch (shopStatus) {
            case ShopStatus.ACTIVE:
                return redirectTo('admin');
            case ShopStatus.APPROVED:
                return currentPath !== 'register-shop/success' ? redirectTo('register-shop/success') : handleI18nRouting(request);
            case ShopStatus.REFUSED:
                return currentPath !== 'register-shop/refuse' ? redirectTo('register-shop/refuse') : handleI18nRouting(request);
            case ShopStatus.LOCKED:
                return currentPath !== 'register-shop/lock' ? redirectTo('register-shop/lock') : handleI18nRouting(request);
            case ShopStatus.NOT_REGISTERED:
                return !['register-shop', 'register-shop/identity'].includes(currentPath) ? redirectTo('register-shop') : handleI18nRouting(request);
            default:
                return handleI18nRouting(request);
        }
    }

    if (PATHS.SIGNUP.includes(currentPath)) {
        if (!cookies.registrationStep) {
            return currentPath !== 'signup' ? redirectTo('signup') : handleI18nRouting(request);
        }

        const step = parseInt(cookies.registrationStep || '0', 10);
        switch (step) {
            case 1:
                return !['signup', 'signup/otp'].includes(currentPath) ? redirectTo('signup/otp') : handleI18nRouting(request);
            case 2:
                return currentPath !== 'signup/success' ? redirectTo('signup/success') : handleI18nRouting(request);
            default:
                return redirectTo('signup');
        }
    }

    return handleI18nRouting(request);
}

export const config = {
    matcher: ['/', '/(en|vi|ko)/:path*']
};
