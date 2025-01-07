<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import { format, isBefore, isWithinInterval, isAfter } from 'date-fns';
import { useI18n } from 'vue-i18n';
import DatePicker from 'primevue/datepicker';
import Tab from 'primevue/tab';
import Tabs from 'primevue/tabs';
import Tag from 'primevue/tag';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import TabList from 'primevue/tablist';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import { formatDate } from '@/utils/formatDate';
import { getAllPromotion } from '@/views/pages/promotion-management/sevice/getAllPromotion.js';
import { updatePromotion } from '@/views/pages/promotion-management/sevice/updatePromotion.js';
import { deletePromotion } from '@/views/pages/promotion-management/sevice/deletePromotion.js';
import { usePromotion } from '@/stores/usePromotion.js';

const { t } = useI18n();
const toast = useToast();

const promotions = ref([]);
const selectedStatus = ref('ALL');
const editingRows = ref([]);
const deleteDialogVisible = ref(false);
const promotionToDelete = ref(null);
const promotionStore = usePromotion();
const first = ref(0);
const rows = ref(5);

const onPage = (event) => {
    first.value = event.first;
    rows.value = event.rows;
};

const statusOptions = [
    { label: t('promotion.all'), value: 'ALL', severity: 'success' },
    { label: t('promotion.upcoming'), value: 'UPCOMING', severity: 'warn' },
    { label: t('promotion.ongoing'), value: 'ONGOING', severity: 'success' },
    { label: t('promotion.expired'), value: 'EXPIRED', severity: 'danger' }
];

const filteredPromotions = computed(() => {
    if (selectedStatus.value === 'ALL') return promotions.value;
    return promotions.value.filter((item) => item.status === selectedStatus.value);
});

const getPromotionStatus = (startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isBefore(now, start)) return 'UPCOMING';
    if (isWithinInterval(now, { start, end })) return 'ONGOING';
    return 'EXPIRED';
};

const showToast = (severity, detailKey) => {
    toast.add({
        severity,
        summary: severity === 'success' ? t('promotion.success') : t('promotion.error'),
        detail: t(detailKey),
        life: 3000
    });
};

const fetchPromotions = async () => {
    try {
        const res = await getAllPromotion();
        promotions.value = res.data.content.map((promotion) => ({
            ...promotion,
            status: getPromotionStatus(promotion.startDate, promotion.endDate)
        }));
    } catch (error) {
        showToast('error', 'promotion.cannotFetch');
    }
};

const validateFields = (data) => {
    const { startDate, endDate, name, discountPercentage } = data;
    const now = new Date();

    if (!name || !discountPercentage) {
        showToast('error', 'promotion.validation.requiredFields');
        return false;
    }

    if (!isAfter(new Date(startDate), now)) {
        showToast('error', 'promotion.validation.startTimeMin');
        return false;
    }

    if (!isAfter(new Date(endDate), new Date(startDate))) {
        showToast('error', 'promotion.validation.endTimeGreater');
        return false;
    }

    return true;
};

const onRowEditSave = async ({ newData }) => {
    if (!validateFields(newData)) return;

    const formattedData = {
        name: newData.name,
        discountPercentage: newData.discountPercentage,
        startDate: format(new Date(newData.startDate), "yyyy-MM-dd'T'HH:mm:ss"),
        endDate: format(new Date(newData.endDate), "yyyy-MM-dd'T'HH:mm:ss")
    };

    try {
        const response = await updatePromotion(newData.id, formattedData);
        if (response.message === 'Successfully') {
            showToast('success', 'promotion.updateSuccess');
            await fetchPromotions();
        }
    } catch (error) {
        showToast('error', 'promotion.updateError');
    }
};

const handleDelete = (promotion) => {
    promotionToDelete.value = promotion;
    deleteDialogVisible.value = true;
};

const handleDeleteConfirmed = async () => {
    if (!promotionToDelete.value) return;

    try {
        await deletePromotion(promotionToDelete.value.id);
        showToast('success', 'promotion.deleteSuccess');
        await fetchPromotions();
    } catch (error) {
        showToast('error', 'promotion.deleteError');
    } finally {
        deleteDialogVisible.value = false;
        promotionToDelete.value = null;
    }
};

