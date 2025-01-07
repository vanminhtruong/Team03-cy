/* eslint-disable prettier/prettier */
import { GET, POST, DELETE, PUT, PUT_CATEGORY } from '@/service/ApiService';

export const CategoryService = {
    getAllCategories() {
        return GET('/v1/api/category');
    },
    findByParentId(parentId) {
        return GET(`/v1/api/category/${parentId}/child`);
    },
    updateCategory(id, data) {
        return PUT_CATEGORY(`/v1/api/category/${id}`, data);
    },
    deleteCategory(id) {
        return DELETE(`/v1/api/category/${id}`);
    },
    activateCategory(id) {
        return PUT(`/v1/api/category/activate/${id}`);
    },
    addNewCategory(formData) {
        return POST('/v1/api/category', formData);
    },
    searchCategory(parentId, searchQuery) {
        return GET(`/v1/api/category/filter/${parentId}?categoryName=${searchQuery}`);
    }
};
