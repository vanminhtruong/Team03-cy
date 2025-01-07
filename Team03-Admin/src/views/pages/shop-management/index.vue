<script setup>
import { ref, watch, onMounted } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Dialog from 'primevue/dialog';
import { getShop } from '@/views/pages/shop-management/service/getShop.js';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import Tabs from 'primevue/tabs';
import TabList from 'primevue/tablist';
import Tab from 'primevue/tab';
import { useToast } from 'primevue/usetoast';
import { updateStatustShop } from '@/views/pages/shop-management/service/updateStatustShop.js';
import { useI18n } from 'vue-i18n';
import { getAddressById } from '@/views/pages/shop-management/service/getAddressById.js';
import { formatDate } from '@/utils/formatDate.js';
import { useRoute, useRouter } from 'vue-router';
import { debounce } from '@/utils/debounce.js';

const { t } = useI18n();
const toast = useToast();

const shops = ref([]);
const selectedShop = ref(null);
const selectedStatus = ref('');
const isLoading = ref(false);
const error = ref(null);
const searchName = ref('');
const pageIndex = ref(1);
const rowsPerPage = ref(5);
const totalRecords = ref(0);
const router = useRouter();
const route = useRoute();
const reload = ref(false);

const statuses = [
    { value: '', label: t('shopmanagement.statuses.all') },
    { value: 1, label: t('shopmanagement.statuses.ready') },
    { value: 2, label: t('shopmanagement.statuses.pending') },
    { value: 3, label: t('shopmanagement.statuses.rejected') },
    { value: 4, label: t('shopmanagement.statuses.locked') }
];
const isReasonDialogVisible = ref(false);
const reason = ref('');

watch(searchName, async (newSearch) => {
    await router.push({
        query: { search: newSearch || undefined, status: selectedStatus.value || undefined }
    });
    await fetchShops();
});

const fetchShops = async () => {
    isLoading.value = true;
    error.value = null;
    await router.push({
        query: { search: searchName.value || undefined, status: selectedStatus.value || undefined }
    });

    try {
        const response = await getShop(searchName.value, selectedStatus.value);

        if (Array.isArray(response)) {
            const validStatuses = [1, 2, 3, 4];
            const filteredShops = response.filter((shop) => {
                const shopStatus = Number(shop.shop_status);
                if (selectedStatus.value !== '') {
                    return shopStatus === Number(selectedStatus.value) && validStatuses.includes(shopStatus);
                }
                return validStatuses.includes(shopStatus);
            });
            shops.value = filteredShops.map((item) => ({
                ...item,
                time_created_shop: item.time_created_shop ? formatDate(item.time_created_shop) : t('shopmanagement.actions.noData')
            }));
            totalRecords.value = shops.value.length;
        } else {
            error.value = t('shopmanagement.actions.noData');
            shops.value = [];
            totalRecords.value = 0;
        }
    } catch (err) {
        error.value = err.message || t('shopmanagement.actions.errorUpdate');
        shops.value = [];
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.value,
            life: 3000
        });
    } finally {
        isLoading.value = false;
    }
};
const fetchShopsDebounced = debounce(fetchShops, 500);
watch(searchName, (newSearch) => {
    router.push({
        query: { search: newSearch || undefined, status: selectedStatus.value || undefined }
    });
    fetchShopsDebounced();
});

watch([selectedStatus, pageIndex], () => {
    fetchShops();
});

const openShopDetails = async (shop) => {
    selectedShop.value = shop;
};
const fullAddressRef = ref('Đang tải...');

const getAddressFull = async (addressId) => {
    try {
        const res = await getAddressById(addressId);
        if (res && res.length > 0) {
            return res.filter(Boolean).join(', ');
        }
        return 'Địa chỉ không xác định';
    } catch (error) {
        console.error('Lỗi khi lấy địa chỉ:', error);
        return 'Địa chỉ không xác định';
    }
};
watch(
    () => selectedShop.value,
    async (newShop) => {
        if (newShop && newShop.data.address_id_shop) {
            fullAddressRef.value = await getAddressFull(newShop.data.address_id_shop);
        }
    },
    { immediate: true }
);