const getStatusLabel = (status) => {
    const statusObj = statusOptions.find((s) => s.value === status);
    return statusObj?.severity || 'info';
};

onMounted(() => {
    fetchPromotions();

    watch(
        () => promotionStore.callBackTablePromotion,
        (newVal) => {
            if (newVal) {
                fetchPromotions();
                promotionStore.setCallBackTablePromotion(false);
            }
        }
    );
});
</script>

<template>
    <div class="text-black">
        <Tabs :value="selectedStatus">
            <TabList class="flex flex-wrap gap-4 mb-4">
                <Tab v-for="status in statusOptions" :key="status.value" :value="status.value" as="div" class="flex items-center gap-2 cursor-pointer text-sm sm:text-base text-black" @click="selectedStatus = status.value">
                    {{ status.label }}
                </Tab>
            </TabList>
        </Tabs>

        <DataTable
            v-model:editingRows="editingRows"
            :value="filteredPromotions"
            editMode="row"
            dataKey="id"
            @row-edit-save="onRowEditSave"
            :rows="rows"
            :first="first"
            :rowsPerPageOptions="[5, 10, 20, 50]"
            :totalRecords="filteredPromotions.length"
            @page="onPage"
            paginator
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
            :pt="{
                table: { style: 'min-width: 50rem' },
                column: {
                    bodycell: ({ state }) => ({
                        style: state['d_editing'] && 'padding-top: 0.75rem; padding-bottom: 0.75rem'
                    })
                }
            }"
            class="text-black"
        >
            <Column :header="t('promotion.index')" style="width: 10%">
                <template #body="{ index }">
                    {{ index + 1 }}
                </template>
            </Column>

            <Column :field="t('promotion.name')" :header="t('promotion.name')" style="width: 10%">
                <template #body="{ data }">
                    {{ data.name || t('promotion.noName') }}
                </template>
                <template #editor="{ data }">
                    <InputText v-model="data.name" :placeholder="t('promotion.enterName')" class="text-black" />
                </template>
            </Column>

            <Column :field="t('promotion.discountPercentage')" :header="t('promotion.percentage')" style="width: 15%">
                <template #body="{ data }"> {{ data.discountPercentage }}%</template>
                <template #editor="{ data }">
                    <InputNumber v-model="data.discountPercentage" :min="0" :max="100" suffix="%" class="text-black" />
                </template>
            </Column>

            <Column :field="t('promotion.startDate')" :header="t('promotion.startDate')" style="width: 20%">
                <template #body="{ data }">
                    {{ formatDate(data.startDate) }}
                </template>
                <template #editor="{ data }">
                    <DatePicker v-model="data.startDate" showTime hourFormat="24" class="text-black" />
                </template>
            </Column>

            <Column :field="t('promotion.endDate')" :header="t('promotion.endDate')" style="width: 20%">
                <template #body="{ data }">
                    {{ formatDate(data.endDate) }}
                </template>
                <template #editor="{ data }">
                    <DatePicker v-model="data.endDate" showTime hourFormat="24" class="text-black" />
                </template>
            </Column>

            <Column :field="t('promotion.status')" :header="t('promotion.status')" style="width: 15%">
                <template #body="{ data }">
                    <Tag class="uppercase text-black" :value="t(data.status.toLowerCase())" :severity="getStatusLabel(data.status)" />
                </template>
            </Column>

            <Column :rowEditor="true" style="width: 10%; min-width: 8rem" bodyStyle="text-align:center" class="text-black" />

            <Column :exportable="false">
                <template #body="{ data }">
                    <Button icon="pi pi-trash" outlined rounded severity="danger" class="ml-2 text-black" @click="handleDelete(data)" />
                </template>
            </Column>
        </DataTable>

        <Dialog v-model:visible="deleteDialogVisible" :header="t('promotion.confirm')" :modal="true" :style="{ width: '450px' }" class="text-black">
            <p>{{ t('promotion.confirmDelete') }}</p>
            <template #footer>
                <Button :label="t('promotion.cancel')" icon="pi pi-times" class="p-button-text text-black" @click="deleteDialogVisible = false" />
                <Button :label="t('promotion.delete')" icon="pi pi-check" class="p-button-danger text-black" @click="handleDeleteConfirmed" />
            </template>
        </Dialog>
    </div>
</template>

<style lang="scss" scoped></style>
