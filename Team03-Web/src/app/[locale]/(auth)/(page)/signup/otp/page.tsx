'use client';

import React, { useEffect, useRef, useState } from 'react';
import Signup from '../page';
import { Toast } from 'primereact/toast';
import { useTranslations } from 'next-intl';
import { newOtp, verifyEmail } from '@/src/app/[locale]/(auth)/service/auth';
import Spinner from '@/src/components/spinner/spinner';
import { useRouter } from '@/src/i18n/routing';
import { setCookie } from 'cookies-next';
import { Button } from 'primereact/button';

function SignupOTP() {
    const [otp, setOtp] = useState<string[]>(Array(8).fill(''));
    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
    const toast = useRef<Toast>(null);
    const timer = useRef<NodeJS.Timeout | null>(null);

    const t = useTranslations('signup');
    const [email, setEmail] = useState<string>('');
    const [timeLeft, setTimeLeft] = useState<number>(180);
    const [isButtonDisabled, setIsButtonDisabled] = useState<boolean>(true);
    const router = useRouter();
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        const storedEmail = localStorage.getItem('signup-email');
        if (storedEmail) {
            setEmail(storedEmail);
        } else {
            setCookie('registration-step', '', {
                maxAge: -1,
                path: '/'
            });
        }

        startCountdown();

        return () => {
            if (timer.current) {
                clearInterval(timer.current);
            }
        };
    }, []);

    const startCountdown = () => {
        if (timer.current) {
            clearInterval(timer.current);
        }

        timer.current = setInterval(() => {
            setTimeLeft((prevTime) => {
                if (prevTime <= 0) {
                    if (timer.current) {
                        clearInterval(timer.current);
                    }
                    setIsButtonDisabled(false);
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);
    };

    const showMess = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({
            severity,
            summary,
            detail,
            life: 3000
        });
    };

    const handleOtpChange = (value: string, index: number) => {
        const updatedOtp = [...otp];
        updatedOtp[index] = value;
        setOtp(updatedOtp);
        if (value && index < otp.length - 1) {
            otpRefs.current[index + 1]?.focus();
        }
    };

    const handleCheckOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!otp || otp.every((digit) => digit === '')) {
            showMess('error', t('error'), t('otpInvalid'));
            return;
        }

        try {
            setIsLoading(true);
            const enteredOtp = otp.join('');
            setOtp(Array(8).fill(''));

            const response = await verifyEmail(enteredOtp, email);
            if (response.data.status === 200) {
                setIsLoading(false);
                showMess('success', t('success'), t('emailVerificationSuccess'));
                localStorage.removeItem('signup-email');
                setCookie('registration-step', 2, {
                    maxAge: 60 * 60 * 24 * 7
                });
                router.push('/signup/success');
            } else {
                setIsLoading(false);
                showMess('error', t('error'), t('otpInvalid'));
                setCookie('registration-step', '', {
                    maxAge: -1,
                    path: '/'
                });
            }
        } catch (error) {
            setIsLoading(false);
            showMess('error', t('error'), t('emailVerificationFailed'));
            setCookie('registration-step', '', {
                maxAge: -1,
                path: '/'
            });
        }
    };

    const handleOtpKeyDown = (e: React.KeyboardEvent, index: number) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    const formatTime = (timeInSeconds: number) => {
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = timeInSeconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };
    const handleOtpPaste = (e:any) => {
        const pastedData = e.clipboardData.getData('text');
            const updatedOtp = pastedData.split('');
            setOtp(updatedOtp);
            otpRefs.current[otp.length - 1]?.focus();
    };

    const handleRequestNewOtp = async () => {
        try {
            const response = await newOtp(email);
            setIsLoading(true);
                setIsLoading(false);
                showMess('success', t('success'), t('emailVerificationSuccess'));
                setTimeLeft(180);
                setIsButtonDisabled(true);
                startCountdown();

        } catch (error) {
            setIsLoading(false);
            console.error(error);
            showMess('error', t('error'), t('otpRequestFailed'));
        }
    };

    return (
        <Signup>
            <div className="flex w-full md:w-30rem  flex-column align-items-center">
                <Toast ref={toast} />
                <Spinner isLoading={isLoading} />
                <div className="text-900 text-2xl font-bold mb-4">{t('otpPrompt')}</div>
                <p className="text-center text-gray-500 mb-6">
                    {t('otptitle')}{' '}
                    <span className="text-xl cursor-pointer font-bold ">
                        {email}
                    </span>
                </p>
                <div className="text-center mb-4 text-[13px] font-semibold">
                    {isButtonDisabled ? (
                        <span className="text-gray-500">Gửi lại mã OTP sau: {formatTime(timeLeft)}</span>
                    ) : (
                        <button className="text-blue-500 hover:text-blue-700" onClick={handleRequestNewOtp}>
                            Gửi lại mã OTP
                        </button>
                    )}
                </div>
                <form onSubmit={handleCheckOtp}>
                    <div className="flex justify-center space-x-2 mb-6">
                        {otp.map((digit: string, index: number) => (
                            <input
                                key={index}
                                type="text"
                                maxLength={1}
                                value={digit}
                                ref={(el) => (otpRefs.current[index] = el)}
                                onChange={(e) => handleOtpChange(e.target.value, index)}
                                onKeyDown={(e) => handleOtpKeyDown(e, index)}
                                onPaste={handleOtpPaste}
                                className="w-11 h-14 text-center text-xl sm:text-2xl border-2 border-black rounded-lg focus:outline-none focus:border-gray-300 transition-all duration-300"
                            />
                        ))}
                    </div>
                    <Button type="submit" label={t('submit')} className="w-full bg-black  hover:opacity-70 transition duration-200" disabled={isLoading} />
                </form>
                <p
                    className="text-[14px] mt-5  cursor-pointer font-bold"
                    onClick={() => {
                        router.push('/signup');
                    }}
                >
                    {t('changeEmail')}
                </p>
            </div>
        </Signup>
    );
}

export default SignupOTP;
