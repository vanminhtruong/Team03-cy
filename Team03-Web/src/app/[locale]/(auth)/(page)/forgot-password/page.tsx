'use client';
import React, { useContext, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { LayoutContext } from '@/src/layout/context/layoutcontext';
import { classNames } from 'primereact/utils';
import { useRouter } from '@/src/i18n/routing';
import { Toast } from 'primereact/toast';
import { useTranslations } from 'next-intl';
import { forgotPassword } from '@/src/app/[locale]/(auth)/service/auth';
import Spinner from '@/src/components/spinner/spinner';
import TextField from '../../components/TextField'

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const { layoutConfig } = useContext(LayoutContext);
    const t = useTranslations('forgotPassword');
    const router = useRouter();
    const toast = useRef<Toast>(null);
    const containerClassName = classNames('surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden', { 'p-input-filled': layoutConfig.inputStyle === 'filled' });
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);

    const showMess = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({
            severity,
            summary,
            detail,
            life: 3000
        });
    };

    const validateEmail = (email:string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSubmit = async (e:any) => {
        e.preventDefault();

        if (!email) {
            showMess('warn', t('missingInfo'), t('enterEmail'));
            return;
        }

        if (!validateEmail(email)) {
            showMess('warn', t('invalidEmail'), t('checkEmailFormat'));
            return;
        }

        try {
            setIsLoading(true);
            const resp = await forgotPassword(email)
            if (resp.data.status === 200) {
                setIsLoading(false);
                setShowSuccessDialog(true);
            }

        } catch (error:any) {
            setIsLoading(false);
            console.error('Error:', error);
            showMess('error', t('submitFailed'), error.response?.data?.message || t('tryAgainLater'));
        }
    };

    const handleOpenGmail = () => {
        window.open('https://mail.google.com', '_blank', 'noopener,noreferrer');
    };

    const dialogFooter = (
        <div className="flex flex-column gap-3">
            <Button
                label={t('openGmail')}
                onClick={handleOpenGmail}
                className="w-full bg-red-600 text-white hover:bg-red-700"
                icon="pi pi-envelope"
            />
            <Button
                label={t('backToLogin')}
                onClick={() => router.push('/login')}
                className="w-full bg-black text-white hover:bg-gray-900"
            />
        </div>
    );

    return (
        <div className={containerClassName}>
            <div className="flex  bg-white flex-column align-items-center justify-content-center">
                <div className="shadow-2xl ">
                    <div className="w-full rounded-[2px] py-8 px-5 sm:px-8">
                        <div className="text-center mb-5">
                            <div className="text-900 text-3xl font-bold mb-3">{t('title')}</div>
                            <span className="text-600 font-medium">{t('welcome')}</span>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className='w-full flex md:w-30rem mb-5 flex-column '>
                                <label htmlFor="email1" className="block text-900 text-xl font-medium mb-2">
                                    {t('email')}
                                </label>
                                <TextField
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    type="text"
                                    placeholder={t('email')}
                                />
                                <Button type="submit" label={t('submit')} className="w-full mt-5 bg-black  hover:opacity-70 transition duration-200" disabled={isLoading} />

                            </div>
                        </form>

                        <p className="w-full text-5 text-center mt-5">
                            <span className="text-lg cursor-pointer font-bold" onClick={() => router.push('/login')}
                            >
                                {t('backToLogin')}
                            </span>
                        </p>
                        <Toast ref={toast} />
                        <Spinner isLoading={isLoading} />
                    </div>
                </div>
            </div>

            <Dialog
                visible={showSuccessDialog}
                onHide={() => setShowSuccessDialog(false)}
                header={t('emailSent')}
                footer={dialogFooter}
                style={{ width: '450px' }}
                breakpoints={{ '960px': '75vw', '641px': '90vw' }}
            >
                <div className="confirmation-content">
                    <p>{t('checkInbox')}</p>
                </div>
            </Dialog>
        </div>
    );
};

export default LoginPage;
