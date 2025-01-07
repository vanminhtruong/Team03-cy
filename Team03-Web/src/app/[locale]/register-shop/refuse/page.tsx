'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from '@/src/i18n/routing';
import { PrimeReactProvider } from 'primereact/api';
import { classNames } from 'primereact/utils';
import { Button } from 'primereact/button';
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';

const RefusePage = () => {
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
                            <div className="bg-red-100 rounded-full animate-pulse w-24 h-24">
                                <ExclamationTriangleIcon className="text-red-600 w-18 h-18" strokeWidth={1.5} />
                            </div>

                            <div className="space-y-3">
                                <h3 className="text-2xl font-bold tracking-tight">{t('signup_refused.title')}</h3>
                                <span className="text-lg leading-relaxed">{t('signup_refused.message')}</span>
                                <br />
                            </div>

                            <div className="w-full">
                                <Button onClick={handleSubmit} label={t('signup_refused.button')} className="bg-primary-text text-white" />
                            </div>

                            <div className="text-sm text-gray-600 mt-4">
                                {t('signup_refused.appealText')}
                                <span onClick={() => (window.location.href = 'mailto:support@example.com')} className="text-blue-600 underline hover:text-blue-800 cursor-pointer">
                                    {t('signup_refused.appealLinkText')}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PrimeReactProvider>
    );
};

export default RefusePage;
