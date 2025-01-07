<script setup>
import { useToast } from 'primevue/usetoast';
import { onMounted, ref, watch } from 'vue';
import { useFormatted } from '@/utils/useFormatted';
import { useI18n } from 'vue-i18n';
import UserManagementService from '@/views/pages/user-manager/service/UserManagementService';
import User from './components/UserDetail.vue';
import { useRoute, useRouter } from 'vue-router';

const toast = useToast();
const dt = ref();
const { t } = useI18n();
const users = ref([]);
const selectedActive = ref('');
const selectedUser = ref({});
const userDetailDialog = ref(false);
const searchItem = ref('');
const totalRecords = ref(0);
const { formatStatusLabel } = useFormatted();
const route = useRoute();
const router = useRouter();
const isLoading = ref(false);

const statusesUser = ref([
    { label: t('usermanagement.all'), value: '', severity: '' },
    { label: t('usermanagement.inactive'), value: -1, severity: 'danger' },
    { label: t('usermanagement.waiting'), value: 0, severity: 'info' },
    { label: t('usermanagement.active'), value: 1, severity: 'success' }
]);

const roles = ref([
    { label: t('usermanagement.buyer'), value: 1, severity: 'success' },
    { label: t('usermanagement.seller'), value: 2, severity: 'success' },
    { label: t('usermanagement.admin'), value: 3, severity: 'success' }
]);

async function getUserBySearch(searchItem, status) {
    isLoading.value = true;
    try {
        const response = await UserManagementService().getUserBySearch(searchItem, status);
        if (response.content) {
            users.value = response.content.map((user, index) => {
                return {
                    ...user,
                    no: index + 1
                };
            });
        }
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: t('usermanagement.messages.getAllUsersError'),
            detail: error.message,
            life: 3000
        });
    } finally {
        isLoading.value = false;
    }
}
onMounted(() => {
    const searchQuery = route.query.search || '';
    const statusQuery = route.query.status || '';

    const foundStatus = statusesUser.value.find((status) => status.value == statusQuery);

    selectedActive.value = foundStatus ? foundStatus.value : '';
    searchItem.value = searchQuery;
    getUserBySearch(searchItem.value, selectedActive.value);
});

watch([searchItem, selectedActive], ([newSearchItem, newSelectedActive]) => {
    const searchParam = newSearchItem ? { search: newSearchItem } : {};
    const statusParam = newSelectedActive ? { status: newSelectedActive } : {};

    router.push({ query: { ...searchParam, ...statusParam } });
    getUserBySearch(newSearchItem, newSelectedActive);
});

watch(
    () => route.query.search,
    (newSearch) => {
        searchItem.value = newSearch || '';
        getUserBySearch(searchItem.value, selectedActive.value);
    }
);

watch(
    () => route.query.status,
    (newStatus) => {
        const foundStatus = statusesUser.value.find((status) => status.value == newStatus);
        if (foundStatus) {
            selectedActive.value = foundStatus.value;
        }
        getUserBySearch(searchItem.value, selectedActive.value);
    }
);

function showUserDetailDialog(event) {
    selectedUser.value = event.data;
    userDetailDialog.value = true;
}
</script>

<template>
    <div class="flex flex-col card">
        <h4 class="mt-8 text-2xl text-center">{{ t('usermanagement.manageUsers') }}</h4>
        <div class="card">
            <div class="flex justify-end mb-4">
                <div class="flex flex-row gap-2 items-center justify-between">
                    <IconField>
                        <InputIcon>
                            <i class="pi pi-search" />
                        </InputIcon>
                        <InputText v-model="searchItem" :placeholder="t('usermanagement.searchName')" />
                    </IconField>
                </div>
            </div>
            <Tabs :value="selectedActive" class="no-underline-tabs">
                <TabList>
                    <Tab v-for="status in statusesUser" :key="status.value" :value="status.value" as="div" class="flex items-center gap-2 no-underline-tab" @click="selectedActive = status.value">
                        {{ status.label }}
                    </Tab>
                </TabList>
            </Tabs>
            <DataTable ref="dt" :value="users" :loading="isLoading" :row-hover="true" dataKey="userId" :paginator="true" :rows="5" :totalRecords="totalRecords" :rowsPerPageOptions="[5, 10, 20]" removableSort @row-click="showUserDetailDialog">
                <Column field="no" :header="t('usermanagement.no')" style="width: 5rem" sortable></Column>
                <Column field="name" :header="t('usermanagement.name')" style="min-width: 12rem" sortable> </Column>
                <Column field="profilePicture" :header="t('usermanagement.avatar')" style="min-width: 10rem" sortable>
                    <template #body="slotProps">
                        <div v-if="slotProps.data.profilePicture">
                            <img :src="slotProps.data.profilePicture" :alt="slotProps.data.profilePicture" class="shadow-lg object-cover" width="40" height="40" />
                        </div>
                        <div v-else>
                            <img src="/demo/images/default/default-image.webp" alt="Image01" class="shadow-lg object-cover" width="40" height="40" />
                        </div>
                    </template>
                </Column>
                <Column field="roleId" :header="t('usermanagement.role')" style="min-width: 10rem" sortable>
                    <template #body="slotProps">
                        <Tag :value="formatStatusLabel(slotProps.data.roleId, roles).label" :severity="formatStatusLabel(slotProps.data.roleId, roles).severity" />
                    </template>
                </Column>
                <Column field="isActive" :header="t('usermanagement.userStatus')" style="min-width: 10rem" sortable>
                    <template #body="slotProps">
                        <Tag :value="formatStatusLabel(slotProps.data.isActive, statusesUser).label" :severity="formatStatusLabel(slotProps.data.isActive, statusesUser).severity" />
                    </template>
                </Column>
                <Column field="email" :header="t('usermanagement.email')" style="min-width: 14rem" sortable></Column>
            </DataTable>
        </div>
        <User v-model:visible="userDetailDialog" :user="selectedUser" />
    </div>
</template>
