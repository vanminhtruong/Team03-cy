import { POST } from '@/service/ApiService';
export const login = async (email, password) => {
    return await POST('/v1/api/authentication/sign-in', {
        email,
        password
    });
};
