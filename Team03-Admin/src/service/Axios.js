/* eslint-disable prettier/prettier */
import axios from 'axios';
import { useUtils } from '@/utils/useUtils';

const baseURL = import.meta.env.VITE_API_URL;

export const axiosInstance = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json'
    }
});

axiosInstance.interceptors.request.use(
    async (config) => {
        const { getCookie } = useUtils();
        const token = await getCookie('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        if (config.data instanceof FormData) {
            config.headers['Content-Type'] = 'multipart/form-data';
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);