const updateShopStatus = async (status) => {
    if (!selectedShop.value) return;

    if (status === 4) {
        isReasonDialogVisible.value = true;
    } else {
        await updateShopStatusWithoutReason(status);
    }
};

const closeReasonDialog = () => {
    isReasonDialogVisible.value = false;
    reason.value = '';
};

const submitReason = async () => {
    if (!reason.value.trim()) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: t('shopmanagement.actions.reasonRequired'),
            life: 3000
        });
        return;
    }

    try {
        const userId = selectedShop.value.userId || selectedShop.value.data.userId;

        isLoading.value = true; // Set loading to true before the API call
        await updateStatustShop(userId, 4, reason.value);

        const shopIndex = shops.value.findIndex((shop) => shop.userId === userId);
        if (shopIndex !== -1) {
            shops.value[shopIndex].shop_status = 4;
        }

        await fetchShops();

        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: t('shopmanagement.actions.successUpdate'),
            life: 3000
        });

        closeReasonDialog();
    } catch (err) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: err.message || t('shopmanagement.actions.errorUpdate'),
            life: 3000
        });
    } finally {
        isLoading.value = false; // Set loading to false after the API call
    }
};

const updateShopStatusWithoutReason = async (status) => {
    if (!selectedShop.value) return;

    isLoading.value = true; // Set loading to true before the API call

    try {
        const userId = selectedShop.value.userId || selectedShop.value.data.userId;

        const resp = await updateStatustShop(userId, status);
        reload.value = true;
        if (resp.status === 200) {
            reload.value = false;
            const shopIndex = shops.value.findIndex((shop) => shop.userId === userId);
            if (shopIndex !== -1) {
                shops.value[shopIndex].shop_status = status;
            }

            await fetchShops();

            toast.add({
                severity: 'success',
                summary: 'Success',
                detail: t('shopmanagement.actions.successUpdate'),
                life: 3000
            });

            selectedShop.value = null;
        } else {
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: t('shopmanagement.actions.errorUpdate'),
                life: 3000
            });
        }
    } catch (err) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: err.message || t('shopmanagement.actions.errorUpdate'),
            life: 3000
        });
    } finally {
        isLoading.value = false; // Set loading to false after the API call
    }
};
const closeDialog = () => {
    selectedShop.value = null;
};

const getStatusBadgeLabel = (rowData) => {
    const status = rowData.shop_status;
    const statusLabels = {
        1: t('shopmanagement.statuses.ready'),
        2: t('shopmanagement.statuses.pending'),
        3: t('shopmanagement.statuses.rejected'),
        4: t('shopmanagement.statuses.locked')
    };
    return statusLabels[status] || '';
};

const getStatusBadgeClass = (rowData) => {
    const status = rowData.shop_status;
    const statusClasses = {
        1: 'success',
        2: 'info',
        3: 'danger',
        4: 'secondary'
    };
    return statusClasses[status] || 'secondary';
};
onMounted(() => {
    searchName.value = route.query.search || '';
    selectedStatus.value = route.query.status || '';

    fetchShops();
});
watch([() => route.query.search, () => route.query.status], () => {
    searchName.value = route.query.search || '';
    selectedStatus.value = route.query.status || '';
    fetchShops();
});
watch(selectedStatus, () => {
    router.push({ query: { search: searchName.value || undefined, status: selectedStatus.value || undefined } });
    fetchShops();
});

