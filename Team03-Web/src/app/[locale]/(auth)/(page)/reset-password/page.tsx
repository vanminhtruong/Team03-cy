'use client';
import React, { useContext, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { LayoutContext } from '@/src/layout/context/layoutcontext';
import { classNames } from 'primereact/utils';
import { useRouter } from '@/src/i18n/routing';
import { Toast } from 'primereact/toast';
import { useTranslations } from 'next-intl';
import { resetPassword } from '@/src/app/[locale]/(auth)/service/auth';
import PasswordField from '@/src/app/[locale]/(auth)/components/PasswordField';

const ResetPasswordPage = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const { layoutConfig } = useContext(LayoutContext);
    const router = useRouter();
    const toast = useRef<Toast>(null);
    const t = useTranslations('resetPassword');
    const containerClassName = classNames('surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden', { 'p-input-filled': layoutConfig.inputStyle === 'filled' });

    const showMess = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({
            severity,
            summary,
            detail,
            life: 3000
        });
    };

    const handleSubmit = async (e:any) => {
        e.preventDefault();

        if (!password) {
            showMess('warn', t('missingInfo'), t('enterPassword'));
            return;
        }

        if (!confirmPassword) {
            showMess('warn', t('missingInfo'), t('confirmPassword'));
            return;
        }

        if (password !== confirmPassword) {
            showMess('warn', t('passwordMismatch'), t('passwordsMustMatch'));
            return;
        }

        try {
            const token = new URLSearchParams(window.location.search).get('token');

            if (token !== null) {
                const resp = await resetPassword(password, token);
                if (resp.data.status === 200) {
                    showMess('success', t('passwordResetSuccess'), t('loginNow'));

                    setTimeout(() => {
                        router.push('/login');
                    }, 700);
                }
            }
        } catch (error:any) {
            console.error('Error:', error);
            showMess('error', t('resetFailed'), error.response?.data?.message || t('tryAgainLater'));
        }
    };

    return (
        <div className={containerClassName}>
            <div className="flex  bg-white flex-column align-items-center justify-content-center">
                <div className="shadow-2xl ">
                    <div className="w-full rounded-[2px] py-8 px-5 sm:px-8">
                        <div className="text-center mb-5">
                            <div className="text-900 text-3xl font-bold mb-3">{t('title')}</div>
                            <span className="text-600 font-medium">{t('subtitle')}</span>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="w-full flex-column flex">
                                <label htmlFor="newPassword" className="block  text-900 text-xl font-medium mb-2">
                                    {t('newPassword')}
                                </label>

                                <div className=" flex mb-4 justify-content-center">
                                    <PasswordField
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder={t('newPassword')}

                                    />
                                </div>
                                <label htmlFor="confirmPassword"
                                       className="block text-900 text-xl font-medium mb-2">
                                    {t('confirmPassword')}
                                </label>
                                <div className=" flex mb-4 justify-content-center">
                                    <PasswordField
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder={t('confirmPassword')}
                                    />
                                </div>
                                <Button type="submit" label={t('sumbit')} className="w-full mt-4 bg-black  hover:opacity-70 transition duration-200"  />

                            </div>
                        </form>

                        <Toast ref={toast} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
