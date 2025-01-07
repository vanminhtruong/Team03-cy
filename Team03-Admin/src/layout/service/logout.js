import { POST } from '@/service/ApiService';
import Cookies from 'js-cookie';

export const logout = () => {
    const token = Cookies.get('token');
    if (!token) {
        console.log('ppp');
        return Promise.reject('Token is missing.');
    }

    const url = `/v1/api/authentication/logout?token=${token}`;

    return POST(url)
        .then((response) => {
            Cookies.remove('token');
            Cookies.remove('roleName');
            return response;
        })
        .catch((error) => {
            throw error;
        });
};
