import { GET } from '@/src/config/ApiService';
import { Category } from '@/src/interface/category.interface';
import { ProductResponse } from '@/src/interface/product.interface';

export const fetchUsersChatBySenderId = async (userId: string) => {
    if (!userId) throw new Error('User ID is required to fetch chats.');

    const response = await GET(`v1/api/message/${userId}`);
    const userData = response.data.data;

    return userData.map((user: { lastMessage: any }) => ({
        ...user,
        lastMessage: Array.isArray(user.lastMessage) ? user.lastMessage : [user.lastMessage]
    }));
};

export const fetchCategories = async (): Promise<Category[]> => {
    const response = await GET('/v1/api/category');
    const allCategories = response.data.data;

    return allCategories.filter((category: { parentId: number }) => category.parentId === 0);
};

export const fetchActiveBanner = async () => {
    try {
        const response = await GET('/v1/api/banner/active');
        return response.data.data;
    } catch (error) {
        console.error('Error fetching banner:', error);
        throw error;
    }
};

export const fetchProducts = async (page = 0, size = 35) => {
    const response = await GET(`/v1/api/product/filter?page=${page}&size=${size}&type=1`);
    const productData = response.data.data.content;
    const totalElements = response.data.data.page.totalElements;

    return { products: productData, totalRecords: totalElements };
};
