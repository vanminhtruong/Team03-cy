import Cookies from 'js-cookie';
import { decodeToken } from '@/utils/jwtUtils';

export default function auth(to, from, next) {
    const token = Cookies.get('token');
    if (!token) {
        next('/login');
        return;
    }

    const decodedToken = decodeToken(token);
    if (decodedToken && decodedToken.role === 3) {
        next();
    } else {
        next('/login');
    }
}
