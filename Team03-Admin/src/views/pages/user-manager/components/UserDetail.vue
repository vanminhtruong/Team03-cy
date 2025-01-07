<script setup>
import { ref, reactive, watch } from 'vue';
import { defineProps, defineEmits } from 'vue';
import { useI18n } from 'vue-i18n';
import { useFormatted } from '@/utils/useFormatted';

const props = defineProps({
    visible: {
        type: Boolean,
        default: false
    },
    user: {
        type: Object,
        default: () => ({})
    }
});

const { t } = useI18n();
const emit = defineEmits(['update:visible']);
const isVisible = ref(props.visible);
const { formatStatusLabel } = useFormatted();
const genders = ref([
    { label: '/demo/images/images_user/mars.svg', value: 0, severity: 'blue' },
    { label: '/demo/images/images_user/venus.svg', value: 1, severity: 'red' },
    { label: '/demo/images/images_user/genderless.svg', value: -1, severity: 'orange' }
]);
const roles = ref([
    { label: t('usermanagement.buyer'), value: 1, severity: 'success', disabled: true },
    { label: t('usermanagement.seller'), value: 2, severity: 'success', disabled: true },
    { label: t('usermanagement.admin'), value: 3, severity: 'success', disabled: true }
]);

const uiUserDetail = reactive({
    profilePicture: '',
    userName: '',
    name: '',
    email: '',
    phone: '',
    gender: '',
    address: ''
});

watch(
    () => props.user,
    (newUser) => {
        if (newUser) {
            uiUserDetail.profilePicture = newUser.profilePicture || '';
            uiUserDetail.userName = newUser.username || '';
            uiUserDetail.name = newUser.name || '';
            uiUserDetail.email = newUser.email || '';
            uiUserDetail.phone = newUser.phone || '';
            uiUserDetail.gender = newUser.gender || '';
            uiUserDetail.address = newUser.addresses || '';
            uiUserDetail.roleId = newUser.roleId || '';
        }
    },
    { immediate: true }
);

watch(
    () => props.visible,
    (newVal) => {
        isVisible.value = newVal;
    }
);

watch(isVisible, (newVal) => {
    emit('update:visible', newVal);
});
</script>

<template>
    <div class="card flex justify-center">
        <Dialog v-model:visible="isVisible" modal header="Edit Profile" class="min-w-[25rem] w-auto">
            <template #header>
                <div class="inline-flex items-center justify-center gap-2">
                    <Avatar v-if="uiUserDetail.profilePicture" :image="uiUserDetail.profilePicture" shape="circle" size="large" />
                    <Avatar v-else image="/demo/images/default/default-image.webp" shape="circle" size="large" />
                    <div class="flex flex-col">
                        <span class="font-bold whitespace-nowrap">{{ uiUserDetail.userName }}</span>
                        <span class="text-muted-color whitespace-nowrap text-xs">{{ uiUserDetail.email }}</span>
                    </div>
                    <Image v-if="formatStatusLabel(uiUserDetail.gender, genders).label" :src="formatStatusLabel(uiUserDetail.gender, genders).label" alt="Image" width="250" class="w-4 h-fit" />
                </div>
            </template>

            <span class="text-surface-500 dark:text-surface-400 block mb-4">{{ t('usermanagement.userInfomation') }}</span>

            <div class="flex items-center gap-4 mb-4">
                <label for="name" class="font-semibold w-24">{{ t('usermanagement.name') }}</label>
                <span v-if="uiUserDetail.name">{{ uiUserDetail.name }}</span>
                <span v-else class="text-danger-color">{{ t('usermanagement.noName') }}</span>
            </div>

            <div class="flex items-center gap-4 mb-2">
                <label for="phone" class="font-semibold w-24">{{ t('usermanagement.phone') }}</label>
                <span v-if="uiUserDetail.phone">{{ uiUserDetail.phone }}</span>
                <span v-else class="text-danger-color">{{ t('usermanagement.noPhone') }}</span>
            </div>

            <div class="flex items-center gap-4 mb-2">
                <label for="role" class="font-semibold w-24">{{ t('usermanagement.role') }}</label>
                <span>{{ formatStatusLabel(uiUserDetail.roleId, roles).label }}</span>
            </div>

            <div class="flex items-center gap-4 mb-2">
                <label for="address" class="font-semibold w-24">{{ t('usermanagement.address') }}</label>
                <ul v-if="uiUserDetail.address && uiUserDetail.address.length > 0">
                    <li v-for="(address, index) in uiUserDetail.address" :key="index">
                        <span>{{ index + 1 }}. {{ address.addressLine1 }}</span>
                        <span v-if="address.addressLine2"> - {{ address.addressLine2 }}</span>
                    </li>
                </ul>
                <p v-else>{{ t('usermanagement.noAddress') }}</p>
            </div>

            <template #footer>
                <Button label="Cancel" outlined severity="secondary" @click="isVisible = false" autofocus />
            </template>
        </Dialog>
    </div>
</template>
