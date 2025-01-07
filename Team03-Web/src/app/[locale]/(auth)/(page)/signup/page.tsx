'use client';
import React, { useContext, useState, useRef, useEffect, useCallback } from 'react';
import { Button } from 'primereact/button';
import { LayoutContext } from '@/src/layout/context/layoutcontext';
import { classNames } from 'primereact/utils';
import { signup } from '../../service/auth';
import { useRouter } from '@/src/i18n/routing';
import { Toast } from 'primereact/toast';
import { useTranslations } from 'next-intl';
import { Steps } from 'primereact/steps';
import { usePathname } from '@/src/i18n/routing';
import Spinner from '@/src/components/spinner/spinner';
import Cookies from 'js-cookie';
import PasswordField from '../../components/PasswordField';
import TextField from '../../components/TextField';

const SignupPage = ({ children }: any) => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const { layoutConfig } = useContext(LayoutContext);
    const router = useRouter();
    const t = useTranslations('signup');
    const toast = useRef<Toast>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const pathname = usePathname();
    const [isLoading, setIsLoading] = useState(false);
    const storedEmail = localStorage.getItem('signup-email');

    const resetInputs = () => {
        setFullName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
    };

    const checkActiveIndex = useCallback(() => {
        const paths = pathname.split('/');
        const currentPath = paths[paths.length - 1];

        switch (currentPath) {
            case 'otp':
                setActiveIndex(1);
                break;
            case 'success':
                setActiveIndex(2);
                break;
            default:
                break;
        }
    }, [pathname]);

    useEffect(() => {
        checkActiveIndex();
    }, [checkActiveIndex]);

    const wizardItems = [
        { label: t('title'), command: () => router.push('/signup') },
        { label: t('otp'), command: () => router.push('/signup/otp') },
        { label: t('success'), command: () => router.push('/signup/success') }
    ];

    const showMess = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({
            severity,
            summary,
            detail,
            life: 3000
        });
    };

    const containerClassName = classNames('surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden', { 'p-input-filled': layoutConfig.inputStyle === 'filled' });

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        if (!email || !password || !fullName || !confirmPassword) {
            showMess('warn', t('error'), t('missingInfo'));
            return;
        }
        if (password !== confirmPassword) {
            showMess('warn', t('error'), t('passwordMismatch'));
            return;
        }
        try {
            setIsLoading(true);
            const resp = await signup(fullName, password, email);

            if (resp.data.status === 200) {
                Cookies.set('registration-step', '1', { expires: 60 * 60 * 24 * 7 });
                router.push('/signup/otp');
                setIsLoading(false);
                localStorage.setItem('signup-email', email);
            }
        } catch (error: any) {
            setIsLoading(false);
            showMess('error', t('error'), error.response?.data?.message || t('error'));
        }
    };

    return (
        <div className={containerClassName}>
            <Toast ref={toast} />
            <Spinner isLoading={isLoading} />
            <div className="flex flex-column align-items-center bg-white justify-content-center">
                <div className="shadow-2xl ">
                    <div className="w-full rounded-[2px] py-6 px-5 sm:px-8">
                        <div className="text-center mb-5">
                            <div className="text-900 text-3xl font-bold mb-3">{t('title')}</div>
                            <Steps className="mt-4" model={wizardItems} activeIndex={activeIndex} onSelect={(e) => setActiveIndex(e.index)} readOnly={true} />
                        </div>

                        {pathname === '/signup' ? (
                            <div>
                                {!storedEmail ? (
                                    <div>
                                        <form className=" w-full md:w-30rem" onSubmit={handleSubmit}>
                                            <div className="  field mb-4">
                                                <label htmlFor="fullName" className="block text-900 text-xl font-medium mb-2">
                                                    {t('fullname')}
                                                </label>
                                                <TextField type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder={t('fullname')} />
                                            </div>

                                            <div className="field mb-4">
                                                <label htmlFor="email" className="block text-900 text-xl font-medium mb-2">
                                                    {t('email')}
                                                </label>
                                                <TextField type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('email')} />
                                            </div>
                                            <div className="field mb-4">
                                                <label htmlFor="password" className="block text-900 text-xl font-medium mb-2">
                                                    {t('password')}
                                                </label>
                                                <PasswordField value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t('password')} />
                                            </div>
                                            <div className="field mb-4 ">
                                                <label htmlFor="confirmPassword" className="block text-900 text-xl font-medium mb-2">
                                                    {t('confirmPassword')}
                                                </label>
                                                <PasswordField value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder={t('confirmPassword')} />
                                            </div>
                                            <Button type="submit" label={t('submit')} className=" bg-black w-full mt-3  hover:opacity-70 transition duration-200" disabled={isLoading} />
                                        </form>
                                        <p className="w-full text-5 text-center mt-5">
                                            {t('loginPrompt')}{' '}
                                            <span className="text-lg cursor-pointer font-bold" onClick={() => router.push('/login')}>
                                                {t('login')}
                                            </span>
                                        </p>
                                    </div>
                                ) : (
                                    <div className="w-full flex flex-col justify-center items-center text-center mb-5">
                                        <h1 className="text-2xl font-semibold text-gray-800">Welcome Back!</h1>
                                        <p className="mt-2 text-gray-600">You are in the process of registering. Do you want to continue or start over?</p>
                                        <div className="mt-6 flex flex-col space-y-4 w-2/3">
                                            <Button label={t('continue')} onClick={() => router.push('/signup/otp')} className="w-full bg-black text-white hover:opacity-70 transition duration-200" />
                                            <Button
                                                label={t('title')}
                                                onClick={() => {
                                                    Cookies.remove('token');
                                                    Cookies.remove('shop_status');
                                                    localStorage.removeItem('user');
                                                    Cookies.remove('registration-step');
                                                    localStorage.removeItem('signup-email');
                                                    resetInputs();
                                                    router.push('/signup/otp');
                                                }}
                                                className="bg-gray-500 w-full"
                                            />
                                        </div>
                                        <p className="w-full text-5 text-center mt-5">
                                            {t('loginPrompt')}{' '}
                                            <span className="text-lg cursor-pointer font-bold" onClick={() => router.push('/login')}>
                                                {t('login')}
                                            </span>
                                        </p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            children
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignupPage;
