'use client';

import React from 'react';
import Signup from '../page';
import { CheckCircleIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { setCookie } from 'cookies-next';
import { useRouter } from '@/src/i18n/routing';
import { Button } from 'primereact/button';

function SignupSuccess() {
    const t = useTranslations('signup.signup_success');
    const router = useRouter();

    const handleSubmit = ()=>{
        setCookie('registration-step', '', {
            maxAge: -1,
            path: '/'
        });
        router.push('/login');
    }

    return (
        <Signup>
            <div className="flex flex-column justify-center items-center w-full md:w-30rem text-center gap-3">
                <div className="bg-green-100 p-5 rounded-full animate-pulse">
                    <CheckCircleIcon className="text-green-600" size={72} strokeWidth={1.5} />
                </div>

                <div className="mt-3 space-y-3">
                    <h3 className="text-2xl font-bold  tracking-tight">{t('title')}</h3>
                    <p className="text-lg  leading-relaxed">{t('message')}</p>
                </div>

                <div className="mt-5 w-full">
                    <Button onClick={handleSubmit} label="Success" className="w-full bg-black  hover:opacity-70 transition duration-200"  />
                </div>
            </div>
        </Signup>
    );
}

export default SignupSuccess;
