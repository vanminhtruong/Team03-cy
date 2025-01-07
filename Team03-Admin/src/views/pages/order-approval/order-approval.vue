<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import { useRouter, useRoute } from 'vue-router';
import OrderApprovalService from './services/OrderApprovalService';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import Tag from 'primevue/tag';
import InputText from 'primevue/inputtext';
import { formatToVND } from '@/utils/currencyFormatter';
import ProductDetail from './components/features/ProductDetail.vue';

const toast = useToast();
const { t } = useI18n();
const router = useRouter();
const route = useRoute();

const tableData = ref([]);
const loading = ref(false);
const activeTabIndex = ref(parseInt(route.query.tab) || 0);
const totalRecords = ref(0);
const currentPage = ref(0);
const first = ref(0);
const pageSize = ref(PAGE_SIZE);
const showNoteDialog = ref(false);
const noteText = ref('');
const selectedProduct = ref(null);
const showProductDetail = ref(false);
const selectedProductDetail = ref(null);
const searchTerm = ref(route.query.search || '');

// Constants
const PAGE_SIZE = 4;
const TABLE_MIN_WIDTH = '1200px';

const STATUS_SEVERITY = {
    0: 'warning',
    1: 'success',
    2: 'danger'
};

const STATUS_TEXT = {
    0: 'orderapproval.pending',
    1: 'orderapproval.approved',
    2: 'orderapproval.rejected'
};

// Computed
const tabHeaders = computed(() => [
    { label: t('orderapproval.pending'), status: 0 },
    { label: t('orderapproval.approved'), status: 1 },
    { label: t('orderapproval.rejected'), status: 2 }
]);

const filteredTableData = computed(() => {
    if (!searchTerm.value) {
        return tableData.value;
    }
    const filtered = tableData.value.filter((item) => item.productName?.toLowerCase().includes(searchTerm.value.toLowerCase()));
    return filtered.length > 0 ? filtered : [];
});

const fetchProducts = async (page = 0) => {
    try {
        loading.value = true;
        const response = await OrderApprovalService.getAllProductNotConfirmed(activeTabIndex.value, page, pageSize.value);
        const responseData = response?.data;

        if (responseData) {
            tableData.value = responseData.content || [];
            if (responseData.page) {
                totalRecords.value = responseData.page.totalElements || 0;
                currentPage.value = responseData.page.number || 0;
            }
        } else {
            tableData.value = [];
            totalRecords.value = 0;
        }
    } catch (error) {
        console.error('Error fetching products:', error);
        tableData.value = [];
        totalRecords.value = 0;
    } finally {
        loading.value = false;
    }
};

const onPage = (event) => {
    first.value = event.first;
    pageSize.value = event.rows;
    fetchProducts(event.page);
};

const onTabChange = (event) => {
    activeTabIndex.value = event.index;
    first.value = 0;
    router.replace({
        query: {
            ...route.query,
            tab: event.index
        }
    });
    fetchProducts();
};

const formatPrice = (price) => {
    return formatToVND(price);
};

const getStatusText = (status) => {
    switch (activeTabIndex.value) {
        case 0:
            return t('orderapproval.pending');
        case 1:
            return t('orderapproval.approved');
        case 2:
            return t('orderapproval.rejected');
        default:
            return t('orderapproval.unknown');
    }
};

const getStatusSeverity = (status) => {
    switch (activeTabIndex.value) {
        case 0:
            return 'info';
        case 1:
            return 'success';
        case 2:
            return 'danger';
        default:
            return 'info';
    }
};

const getDefaultStatus = () => {
    switch (tabHeaders.value[activeTabIndex.value].label) {
        case t('orderapproval.pending'):
            return 'PENDING';
        case t('orderapproval.approved'):
            return 'APPROVED';
        case t('orderapproval.rejected'):
            return 'REJECTED';
        default:
            return 'PENDING';
    }
};

const closeNoteDialog = () => {
    showNoteDialog.value = false;
    noteText.value = '';
    selectedProduct.value = null;
};

const submitWithNote = async (product) => {
    try {
        await OrderApprovalService.activateProduct(product.id, product.isActive, noteText.value);
        closeNoteDialog();
        fetchProducts();
        toast.add({
            severity: 'success',
            summary: t('orderapproval.messages.approveSuccess'),
            life: 3000
        });
    } catch (error) {
        console.error('Error submitting note:', error);
        toast.add({
            severity: 'error',
            summary: t('orderapproval.messages.approveError'),
            life: 3000
        });
    }
};

const onRowSelect = (event) => {
    if (!event.originalEvent.target.closest('.flex.justify-content-center')) {
        selectedProductDetail.value = event.data;
        showProductDetail.value = true;
    }
};

const viewProductDetail = (product) => {
    console.log('Product clicked:', product);
    selectedProductDetail.value = product;
    showProductDetail.value = true;
};

const methods = {
    getDefaultStatus(currentStatus) {
        switch (currentStatus) {
            case 'pending':
                return 'pending';
            case 'approved':
                return 'approved';
            case 'rejected':
                return 'rejected';
            default:
                return '';
        }
    }
};

const truncateText = (text) => {
    if (!text) return '';
    const maxLength = text.length;
    const truncateLength = Math.floor(maxLength * 0.7);
    if (maxLength > truncateLength) {
        return text.substring(0, truncateLength) + '...';
    }
    return text;
};

// Watch for searchTerm changes to update URL
watch(searchTerm, (newValue) => {
    router.replace({
        query: {
            ...route.query,
            search: newValue || undefined
        }
    });
});

