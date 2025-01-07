<template>
    <div class="modal-overlay">
        <div class="modal-content" @click.stop>
            <div class="header">
                <h2 class="title">{{ product.productName }}</h2>
                <Button icon="pi pi-times" class="p-button-rounded p-button-text" @click="close" />
            </div>
            <div class="content-grid">
                <div class="image-section">
                    <img :src="product.image" alt="Product Image" class="product-image" />
                </div>
                <div class="details-section">
                    <div class="detail-item">
                        <span class="label">{{ t('orderapproval.name') }}:</span>
                        <span class="value">{{ product.shopDto.shopName }}</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">{{ t('orderapproval.category') }}:</span>
                        <span class="value">
                            <img :src="product.category.image || 'https://via.placeholder.com/100x70'" alt="Category Image" class="category-image" />
                            {{ product.category.categoryName }}
                        </span>
                    </div>
                    <div class="detail-item">
                        <span class="label">{{ t('orderapproval.price') }}:</span>
                        <template v-if="product.oldPrice !== product.newPrice">
                            <span class="value old-price">{{ formatPrice(product.oldPrice) }}</span>
                            <span class="value price">{{ formatPrice(product.newPrice) }}</span>
                        </template>
                        <template v-else>
                            <span class="value price">{{ formatPrice(product.newPrice) }}</span>
                        </template>
                    </div>
                    <div class="detail-item">
                        <span class="label">{{ t('orderapproval.rating') }}:</span>
                        <div class="value stats-container">
                            <div class="stat-item" :title="t('orderapproval.rating')">
                                <span>{{ product.rating || 0 }}</span>
                                <i class="pi pi-star-fill star-icon" />
                            </div>
                            <div class="divider"></div>
                            <div class="stat-item" :title="t('orderapproval.numberOfLike')">
                                <span>{{ product.numberOfLike }}</span>
                                <i class="pi pi-heart-fill like-icon" />
                            </div>
                            <div class="divider"></div>
                            <div class="stat-item" :title="t('orderapproval.numberOfFeedback')">
                                <span>{{ product.numberOfFeedBack }}</span>
                                <i class="pi pi-comments feedback-icon !text-[#333333]" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="footer">
                <div class="status-buttons" v-if="currentTab !== undefined">
                    <Button v-if="currentTab !== 0" severity="info" @click="updateStatus(0)" class="p-button-sm">
                        {{ t('orderapproval.pending') }}
                    </Button>
                    <Button v-if="currentTab !== 1" severity="success" @click="updateStatus(1)" class="p-button-sm">
                        {{ t('orderapproval.approved') }}
                    </Button>
                    <Button v-if="currentTab !== 2" severity="danger" @click="updateStatus(2)" class="p-button-sm">
                        {{ t('orderapproval.rejected') }}
                    </Button>
                </div>
            </div>

            <!-- eslint-disable-next-line vue/no-v-model-argument -->
            <Dialog v-model:visible="showNoteDialog" :header="t('orderapproval.noteDialog.header')" :modal="true" @hide="handleDialogHide">
                <div class="p-fluid">
                    <div class="field block">
                        <Textarea v-model="noteText" rows="3" :placeholder="t('orderapproval.noteDialog.placeholder')" />
                    </div>
                </div>
                <template #footer>
                    <Button :label="t('orderapproval.noteDialog.cancel')" icon="pi pi-times" text @click="closeNoteDialog" />
                    <Button :label="t('orderapproval.noteDialog.submit')" icon="pi pi-check" autofocus @click="submitWithNote" />
                </template>
            </Dialog>
        </div>
    </div>
</template>

<script setup>
import { defineProps, defineEmits, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import Dialog from 'primevue/dialog';
import Textarea from 'primevue/textarea';
import OrderApprovalService from '../../services/OrderApprovalService';

const { t } = useI18n();
const props = defineProps({
    product: Object,
    currentTab: {
        type: Number,
        required: true
    }
});

const emit = defineEmits(['close', 'status-updated']);

const showNoteDialog = ref(false);
const noteText = ref('');
const pendingStatus = ref(null);

const close = () => {
    emit('close');
};

const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

const updateStatus = async (status) => {
    if (status === 2) {
        pendingStatus.value = status;
        showNoteDialog.value = true;
    } else {
        try {
            await OrderApprovalService.activateProduct(props.product.productId, status);
            emit('status-updated');
            close();
        } catch (error) {
            console.error('Error updating product status:', error);
        }
    }
};

const handleDialogHide = () => {
    noteText.value = '';
    pendingStatus.value = null;
    showNoteDialog.value = false;
};

const closeNoteDialog = () => {
    handleDialogHide();
};

const submitWithNote = async () => {
    try {
        await OrderApprovalService.activateProduct(props.product.productId, pendingStatus.value, noteText.value);
        emit('status-updated');
        close();
    } catch (error) {
        console.error('Error updating product status:', error);
    } finally {
        handleDialogHide();
    }
};

const getStatusText = (status) => {
    switch (status) {
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
    switch (status) {
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
</script>

<style scoped>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-content {
    background: var(--surface-card);
    padding: 0;
    border-radius: 12px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
    max-width: 800px;
    width: 100%;
    overflow: hidden;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid var(--surface-border);
    background-color: var(--surface-section);
}

.title {
    margin: 0;
    font-size: 1.5rem;
    color: var(--text-color);
    font-weight: 600;
}

.content-grid {
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: 2rem;
    padding: 1.5rem;
}

.image-section {
    width: 100%;
}

.product-image {
    width: 100%;
    height: 300px;
    object-fit: cover;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.details-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.detail-item {
    display: flex;
    align-items: center;
    padding: 0.75rem;
    background-color: var(--surface-hover);
    border-radius: 8px;
}

.label {
    font-weight: 600;
    color: var(--text-secondary-color);
    width: 100px;
}

.value {
    color: var(--text-color);
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.price {
    font-size: 1.2rem;
    color: var(--text-color);
    font-weight: 600;
}

.old-price {
    text-decoration: line-through;
    color: var(--text-secondary-color);
    margin-right: 8px;
    font-size: 1rem;
}

.star-icon {
    color: #fbbf24;
}

.like-icon {
    color: #ef4444;
}

.feedback-icon {
    color: #3b82f6;
}

.category-image {
    width: 40px;
    height: 40px;
    border-radius: 4px;
    object-fit: cover;
    margin-right: 8px;
}

.footer {
    padding: 1rem 1.5rem;
    border-top: 1px solid var(--surface-border);
    background-color: var(--surface-section);
}

.status-buttons {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
}

.stats-container {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.stat-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.divider {
    width: 1px;
    height: 20px;
    background-color: var(--surface-border);
}
</style>
