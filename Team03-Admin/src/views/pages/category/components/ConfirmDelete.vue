<script setup>
import { defineProps, defineEmits } from 'vue';
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
    visible: {
        type: Boolean,
        default: false
    },
    category: {
        type: Object,
        default: () => ({})
    },
    message: {
        type: String,
        default: ''
    }
});

const { t } = useI18n();
const emit = defineEmits(['update:visible', 'confirm-delete']);
const isVisible = ref(props.visible);
const messageDelete = ref(props.message);

const deleteCategory = () => {
    emit('confirm-delete', props.category);
    isVisible.value = false;
};
watch(
    () => [props.visible, props.message],
    ([newVisible, newCategory]) => {
        isVisible.value = newVisible;
        messageDelete.value = newCategory;
    }
);

watch(isVisible, (newVal) => {
    emit('update:visible', newVal);
});
</script>

<template>
    <div>
        <Dialog v-model:visible="isVisible" :style="{ width: '450px' }" :header="t('category.headerConfirmDelete')" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="category" v-html="messageDelete"></span>
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="isVisible = false" />
                <Button label="Yes" icon="pi pi-check" @click="deleteCategory" />
            </template>
        </Dialog>
    </div>
</template>

<style lang="scss" scoped></style>
