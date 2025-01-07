<script setup>
import { useRoute, useRouter } from 'vue-router';
import { CategoryService } from '@/views/pages/category/service/CategoryService';
import { onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import ConfirmDelete from './components/ConfirmDelete.vue';
import AddEditItem from './components/AddEditItem.vue';
import CategoryChild from './components/CategoryChild.vue';
import { getAllCategoriesParent, searchCategoryByName } from './extractFunction';
import DataTable from 'primevue/datatable';

const toast = useToast();
const categoryParent = ref([]);
const categoriesParent = ref([]);
const categoriesChild = ref([]);
const showPopover = ref(false);
const messageDelete = ref('');
const deleteCategoryDialog = ref(false);
const addEditcategoryDialog = ref(false);
const searchItem = ref('');
const headerDialog = ref('');
const headerChild = ref('');
const categoryParentId = ref(null);
const route = useRoute();
const router = useRouter();
const isLoading = ref(false);
const { t } = useI18n();

watch(searchItem, (newVal) => {
    if (newVal) {
        router.push({ query: { search: newVal } });
    } else {
        router.push({ query: {} });
    }
    searchCategoryByName(categoriesParent, 0, newVal, toast, isLoading);
});

onMounted(() => {
    const searchQuery = route.query.search || '';
    searchItem.value = searchQuery;
    getAllCategoriesParent(categoriesParent, 0, toast, isLoading);
});

const updateCategoryParent = async (id, category) => {
    await CategoryService.updateCategory(id, category);
    toast.add({ severity: 'success', summary: t('category.success'), detail: t('category.successEdit'), life: 3000 });
    getAllCategoriesParent(categoriesParent, 0, toast, isLoading);
};

const addCategoryParent = async (category, parentId) => {
    await CategoryService.addNewCategory(category);
    toast.add({ severity: 'success', summary: t('category.success'), detail: t('category.successAdd'), life: 3000 });
    if (parentId) {
        getAllCategoriesParent(categoriesChild, parentId, toast, isLoading);
    }
    getAllCategoriesParent(categoriesParent, 0, toast, isLoading);
};

const showCategoryChild = async (event) => {
    const selectedCategory = event.data;
    categoryParent.value = selectedCategory;
    getAllCategoriesParent(categoriesChild, selectedCategory.categoryId, toast, isLoading);
    setTimeout(() => {
        showPopover.value = true;
        headerChild.value = selectedCategory.categoryName;
    }, 100);
};

const confirmEditCategory = (category) => {
    addEditcategoryDialog.value = true;
    categoryParent.value = category;
    headerDialog.value = t('category.editCategory');
};

const confirmDeleteCategory = async (category) => {
    deleteCategoryDialog.value = true;
    categoryParent.value = category;
    messageDelete.value = t('category.confirmDeleteMessage', [category.categoryName]);
};

const AddCategory = () => {
    addEditcategoryDialog.value = true;
    headerDialog.value = t('category.addCategory');
};

const handleDelete = async (category) => {
    try {
        await CategoryService.deleteCategory(category.categoryId);
        toast.add({ severity: 'success', summary: t('category.success'), detail: t('category.successDelete'), life: 3000 });
        deleteCategoryDialog.value = false;
        await getAllCategoriesParent(categoriesChild, category.parentId, toast, isLoading);
        await getAllCategoriesParent(categoriesParent, 0, toast, isLoading);
        categoryParent.value = {};
    } catch (error) {
        toast.add({ severity: 'error', summary: t('category.error'), detail: t('category.errorDelete'), life: 3000 });
    }
};

const handleAddEditItem = async (newValue) => {
    if (!newValue.name) {
        toast.add({
            severity: 'error',
            summary: t('category.error'),
            detail: t('category.nameCategoryRequired'),
            life: 3000
        });
        return;
    }

    const formData = new FormData();
    formData.append('name', newValue.name);

    const parentId = newValue.parentId || 0;

    formData.append('parent_id', parentId);
    if (newValue.image) {
        formData.append('file', newValue.image);
    }

    try {
        if (headerDialog.value === t('category.addCategory')) {
            await addCategoryParent(formData, parentId);
        } else {
            await updateCategoryParent(categoryParent.value.categoryId, formData);
        }
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: t('category.error'),
            detail: error.response?.data?.error,
            life: 3000
        });
    }
};

const controlCategoryChild = async (event) => {
    const { action, category } = event;
    if (action === 'delete') {
        confirmDeleteCategory(category);
    } else if (action === 'add') {
        categoryParentId.value = category.categoryId;
        AddCategory();
    }
};
</script>

<template>
    <div class="card">
        <div class="flex justify-center text-2xl">{{ t('category.allCategories') }}</div>
        <div class="card">
            <div class="flex sm:justify-end justify-between mb-4">
                <Button :label="t('category.new')" icon="pi pi-plus" severity="secondary" class="mr-2" @click="AddCategory" />

                <div class="flex flex-row gap-2 items-center justify-between">
                    <IconField>
                        <InputIcon>
                            <i class="pi pi-search" />
                        </InputIcon>
                        <InputText v-model="searchItem" :placeholder="t('category.searchCategoryName')" />
                    </IconField>
                </div>
            </div>
            <DataTable :loading="isLoading" :rowsPerPageOptions="[5, 10, 20]" selectionMode="single" :value="categoriesParent" row-hover="true" :paginator="true" :rows="5" dataKey="categoryId" removableSort @row-click="showCategoryChild">
                <template #header> </template>

                <Column field="no" :header="t('category.no')" style="width: 5rem" sortable></Column>

                <Column field="categoryName" :header="t('category.categoryName')" style="min-width: 12rem" sortable></Column>

                <Column field="image" :header="t('category.image')" style="min-width: 10rem">
                    <template #body="slotProps">
                        <div v-if="slotProps.data.image">
                            <img :src="slotProps.data.image" :alt="slotProps.data.image" class="shadow-lg object-cover" width="60" height="60" />
                        </div>
                        <div v-else>
                            <img src="/demo/images/default/default-image.webp" alt="Image01" class="shadow-lg object-cover" width="60" height="60" />
                        </div>
                    </template>
                </Column>

                <Column :exportable="false" style="min-width: 8rem">
                    <template #body="slotProps">
                        <div class="flex flex-row justify-center">
                            <Button icon="pi pi-pencil" variant="text" rounded @click="confirmEditCategory(slotProps.data)" class="mr-2" />
                            <Button icon="pi pi-trash" variant="text" rounded severity="danger" @click="confirmDeleteCategory(slotProps.data)" />
                        </div>
                    </template>
                </Column>
            </DataTable>
        </div>

        <ConfirmDelete v-model:visible="deleteCategoryDialog" :category="categoryParent" :message="messageDelete" @confirm-delete="handleDelete" />
        <AddEditItem v-model:visible="addEditcategoryDialog" :catogoryId="categoryParentId" :category="categoryParent" :categoriesParent="categoriesParent" :header="headerDialog" @confirm-controller="handleAddEditItem" />
        <CategoryChild v-model:visible="showPopover" :child="categoriesChild" :category="categoryParent" :header="headerChild" @category-child="controlCategoryChild" />
    </div>
</template>

<!-- eslint-disable prettier/prettier -->
<style>
.no-border {
    border: none !important;
    box-shadow: none !important;
}

li[draggable='true'] {
    cursor: grab;
}

li[draggable='true']:hover {
    background-color: #f0f0f0;
}
</style>
