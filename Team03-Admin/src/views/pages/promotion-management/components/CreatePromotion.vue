<script setup>
import { ref, computed } from 'vue';
import { format, addMinutes } from 'date-fns';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import DatePicker from 'primevue/datepicker';
import Toast from 'primevue/toast';
import { useI18n } from 'vue-i18n';
import { usePromotion } from '@/stores/usePromotion.js';
import { addPromotion } from '@/views/pages/promotion-management/sevice/addPromotion.js';

const { t } = useI18n();
const promotionStore = usePromotion();

const form = ref({
    name: '',
    discountPercentage: 0,
    startDate: null,
    endDate: null
});

const toast = ref(null);

const minStartDate = computed(() => {
    return addMinutes(new Date(), 3);
});

const isFormValid = computed(() => {
    return form.value.name && form.value.discountPercentage > 0 && form.value.startDate && form.value.endDate;
});

const showToast = (severity, detail) => {
    toast.value.add({
        severity,
        summary: t(severity),
        detail: t(detail),
        life: 3000
    });
};

const validateDates = () => {
    const startDate = new Date(form.value.startDate);
    const endDate = new Date(form.value.endDate);

    if (startDate < minStartDate.value) {
        showToast('error', 'promotion.validation.startTimeMin');
        return false;
    }

    if (endDate <= startDate) {
        showToast('error', 'promotion.validation.endTimeGreater');
        return false;
    }

    return true;
};

const formatDate = (date) => {
    return format(new Date(date), "yyyy-MM-dd'T'HH:mm");
};

const resetForm = () => {
    form.value = {
        name: '',
        discountPercentage: 0,
        startDate: null,
        endDate: null
    };
};

const handleSubmit = async () => {
    if (!isFormValid.value) {
        showToast('error', 'promotion.validation.requiredFields');
        return;
    }

    if (!validateDates()) {
        return;
    }

    const promotionData = {
        name: form.value.name,
        discountPercentage: form.value.discountPercentage,
        startDate: formatDate(form.value.startDate),
        endDate: formatDate(form.value.endDate)
    };

    try {
        await addPromotion(promotionData);
        promotionStore.setCallBackTablePromotion(!promotionStore.callBackTablePromotion);
        showToast('success', 'promotion.addSuccess');
        resetForm();
    } catch (error) {
        console.error('Error adding promotion:', error);
        showToast('error', 'promotion.addError');
    }
};
</script>

<template>
    <div class="w-full mx-auto">
        <h4 class="mt-8 text-2xl font-[600] text-center">
            {{ t('promotion.management') }}
        </h4>
        <div>
            <h2 class="text-xl font-semibold text-gray-700 mb-6">
                {{ t('promotion.setup') }}
            </h2>

            <form @submit.prevent="handleSubmit" class="space-y-6">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <label for="promotion-name" class="block text-sm font-medium text-gray-700 mb-2">
                            {{ t('promotion.name') }}
                        </label>
                        <InputText id="promotion-name" v-model="form.name" :placeholder="t('promotion.enterName')" class="w-full rounded-lg focus:outline-none focus:ring focus:ring-indigo-200" />
                    </div>
                    <div>
                        <label for="discount-percentage" class="block text-sm font-medium text-gray-700 mb-2">
                            {{ t('promotion.discountPercentage') }}
                        </label>
                        <InputNumber id="discount-percentage" v-model="form.discountPercentage" suffix="%" class="w-full rounded-lg focus:outline-none focus:ring focus:ring-indigo-200" />
                    </div>
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        {{ t('promotion.duration') }}
                    </label>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <DatePicker
                            id="start-date"
                            v-model="form.startDate"
                            :minDate="minStartDate"
                            showTime
                            hourFormat="24"
                            :placeholder="t('promotion.startTime')"
                            dateFormat="dd/mm/yy"
                            class="w-full rounded-lg focus:outline-none focus:ring focus:ring-indigo-200"
                        />

                        <DatePicker
                            id="end-date"
                            v-model="form.endDate"
                            :minDate="form.startDate"
                            showTime
                            hourFormat="24"
                            :placeholder="t('promotion.endTime')"
                            dateFormat="dd/mm/yy"
                            class="w-full rounded-lg focus:outline-none focus:ring focus:ring-indigo-200"
                        />
                    </div>
                </div>

                <div class="text-right">
                    <Button type="submit" class="w-full sm:w-auto px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring focus:ring-indigo-300">
                        {{ t('promotion.saveSetup') }}
                    </Button>
                </div>
            </form>
        </div>
    </div>

    <Toast ref="toast" position="top-right" />
</template>