onMounted(() => {
    fetchShops();
});
</script>
<template>
    <div class="card">
        <h3 class="w-full text-center text-2xl font-medium">{{ t('shopmanagement.shopManagement') }}</h3>
        <div class="card">
            <div class="flex justify-end mb-4">
                <div class="flex flex-row gap-2 items-center justify-between">
                    <IconField>
                        <InputIcon>
                            <i class="pi pi-search" />
                        </InputIcon>
                        <InputText v-model="searchName" placeholder="Search..." />
                    </IconField>
                </div>
            </div>
            <Tabs :value="selectedStatus" class="no-underline-tabs">
                <TabList>
                    <Tab v-for="status in statuses" :key="status.value" :value="status.value" as="div" class="flex items-center gap-2 no-underline-tab" @click="selectedStatus = status.value">
                        {{ status.label }}
                    </Tab>
                </TabList>
            </Tabs>
            <DataTable
                v-if="shops && shops.length > 0"
                :value="shops"
                :paginator="true"
                :rows="5"
                :rowHover="true"
                responsiveLayout="scroll"
                :totalRecords="totalRecords"
                removable-sort
                :loading="isLoading"
                :currentPageReportTemplate="'Hiển thị từ {first} đến {last} của {totalRecords}'"
                @row-click="openShopDetails"
            >
                <Column sortable sortField="yourSortableProperty" header="STT" style="width: 3%">
                    <template #body="slotProps">
                        {{ (pageIndex - 1) * rowsPerPage + slotProps.index + 1 }}
                    </template>
                </Column>
                <Column :header="t('shopmanagement.placeholders.defaultImage')" style="width: 10%">
                    <template #body="slotProps">
                        <img
                            :src="slotProps.data.profilePicture && slotProps.data.profilePicture !== '' ? slotProps.data.profilePicture : '/demo/images/default/default-image.webp'"
                            :alt="slotProps.data.name || t('shopmanagement.placeholders.defaultImage')"
                            class="shadow-lg"
                            width="40"
                        />
                    </template>
                </Column>

                <Column field="shop_name" :header="t('shopmanagement.labels.shopName')" sortable style="width: 15%"></Column>

                <Column field="name" :header="t('shopmanagement.labels.owner')" sortable style="width: 15%"></Column>
                <Column :header="t('shopmanagement.status')" style="width: 15%">
                    <template #body="slotProps">
                        <Tag :value="getStatusBadgeLabel(slotProps.data)" :severity="getStatusBadgeClass(slotProps.data)" />
                    </template>
                </Column>

                <Column field="time_created_shop" :header="t('shopmanagement.labels.registeredDate')" sortable style="width: 15%"></Column>
            </DataTable>

            <div v-else class="mt-6 w-full text-center p-3">{{ t('shopmanagement.actions.noData') }}</div>
        </div>

        <Dialog v-if="selectedShop" :visible="!!selectedShop" @update:visible="closeDialog" modal :header="t('shopmanagement.actions.updateStatus')" class="custom-shop-dialog" :style="{ width: '50vw' }">
            <div class="bg-white rounded-lg p-6 shadow-md">
                <div class="grid grid-cols-2 gap-6">
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <p class="text-xs text-gray-500 mb-1">{{ t('shopmanagement.labels.shopName') }}</p>
                        <p class="font-bold text-lg text-gray-800">{{ selectedShop.data.shop_name }}</p>
                    </div>
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <p class="text-xs text-gray-500 mb-1">{{ t('shopmanagement.labels.owner') }}</p>
                        <p class="font-bold text-lg text-gray-800">{{ selectedShop.data.name }}</p>
                    </div>
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <p class="text-xs text-gray-500 mb-1">{{ t('shopmanagement.labels.email') }}</p>
                        <p class="text-gray-700">{{ selectedShop.data.email || 'Không có' }}</p>
                    </div>
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <p class="text-xs text-gray-500 mb-1">{{ t('shopmanagement.labels.phone') }}</p>
                        <p class="text-gray-700">{{ selectedShop.data.phone || 'Không có' }}</p>
                    </div>
                    <div class="col-span-2 bg-gray-50 p-4 rounded-lg">
                        <p class="text-xs text-gray-500 mb-1">{{ t('shopmanagement.labels.address') }}</p>
                        <p class="flex text-gray-700">
                            {{ selectedShop.data.shop_address_detail || 'Chưa cập nhật' }}
                            <span class="block ml-1 text-gray-700">
                                <span class="block text-gray-700">
                                    {{ fullAddressRef }}
                                </span>
                            </span>
                        </p>
                    </div>
                    <div class="col-span-2 gap-4 bg-gray-50 p-4 rounded-lg">
                        <p class="text-xs text-gray-500 mb-1">{{ t('shopmanagement.labels.idCard') }}</p>
                        <div class="flex justify-center gap-7 mt-5 px-10">
                            <p class="text-gray-700">
                                <img
                                    :src="selectedShop.data.id_front && selectedShop.data.id_front !== '' ? selectedShop.data.id_front : 'public/demo/images/default/default-image_730.jpg'"
                                    :alt="selectedShop.data.name || t('shopmanagement.placeholders.defaultImage')"
                                    class="shadow-lg max-h-[200px] w-full object-cover"
                                    width="64"
                                />
                            </p>
                            <p>
                                <img
                                    :src="selectedShop.data.id_back && selectedShop.data.id_back !== '' ? selectedShop.data.id_back : 'public/demo/images/default/default-image_730.jpg'"
                                    :alt="selectedShop.data.name || t('shopmanagement.placeholders.defaultImage')"
                                    class="shadow-lg w-full object-cover max-h-[200px]"
                                    width="64"
                                />
                            </p>
                        </div>
                    </div>
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <p class="text-xs text-gray-500 mb-1">{{ t('shopmanagement.labels.registeredDate') }}</p>
                        <p class="text-gray-700">
                            {{ selectedShop.data.time_created_shop }}
                        </p>
                    </div>
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <p class="text-xs text-gray-500 mb-1">{{ t('shopmanagement.status') }}</p>
                        <Tag :value="getStatusBadgeLabel(selectedShop.data)" :severity="getStatusBadgeClass(selectedShop.data)" />
                    </div>
                </div>

                <div class="flex justify-end space-x-3 mt-6">
                    <Button v-if="selectedShop.data.shop_status !== 1" severity="success" @click="() => updateShopStatus(1)" class="px-4 py-2 rounded-md transition-all hover:opacity-80">
                        {{ t('shopmanagement.statuses.ready') }}
                    </Button>
                    <Button
                        v-if="selectedShop.data.shop_status !== 3 && selectedShop.data.shop_status !== 4 && selectedShop.data.shop_status !== 1"
                        severity="danger"
                        @click="() => updateShopStatus(3)"
                        class="px-4 py-2 rounded-md transition-all hover:opacity-80"
                    >
                        {{ t('shopmanagement.statuses.rejected') }}
                    </Button>
                    <Button
                        v-if="selectedShop.data.shop_status !== 4 && selectedShop.data.shop_status !== 3 && selectedShop.data.shop_status !== 2"
                        severity="secondary"
                        @click="() => updateShopStatus(4)"
                        class="px-4 py-2 rounded-md transition-all hover:opacity-80"
                    >
                        {{ t('shopmanagement.statuses.locked') }}
                    </Button>
                </div>
            </div>
        </Dialog>

        <Dialog v-if="isReasonDialogVisible" :visible="isReasonDialogVisible" @update:visible="closeReasonDialog" modal :header="t('shopmanagement.actions.lockShop')" class="custom-shop-dialog" :style="{ width: '50vw' }">
            <div class="p-6">
                <div v-if="isLoading" class="w-full flex justify-center items-center">
                    <ProgressSpinner />
                </div>
                <div v-else>
                    <div class="field">
                        <label for="reason" class="font-medium mr-4">{{ t('shopmanagement.labels.reason') }}</label>
                        <InputText id="reason" v-model="reason" placeholder="Nhập lý do khóa shop" />
                    </div>
                    <div class="flex justify-end mt-4">
                        <Button label="Hủy" icon="pi pi-times" class="p-button-text" @click="closeReasonDialog" />
                        <Button label="Xác nhận" icon="pi pi-check" class="p-button-success" @click="submitReason" />
                    </div>
                </div>
            </div>
        </Dialog>
    </div>
</template>
