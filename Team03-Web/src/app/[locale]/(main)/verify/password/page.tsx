'use client';
import React, { useRef, useEffect } from 'react';
import { PUT } from '@/src/config/ApiService';
import { Toast } from 'primereact/toast';
import { EyeIcon } from 'primereact/icons/eye';
import { EyeSlashIcon } from 'primereact/icons/eyeslash';
import Spinner from '@/src/components/spinner/spinner';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/src/i18n/routing';
import { setCookie } from 'cookies-next';
import usePasswordStore from '@/src/app/[locale]/(main)/stores/useChangePassword';
import ButtonCustom from '@/src/components/ButtonCustom';
import InputField from '@/src/components/InputCustom';

export default function VerifyPassword() {
    const {
        showOldPassword,
        showNewPassword,
        showConfirmPassword,
        oldPassword,
        newPassword,
        confirmPassword,
        message,
        loading,
        failedAttempts,
        lockTime,
        remainingTime,
        toggleShowOldPassword,
        toggleShowNewPassword,
        toggleShowConfirmPassword,
        setOldPassword,
        setNewPassword,
        setConfirmPassword,
        setMessage,
        setLoading,
        setFailedAttempts,
        setLockTime,
        setRemainingTime
    } = usePasswordStore();

    const toast = useRef<Toast>(null);
    const t = useTranslations('passwordChange');
    const router = useRouter();

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'old' | 'new' | 'confirm') => {
        const value = e.target.value;
        if (type === 'old') setOldPassword(value);
        if (type === 'new') setNewPassword(value);
        if (type === 'confirm') setConfirmPassword(value);
        setMessage('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (lockTime && Date.now() < lockTime) {
            const remainingTime = Math.ceil((lockTime - Date.now()) / 1000);
            setMessage(t('accountLocked'));
            return;
        }

        if (newPassword !== confirmPassword) {
            setMessage(t('passwordMismatch'));
            return;
        }

        const apiUrl = '/v1/api/user/change-password';
        const formData = new FormData();
        formData.append('oldPassword', oldPassword);
        formData.append('newPassword', newPassword);

        try {
            setLoading(true);
            const response = await PUT(apiUrl, formData);
            setFailedAttempts(0);
            setLockTime(null);
            toast.current?.show({
                severity: 'info',
                summary: t('success'),
                detail: t('passwordUpdated')
            });
            setCookie('token', '', { maxAge: -1, path: '/' });
            router.push('/login');
        } catch (error: any) {
            setFailedAttempts((prev) => prev + 1);
            if (failedAttempts + 1 >= 3) {
                const lockDuration = 3 * 60 * 1000;
                setLockTime(Date.now() + lockDuration);
                setRemainingTime(lockDuration / 1000);
                setMessage(t('failedAttempts'));
            } else {
                setMessage(error.response?.data?.message || t('failedUpdate'));
            }
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: error.response?.data?.message || t('failedUpdate')
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if (lockTime) {
            interval = setInterval(() => {
                const timeLeft = Math.ceil((lockTime - Date.now()) / 1000);
                if (timeLeft <= 0) {
                    setLockTime(null);
                    setRemainingTime(0);
                    setMessage('');
                } else {
                    setRemainingTime(timeLeft);
                }
            }, 1000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [lockTime, setLockTime, setRemainingTime]);

    return (
        <div className="flex items-center justify-center min-h-[500px] bg-gray-100 px-4">
            <Toast ref={toast} />
            <Spinner isLoading={loading} />
            <div className="bg-white p-6 rounded-md shadow-xl w-full sm:w-[500px] md:w-[600px] lg:w-[700px]">
                <div className="flex gap-4 items-center mb-6">
                    <ButtonCustom onClick={router.back}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                    </ButtonCustom>
                    <h3 className="text-xl font-semibold">{t('enterPassword')}</h3>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="relative mb-6">
                        <InputField label={t('oldPassword')} value={oldPassword} placeholder="•••" type={showOldPassword ? 'text' : 'password'} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePasswordChange(e, 'old')} />
                        <button type="button" className="absolute right-3 top-3 text-gray-500 hover:text-gray-700" onClick={toggleShowOldPassword}>
                            {showOldPassword ? <EyeIcon /> : <EyeSlashIcon />}
                        </button>
                    </div>
                    <div className="relative mb-6">
                        <InputField label={t('newPassword')} value={newPassword} placeholder="•••" type={showNewPassword ? 'text' : 'password'} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePasswordChange(e, 'new')} />
                        <button type="button" className="absolute right-3 top-3 text-gray-500 hover:text-gray-700" onClick={toggleShowNewPassword}>
                            {showNewPassword ? <EyeIcon /> : <EyeSlashIcon />}
                        </button>
                    </div>
                    <div className="relative mb-6">
                        <InputField label={t('confirmPassword')} value={confirmPassword} placeholder="•••" type={showConfirmPassword ? 'text' : 'password'} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePasswordChange(e, 'confirm')} />
                        <button type="button" className="absolute right-3 top-3 text-gray-500 hover:text-gray-700" onClick={toggleShowConfirmPassword}>
                            {showConfirmPassword ? <EyeIcon /> : <EyeSlashIcon />}
                        </button>
                    </div>
                    <div className="flex justify-center my-4">
                        <ButtonCustom type="submit" disabled={Boolean(lockTime && Date.now() < lockTime)} className="w-full sm:w-auto">
                            {t('confirm')}
                        </ButtonCustom>
                    </div>
                </form>
                {message && <p className="mt-4 text-center text-sm text-red-500">{message}</p>}
            </div>
        </div>
    );
}
