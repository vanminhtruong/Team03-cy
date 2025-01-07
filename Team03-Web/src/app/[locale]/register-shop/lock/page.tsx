'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from '@/src/i18n/routing';
import { PrimeReactProvider } from 'primereact/api';
import { classNames } from 'primereact/utils';
import { Button } from 'primereact/button';
import { LockClosedIcon } from '@heroicons/react/24/solid';

const LockPage = () => {
    const t = useTranslations('admin-signup');
    const router = useRouter();
    const containerClassName = classNames('surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden');

    const handleSubmit = (e: any) => {
        e.preventDefault();
        window.location.href = '/';
    };

    return (
        <PrimeReactProvider value={{ unstyled: false }}>
            <div className={containerClassName}>
                <div className="flex mx-auto w-full max-w-[1280px] mt-8 py-2 px-6 ">
                    <div className="w-full surface-card pt-4 sm:px-4 shadow-2xl rounded-lg">
                        <div className="flex flex-column items-center w-full text-center p-8 gap-5">
                            <div className="bg-gray-100 rounded-full animate-pulse w-24 h-24">
                                <LockClosedIcon className="text-gray-600 w-18 h-18" strokeWidth={1.5} />
                            </div>

                            <div className="space-y-3">
                                <h3 className="text-2xl font-bold tracking-tight">{t('shop_locked.title')}</h3>
                                <span className="text-lg leading-relaxed">{t('shop_locked.message')}</span>
                                <br />
                            </div>

                            <div className="w-full">
                                <Button onClick={handleSubmit} label={t('shop_locked.button')} className="bg-primary-text text-white" />
                            </div>

                            <div className="text-sm text-gray-600 mt-4">
                                {t('shop_locked.appealText')}
                                <span onClick={() => (window.location.href = 'mailto:support@example.com')} className="text-blue-600 underline hover:text-blue-800 cursor-pointer">
                                    {t('shop_locked.appealLinkText')}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PrimeReactProvider>
    );
};

export default LockPage;
