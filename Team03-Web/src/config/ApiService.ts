import { axiosInstance } from './Axios';

export const GET = async (url: string, params?: Record<string, any>) => await axiosInstance.get(url, { params });

export const POST = async (url: string, data: any) => await axiosInstance.post(url, data);

export const DELETE = async (url: string, params?: Record<string, any>) => await axiosInstance.delete(url, { params });

export const PUT = async (url: string, data: any) => await axiosInstance.put(url, data);

export const DELETE_ARRAY = async (url: string, data?: Record<string, any>) => {
    return await axiosInstance.delete(url, {
        data: data
    });
};

export const DELETE_PROMOTION = async (url: string, body?: any) => {
    return await axiosInstance.delete(url, {
        data: body,
        headers: {
            'Content-Type': 'application/json',
            accept: '*/*'
        }
    });
};
