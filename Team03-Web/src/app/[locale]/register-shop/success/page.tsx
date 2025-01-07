'use client';
import { useRouter } from '@/src/i18n/routing';
import React from 'react';
import { Button } from 'primereact/button';
import { useTranslations } from 'next-intl';
import { CheckCircleIcon } from 'lucide-react';
import SignupPage from '../page';
import { useSignupStore } from '../../admin/stores/signup';

const SuccessPage = () => {
    const t = useTranslations('admin-signup');
    const router = useRouter();

    const { setSignupStore } = useSignupStore();

    function clearInputs() {
        setSignupStore?.('', '', '', 0, '', '', '', '', null, null, '');
        localStorage.removeItem('signup');
    }

    function handleSubmit() {
        clearInputs();
        window.location.href = '/';  }

    return (
        <SignupPage>
            <div className="flex flex-column  items-center w-full text-center p-8 gap-5">
                <div className="bg-green-100  rounded-full animate-pulse">
                    <CheckCircleIcon className="text-green-600" size={72} strokeWidth={1.5} />
                </div>

                <div className="space-y-3">
                    <h3 className="text-2xl font-bold  tracking-tight">{t('signup_success.title')}</h3>
                    <span className="text-lg leading-relaxed">{t('signup_success.message')}</span>
                    <br />
                    <span className="text-lg leading-relaxed">{t('signup_success.pendingApproval')}</span>
                </div>

                <div className="w-full">
                    <Button onClick={handleSubmit} label={t('signup_success.button')} className="bg-primary-text text-white" />
                </div>
            </div>
        </SignupPage>
    );
};

export default SuccessPage;
