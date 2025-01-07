'use client';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { LayoutContext } from '@/src/layout/context/layoutcontext';
import { classNames } from 'primereact/utils';
import { login } from '../../service/auth';
import { setCookie } from 'cookies-next';
import useUserStore from '@/src/app/[locale]/(auth)/stores/useStore';
import { useRouter } from '@/src/i18n/routing';
import { Toast } from 'primereact/toast';
import { useTranslations } from 'next-intl';
import Spinner from '@/src/components/spinner/spinner';
import { PrimeReactProvider } from 'primereact/api';
import PasswordField from '../../components/PasswordField';
import TextField from '../../components/TextField';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { layoutConfig } = useContext(LayoutContext);
    const setUserStore = useUserStore((state: any) => state.setUserStore);
    const t = useTranslations('login');
    const router = useRouter();
    const toast = useRef<Toast>(null);
    const containerClassName = classNames('surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden');
    const [isLoading, setIsLoading] = useState(false);

    const showMess = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({
            severity,
            summary,
            detail,
            life: 3000
        });
    };
    const handleLogin = async (provider: string) => {
        setIsLoading(true);
        try {
            if (provider === 'google') {
                window.location.href = 'https://team03-api.cyvietnam.id.vn/oauth2/authorization/google';
            }
        } catch (error) {
            console.error('Login error:', error);
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();

        if (!email || !password) {
            showMess('warn', t('missingInfo'), t('enterEmailPassword'));
            return;
        }
        try {
            setIsLoading(true);
            const response = await login(email, password);

            if (response.data.data.token) {
                setIsLoading(false);
                await setCookie('token', response.data.data.token, {
                    maxAge: 60 * 60 * 24 * 7
                });
                await setCookie('userId', response.data.data.id, {
                    maxAge: 60 * 60 * 24 * 7
                });
                showMess('success', t('loginSuccess'), t('welcomeBack'));
                window.location.href = '/';
                setUserStore(response.data.data.id, response.data.data.name, response.data.data.username, response.data.data.email, response.data.data.roleName);
            } else {
                setIsLoading(false);
                showMess('error', t('loginFailed'), t('invalidCredentials'));
            }
        } catch (error: any) {
            setIsLoading(false);
            console.error('Login error:', error);
            showMess('error', t('loginFailed'), error.response?.data?.message || t('invalidCredentials'));
        }
    };

    return (
        <PrimeReactProvider value={{ unstyled: false }}>
            <div className={containerClassName}>
                <div className="flex  bg-white flex-column align-items-center justify-content-center">
                    <div className="shadow-2xl ">
                        <div className="w-full rounded-[2px] py-8 px-5 sm:px-8">
                            <div className="text-center mb-5">
                                <div className="text-900 text-3xl font-bold mb-3">{t('title')}</div>
                                <span className="text-600 font-medium">{t('welcome')}</span>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div>
                                    <label htmlFor="email1" className="block  text-900 text-xl font-medium mb-2">
                                        {t('email')}
                                    </label>
                                    <div className=" w-full md:w-30rem mb-5 flex justify-content-center">
                                        <TextField type="email" value={email} placeholder={t('email')} onChange={(e) => setEmail(e.target.value)} />
                                    </div>

                                    <label htmlFor="password1" className="block text-900 font-medium text-xl mb-2">
                                        {t('password')}
                                    </label>
                                    <div className=" relative flex justify-content-center">
                                        <PasswordField value={password} placeholder={t('password')} onChange={(e) => setPassword(e.target.value)} />
                                    </div>

                                    <div className="flex align-items-end justify-content-end mt-3 mb-5 gap-5">
                                        <p onClick={() => router.push({ pathname: '/forgot-password' })} className="font-medium  no-underline ml-2 text-right cursor-pointer">
                                            {t('forgotPassword')}
                                        </p>
                                    </div>
                                    <Button type="submit" label={t('submit')} className="w-full bg-black  hover:opacity-70 transition duration-200" disabled={isLoading} />
                                </div>
                            </form>
                            <div className="flex items-center my-4">
                                <div className="flex-grow border-t border-gray-300"></div>
                                <span className="px-4 text-gray-500">Or</span>
                                <div className="flex-grow border-t border-gray-300"></div>
                            </div>
                            <div className="mt-5 flex items-center justify-center gap-6">
                                <Button  onClick={() => handleLogin('google')} className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md shadow hover:shadow-lg hover:bg-gray-100 transition duration-200">
                                    <svg

                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 48 48"
                                        width="24px"
                                        height="24px"
                                    >
                                        <path
                                            fill="#FFC107"
                                            d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                                        />
                                        <path
                                            fill="#FF3D00"
                                            d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                                        />
                                        <path
                                            fill="#4CAF50"
                                            d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                                        />
                                        <path
                                            fill="#1976D2"
                                            d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                                        />
                                    </svg>
                                    <span className="text-sm font-medium text-gray-700">Đăng nhập bằng Google</span>
                                </Button>
                            </div>

                            <p className="w-full text-5 text-center mt-5">
                                {t('noAccount')}{' '}
                                <span className="text-lg cursor-pointer font-bold" onClick={() => router.push({ pathname: '/signup' })}>
                                    {t('registerNow')}
                                </span>
                            </p>
                            <Toast ref={toast} />
                            <Spinner isLoading={isLoading} />
                        </div>
                    </div>
                </div>
            </div>
        </PrimeReactProvider>
    );
};

export default LoginPage;
