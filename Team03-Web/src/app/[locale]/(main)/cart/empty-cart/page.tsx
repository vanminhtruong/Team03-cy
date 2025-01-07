"use client";
import React from 'react';
import { useRouter } from '@/src/i18n/routing';
import { useTranslations } from 'next-intl';

const EmptyCartPage = () => {
    const router = useRouter();
    const t = useTranslations("cart.emptyCart");
    return (
        <div className="h-screen bg-white flex flex-col items-center py-12">
            <h1 className="text-4xl font-extrabold text-gray-800 mb-4">{t('title')}</h1>
            <div className="mb-8">
                <img src="https://th.bing.com/th?q=Empty+Cart+Icon.png&w=120&h=120&c=1&rs=1&qlt=90&cb=1&pid=InlineBlock&mkt=en-SG&cc=SG&setlang=en&adlt=strict&t=1&mw=247" alt={t('illustration')} className="w-full max-w-md" />
            </div>
            <p className="text-lg text-gray-500 mb-8 text-center max-w-lg">{t('message')}</p>

            <button className="bg-black text-white px-6 py-3 rounded-lg text-lg font-semibold shadow-md hover:bg-gray-900 transition duration-300" onClick={() => router.push('/')}>
                {t('button')}
            </button>
        </div>
    );
};

export default EmptyCartPage;
