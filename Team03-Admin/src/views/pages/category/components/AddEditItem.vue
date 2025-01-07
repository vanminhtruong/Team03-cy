<script setup>
import { defineProps, defineEmits } from 'vue';
import { ref, watch, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import { z } from 'zod';

const props = defineProps({
    visible: {
        type: Boolean,
        default: false
    },
    catogoryId: {
        type: Number,
        default: null
    },
    category: {
        type: Object,
        default: () => ({})
    },
    categoriesParent: {
        type: Array,
        default: () => []
    },
    header: {
        type: String,
        default: ''
    }
});

const { t } = useI18n();
const toast = useToast();
const emit = defineEmits(['update:visible', 'confirm-controller']);
const selectedCategory = ref(props.category.categoryId || null);
const isVisible = ref(props.visible);
const headerAddEdit = ref(props.header);
const categoryList = {
    name: '',
    parentId: null,
    image: null,
    imagePreview: null
};

const categorySchema = z.object({
    name: z.string().min(1, { message: t('category.addEditItem.nameRequired') }),
    image: z.any().refine((value) => value !== null, { message: t('category.addEditItem.imageRequired') })
});

const errorMessage = reactive({
    name: '',
    image: ''
});

const newCategory = reactive({ ...categoryList });
const backupCategory = reactive({ ...categoryList });
const isEditMode = ref(false);

const validateForm = () => {
    const result = categorySchema.safeParse(newCategory);
    Object.keys(errorMessage).forEach((key) => (errorMessage[key] = ''));
    if (!result.success) {
        result.error.errors.forEach((err) => {
            errorMessage[err.path[0]] = err.message;
        });
    }
    return result.success;
};

const clearErrorMessage = () => {
    Object.keys(errorMessage).forEach((key) => (errorMessage[key] = ''));
};

const resetForm = () => {
    Object.assign(newCategory, categoryList);
    clearErrorMessage();
};

const populateEditForm = async () => {
    if (props.category && Object.keys(props.category).length > 0) {
        isEditMode.value = true;
        Object.assign(newCategory, {
            name: props.category.categoryName || '',
            parentId: props.category.parentId || null,
            image: null,
            imagePreview: props.category.image || null
        });

        if (props.category.image) {
            try {
                const response = await fetch(props.category.image);
                const blob = await response.blob();
                const file = new File([blob], 'category_image.jpg', { type: blob.type });

                newCategory.image = file;
            } catch (error) {
                toast.add({ severity: 'error', summary: t('catogory.error'), detail: t('category.addEditItem.failConvert'), life: 3000 });
            }
        }
        Object.assign(backupCategory, newCategory);
    }
};

watch(
    () => [props.category, headerAddEdit.value, props.catogoryId],
    ([category, header, categoryId]) => {
        if (header === t('category.editCategory')) {
            populateEditForm();
        } else {
            resetForm();
        }
        if (category) {
            selectedCategory.value = null;
        } else {
            selectedCategory.value = categoryId;
        }
    },
    { immediate: true }
);

const saveCategory = () => {
    if (!validateForm()) return;
    emit('confirm-controller', newCategory);
    isVisible.value = false;
    selectedCategory.value = null;
};
watch(
    () => [props.visible, props.header],
    ([newVisible, newCategory]) => {
        isVisible.value = newVisible;
        headerAddEdit.value = newCategory;
    }
);

watch(isVisible, (newVal) => {
    emit('update:visible', newVal);
    console.log('category', props.category);
});

const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = () => {
            newCategory.imagePreview = reader.result;
            newCategory.image = file;
        };
        reader.readAsDataURL(file);
    }

    event.target.value = '';
};

const handleImageDrop = (event) => {
    const file = event.dataTransfer.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = () => {
            newCategory.imagePreview = reader.result;
            newCategory.image = file;
        };
        reader.readAsDataURL(file);
    }
};

const clearImage = () => {
    newCategory.image = null;
    newCategory.imagePreview = '';
};

const onParentCategoryChange = (selectedId) => {
    newCategory.parentId = selectedId.value;
};
</script>

<template>
    <Dialog v-model:visible="isVisible" class="w-[450px]" :header="headerAddEdit" :modal="true">
        <div class="flex flex-col mt-6">
            <label for="categoryName" class="block font-bold mb-3">{{ t('category.addEditItem.name') }}</label>
            <InputText id="categoryName" v-model="newCategory.name" required :placeholder="t('category.categoryName')" />
            <small class="text-red-500" v-if="errorMessage.name">{{ errorMessage.name }}</small>
        </div>
        <div class="flex flex-col mt-6">
            <label for="categoryImage" class="block font-bold mb-3">{{ t('category.addEditItem.categoryImage') }}</label>
            <div class="flex flex-col border-dashed p-2 border-2 relative" @dragover.prevent @drop.prevent="handleImageDrop">
                <input type="file" id="imageInput" accept="image/*" class="mt-2 cursor-pointer opacity-0 absolute" @change="handleImageUpload" />

                <button v-if="newCategory.imagePreview" @click="clearImage" class="absolute top-0 right-0 z-10 text-red-500">
                    <i class="pi pi-times-circle bg-white rounded-full" style="font-size: 1.5rem"></i>
                </button>

                <div v-if="!newCategory.imagePreview" class="flex items-center text-gray-600 cursor-pointer my-6">
                    <i class="pi pi-images mr-2"></i>
                    <p>{{ t('category.addEditItem.imageUpload') }}</p>
                </div>

                <img v-if="newCategory.imagePreview" :src="newCategory.imagePreview" :alt="t('category.addEditItem.categoryImagePreview')" class="w-full h-full object-cover" />
            </div>
            <small class="text-red-500" v-if="errorMessage.image">{{ errorMessage.image }}</small>
        </div>
        <div class="flex flex-col mt-6">
            <label for="parentCategory" class="block font-bold mb-3">{{ t('category.addEditItem.parentCategory') }}</label>
            <Select v-model="selectedCategory" :options="categoriesParent" optionLabel="categoryName" optionValue="categoryId" :placeholder="t('category.addEditItem.selectAParentCategory')" @change="onParentCategoryChange" />
        </div>
        <template #footer>
            <Button class="mt-4" :label="t('category.addEditItem.cancel')" icon="pi pi-times" text @click="isVisible = false" />
            <Button class="mt-4" :label="t('category.addEditItem.save')" icon="pi pi-check" @click="saveCategory" />
        </template>
    </Dialog>
</template>

<style lang="scss" scoped></style>
