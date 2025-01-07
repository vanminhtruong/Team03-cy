'use client';
import { useEffect } from 'react';
import { useRouter } from '@/src/i18n/routing';
import Cookies from 'js-cookie';
import useUserStore from '@/src/app/[locale]/(auth)/stores/useStore';
import { setCookie } from 'cookies-next';

const Success = () => {
    const router = useRouter();
    const setUserStore = useUserStore((state: any) => state.setUserStore);
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const userId = urlParams.get('userId');
        const userName = decodeURIComponent(urlParams.get('userName') || '');
        const email = decodeURIComponent(urlParams.get('email') || '');
        const role = urlParams.get('role');
        const userState = {
            id: userId ? parseInt(userId) : 0,
            name: userName || '',
            userName: userName || '',
            email: email || '',
            roleName: role || '',
            version: 0
        };
        setCookie('token', token, {
            maxAge: 60 * 60 * 24 * 7
        });
        setCookie('userId', userId, {
            maxAge: 60 * 60 * 24 * 7
        });
        setUserStore(userState.id, userState.name, userState.userName, userState.email, userState.roleName);
        window.location.href=('https://team03.cyvietnam.id.vn/');
    }, [router, setUserStore]);

    return null
};

export default Success;
