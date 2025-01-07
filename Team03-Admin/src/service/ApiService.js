import { axiosInstance } from './Axios';

export const GET = async (url, params) => (await axiosInstance.get(url, { params })).data;
export const DELETE = async (url, params) => (await axiosInstance.delete(url, { params })).data;
export const PUT = async (url, data) => (await axiosInstance.put(url, data)).data;
export const PUT_CATEGORY = async (url, data, config = {}) => {
    const headers = {
        ...config.headers
    };

    if (data instanceof FormData) {
        delete headers['Content-Type'];
    }
    return (await axiosInstance.put(url, data, { ...config, headers })).data;
};

export const POST = async (url, data, config = {}) => {
    const headers = {
        ...config.headers
    };

    if (data instanceof FormData) {
        headers['Content-Type'] = 'multipart/form-data';
    }
    return (await axiosInstance.post(url, data, { ...config, headers })).data;
};
