<script setup>
import { defineProps, defineEmits } from 'vue';
import { useRouter } from 'vue-router';
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import { CategoryService } from '@/views/pages/category/service/CategoryService';
import { getAllCategoriesParent } from '../extractFunction';
import { searchCategoryByName } from '../extractFunction';

const searchItem = ref('');
const router = useRouter();
const toast = useToast();
const props = defineProps({
    visible: {
        type: Boolean,
        default: false
    },
    child: {
        type: Array,
        default: () => []
    },
    category: {
        type: Object,
        default: () => ({})
    },
    header: {
        type: String,
        default: ''
    }
});

const emit = defineEmits(['update:visible', 'category-child']);
const { t } = useI18n();
const isVisible = ref(props.visible);
const headerDialog = ref(props.header);
const editingRows = ref([]);
const childCategories = ref([...props.child]);
const isLoading = ref(false);
watch(
    () => [props.visible, props.header, props.child],
    ([newVisible, newCategory, newChild]) => {
        isVisible.value = newVisible;
        headerDialog.value = newCategory;
        childCategories.value = [...newChild];
    },
    { immediate: true }
);

watch(isVisible, (newVal) => {
    emit('update:visible', newVal);
});

watch(searchItem, (newVal) => {
    if (newVal) {
        router.push({ query: { search: newVal } });
    } else {
        router.push({ query: {} });
    }
    searchCategoryByName(childCategories, props.category.categoryId, newVal, toast, isLoading);
});
const onRowEditSave = async (event) => {
    const { data, newData } = event;
    const index = props.child.findIndex((item) => item.categoryId === data.categoryId);
    const formData = new FormData();
    formData.append('name', newData.categoryName);
    formData.append('parent_id', data.parentId);
    if (index > -1) {
        try {
            await CategoryService.updateCategory(data.categoryId, formData);

            toast.add({
                severity: 'success',
                summary: t('category.success'),
                detail: t('category.categoryChild.categoryUpdateSuccess'),
                life: 3000
            });
            await getAllCategoriesParent(childCategories, data.parentId, toast, isLoading);
        } catch (error) {
            toast.add({
                severity: 'error',
                summary: t('category.error'),
                detail: t('category.categoryChild.failUpdateCategory'),
                life: 3000
            });
        }
    } else {
        toast.add({
            severity: 'error',
            summary: t('category.error'),
            detail: t('category.categoryChild.categoryNotFound'),
            life: 3000
        });
    }
};

const onDeleteCategory = async (category) => {
    emit('category-child', { action: 'delete', category });
};
const AddCategory = (category) => {
    emit('category-child', { action: 'add', category });
};
</script>

<template>
    <Dialog v-model:visible="isVisible" class="sm:min-w-[450px] min-w-[420px]" :header="header" :modal="true">
        <div v-if="child.length > 0" class="mt-4">
            <DataTable
                v-model:editingRows="editingRows"
                editMode="row"
                :value="childCategories"
                :paginator="true"
                :rows="5"
                :rowsPerPageOptions="[5, 10, 20]"
                dataKey="categoryId"
                removableSort
                :loading="isLoading"
                @row-edit-save="onRowEditSave"
                class="sm:min-w-[50rem]"
                :pt="{
                    column: {
                        bodycell: ({ state }) => ({
                            style: state['d_editing'] && 'padding-top: 0.75rem; padding-bottom: 0.75rem'
                        })
                    }
                }"
            >
                <template #header>
                    <div class="flex justify-end">
                        <Button :label="t('category.new')" icon="pi pi-plus" severity="secondary" class="mr-2" @click="AddCategory(category)" />

                        <div class="flex flex-row gap-2 items-center justify-between">
                            <IconField>
                                <InputIcon>
                                    <i class="pi pi-search" />
                                </InputIcon>
                                <InputText v-model="searchItem" :placeholder="t('category.searchCategoryName')" />
                            </IconField>
                        </div>
                    </div>
                </template>

                <Column field="no" :header="t('category.no')" style="width: 5rem" sortable></Column>

                <Column field="categoryName" :header="t('category.categoryName')" style="min-width: 12rem" sortable>
                    <template #editor="{ data, field }">
                        <InputText v-model="data[field]" fluid />
                    </template>
                </Column>
                <Column :rowEditor="true" style="min-width: 8rem" bodyStyle="text-align:right"></Column>
                <Column style="min-width: 3rem" bodyStyle="text-align:left">
                    <template #body="slotProps">
                        <Button icon="pi pi-trash" rounded severity="danger" @click="onDeleteCategory(slotProps.data)" variant="text" />
                    </template>
                </Column>
            </DataTable>
        </div>
        <div v-else class="text-surface-600 dark:text-surface-400 mt-4 flex flex-col">
            <Button :label="t('category.new')" icon="pi pi-plus" severity="secondary" class="mr-2 mb-2 w-fit" @click="AddCategory(category)" />
            {{ t('category.categoryChild.noChildCategory') }}
        </div>
    </Dialog>
</template>

<style lang="scss" scoped></style>