onMounted(() => {
    if (route.query.search) {
        searchTerm.value = route.query.search;
    }
    if (route.query.tab) {
        activeTabIndex.value = parseInt(route.query.tab);
    }
    fetchProducts();
});
</script>

<template>
    <div class="card">
        <h3 class="w-full text-center text-2xl font-medium">{{ $t('orderapproval.title') }}</h3>
        <div class="order-approval">
            <div class="toolbar pt-[20px]">
                <div class="flex w-full">
                    <div class="ml-auto flex items-center">
                        <!-- <span class="font-semibold text-lg">Tìm kiếm:</span> -->
                        <InputText v-model="searchTerm" :placeholder="$t('orderapproval.search')" style="width: 300px" />
                    </div>
                </div>
            </div>
            <TabView :activeIndex="activeTabIndex" @tab-change="onTabChange">
                <TabPanel v-for="tab in tabHeaders" :key="tab.status" :header="tab.label">
                    <DataTable
                        v-model="first"
                        :value="filteredTableData"
                        :paginator="true"
                        :rows="PAGE_SIZE"
                        :loading="loading"
                        :totalRecords="totalRecords"
                        dataKey="productId"
                        striped-rows
                        removable-sort
                        :lazy="true"
                        :rowsPerPageOptions="[4, 8, 12]"
                        paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
                        :rows-per-page-options="[4, 8, 12]"
                        responsive-layout="stack"
                        class="p-datatable-sm"
                        @page="onPage"
                        @row-click="onRowSelect($event)"
                    >
                        <Column field="no" :header="'No.'" sortable style="width: 80px; text-align: left; transform: translateX(20px)">
                            <template #body="{ index }">
                                {{ first + index + 1 }}
                            </template>
                        </Column>

                        <Column field="productName" :header="$t('orderapproval.name')" sortable filter filterPlaceholder="Search by Name" style="width: 200px; cursor: pointer">
                            <template #body="{ data }">
                                <div class="font-medium" :title="data.productName">{{ truncateText(data.productName) }}</div>
                            </template>
                        </Column>

                        <Column field="image" :header="$t('orderapproval.image')" sortable style="width: 150px; cursor: pointer; transform: translateX(50px)">
                            <template #body="{ data }">
                                <div style="width: 70%; height: 70%; overflow: hidden; padding: 6px">
                                    <img :src="data.image || 'https://via.placeholder.com/100x70'" style="width: 50%; height: 50%; object-fit: cover" alt="Category Image" />
                                </div>
                            </template>
                        </Column>

                        <Column field="price" :header="$t('orderapproval.price')" sortable style="width: 150px; text-align: left; cursor: pointer; transform: translateX(50px)">
                            <template #body="{ data }">
                                <div class="font-medium pr-2">
                                    <template v-if="data.oldPrice !== data.newPrice">
                                        <del class="old-price">{{ formatPrice(data.oldPrice) }}</del>
                                        <span class="new-price text-black font-bold ml-1">{{ formatPrice(data.newPrice) }}</span>
                                    </template>
                                    <template v-else>
                                        <span class="new-price">{{ formatPrice(data.newPrice) }}</span>
                                    </template>
                                </div>
                            </template>
                        </Column>

                        <Column field="status" :header="$t('orderapproval.isActive')" sortable style="width: 120px; text-align: center; transform: translateX(30px)">
                            <template #body="{ data }">
                                <div class="flex justify-content-center">
                                    <Tag :value="getStatusText(data.status)" :severity="getStatusSeverity(data.status)" class="text-sm py-1" />
                                </div>
                            </template>
                        </Column>

                        <Column field="note" v-if="activeTabIndex === 2" :header="$t('orderapproval.note')" sortable style="width: 150px; text-align: center; cursor: pointer">
                            <template #body="{ data }">
                                <div class="text-left font-medium">{{ data.note }}</div>
                            </template>
                        </Column>
                    </DataTable>
                </TabPanel>
            </TabView>
        </div>
        <div>
            <div v-if="showProductDetail">
                <ProductDetail :product="selectedProductDetail" :current-tab="activeTabIndex" @close="showProductDetail = false" @status-updated="fetchProducts" />
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
:deep(.p-datatable) {
    width: 100%;
    margin: 0;
    padding: 0;

    .p-datatable-tbody {
        tr {
            background: var(--surface-card);
            color: var(--text-color);
            border-bottom: 1px solid var(--surface-border);

            &:nth-child(even) {
                background: var(--surface-hover);
            }

            td {
                color: var(--text-color);
                border: none;
                border-bottom: 1px solid var(--surface-border);
            }
        }
    }

    .p-datatable-header {
        background: var(--surface-section);
        color: var(--text-color);
        border: none;
    }

    .p-datatable-thead {
        tr {
            th {
                background: var(--surface-section);
                color: var(--text-color);
                border: none;
                border-bottom: 2px solid var(--surface-border);
            }
        }
    }

    .p-datatable-wrapper {
        border: none;
    }

    table {
        border-collapse: collapse;
        width: 100%;
    }
}

.order-approval {
    background: var(--surface-card);
    color: var(--text-color);
    padding: 1rem;
    border-radius: 12px;

    .toolbar {
        h4 {
            color: var(--text-color);
        }
    }

    :deep(.p-tabview) {
        .p-tabview-panels {
            padding: 0;
        }

        .p-tabview-panel {
            padding: 1.25rem 0;
        }
    }
}
</style>
