import axios from 'axios';
import { useUtils } from '../utils/useUtils';

export const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

axiosInstance.interceptors.request.use(
    async (config) => {
        let cookieValue = await useUtils().getCookie('token');
        if (cookieValue) {
            config.headers['Authorization'] = `Bearer ${cookieValue}`;
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
