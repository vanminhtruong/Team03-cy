import { GET, DELETE, POST } from '@/service/ApiService';

export default function UserManagementService() {
    async function getUsers() {
        try {
            const response = await GET(`/v1/api/user`);
            return response.data;
        } catch (error) {
            return error;
        }
    }

    async function getUserBySearch(searchItem = '', status = '') {
        try {
            const response = await GET(`/v1/api/user?name=${searchItem}&status=${status}`);
            return response.data;
        } catch (error) {
            return error;
        }
    }

    async function getUser(userId) {
        try {
            const response = await GET(`/v1/api/user/${userId}`);
            return response.data;
        } catch (error) {
            return error;
        }
    }

    async function deleteUser(userId) {
        try {
            const response = await DELETE(`/v1/api/user/${userId}`);
            return response.message;
        } catch (error) {
            return error;
        }
    }

    async function getProductsOfShop(shopId, pageIndex, pageSize) {
        try {
            const response = await GET(`/v1/api/product/shop/${shopId}?pageSize=${pageSize}&pageIndex=${pageIndex}`);
            return response.data;
        } catch (error) {
            return error;
        }
    }

    async function postStatusShop(shopId, status) {
        try {
            const response = await POST(`/v1/api/admin/${shopId}/status-shop?status=${status}`);
            return response.data.message;
        } catch (error) {
            return error;
        }
    }

    return {
        getUsers,
        getUser,
        deleteUser,
        getProductsOfShop,
        postStatusShop,
        getUserBySearch
    };
}
