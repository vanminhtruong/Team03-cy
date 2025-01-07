import { CategoryService } from './service/CategoryService';

export const getAllCategoriesParent = async (categories, id, toast, isLoading) => {
    isLoading.value = true;
    try {
        const response = await CategoryService.findByParentId(id);
        if (response.status === 200) {
            categories.value =
                response.data.map((user, index) => {
                    return {
                        ...user,
                        no: index + 1
                    };
                }) || [];
        }
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: error.message, life: 3000 });
    } finally {
        isLoading.value = false;
    }
};

export const searchCategoryByName = async (categories, parentId, searchQuery, toast, isLoading) => {
    isLoading.value = true;
    try {
        const response = await CategoryService.searchCategory(parentId, searchQuery);
        if (response.status === 200) {
            categories.value =
                response.data.content.map((user, index) => {
                    return {
                        ...user,
                        no: index + 1
                    };
                }) || [];
        }
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: error.message, life: 3000 });
    } finally {
        isLoading.value = false;
    }
};
