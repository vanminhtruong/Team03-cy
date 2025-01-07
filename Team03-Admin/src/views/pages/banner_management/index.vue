<template>
    <div class="font-semibold flex justify-center text-2xl">Manager Banner</div>
    <div class="banner-container">
        <div v-if="activeBanners.length > 0">
            <h2>Active Banners</h2>
            <div v-for="banner in activeBanners" :key="banner.id" class="banner-item">
                <Image :src="banner.image" alt="Banner Image" class="banner-image" width="150" height="150" preview />
                <div class="banner-info">
                    <p><strong>Start Date:</strong> {{ formatDate(banner.createStart) }}</p>
                    <p><strong>End Date:</strong> {{ formatDate(banner.createEnd) }}</p>
                    <p>Status: {{ getBannerStatus(banner) }}</p>
                    <Button @click="confirmDelete(banner)" label="Delete" class="p-button-danger" />
                </div>
            </div>
        </div>

        <div class="flex items-center justify-center" v-else>
            <img src="/demo/images/default/product_not_found.png" alt="Banner Image" class="max-w-[455px] w-full" />
        </div>

        <div v-if="inactiveBanners.length > 0">
            <h1>Inactive Banners</h1>
            <div v-for="banner in inactiveBanners" :key="banner.id" class="banner-item">
                <Image :src="banner.image" alt="Banner Image" class="banner-image" width="150" height="150" preview />

                <div class="banner-info">
                    <p><strong>Start Date:</strong> {{ formatDate(banner.createStart) }}</p>
                    <p><strong>End Date:</strong> {{ formatDate(banner.createEnd) }}</p>
                    <p>Status: {{ getBannerStatus(banner) }}</p>
                    <Button @click="confirmActivate(banner)" label="Activate" :disabled="isActivateButtonDisabled(banner)" />
                    <Button @click="confirmDelete(banner)" label="Delete" class="p-button-danger" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { formatDate } from '@/utils/formatDate.js';
import { fetchBanners, activateBanner as activateBannerService, deleteBanner as deleteBannerService } from '@/views/pages/banner_management/serivce/bannerService.js';
import { useConfirm } from 'primevue/useconfirm';
import Button from 'primevue/button';

const activeBanners = ref([]);
const inactiveBanners = ref([]);

const fetchBannersData = async () => {
    try {
        const banners = await fetchBanners();
        activeBanners.value = banners.filter((banner) => banner.isActive === 1);
        inactiveBanners.value = banners.filter((banner) => banner.isActive === 0 || banner.isActive === 2); // includes isActive 2 banners
    } catch (error) {
        console.error('Error fetching banners:', error);
    }
};

const confirm = useConfirm();

const confirmActivate = (banner) => {
    confirm.require({
        message: 'Are you sure you want to activate this banner?',
        header: 'Activate Banner',
        icon: 'pi pi-exclamation-triangle',
        accept: () => activateBanner(banner),
        reject: () => console.log('Activation rejected')
    });
};

const confirmDelete = (banner) => {
    confirm.require({
        message: 'Are you sure you want to delete this banner?',
        header: 'Delete Banner',
        icon: 'pi pi-exclamation-triangle',
        accept: () => deleteBanner(banner),
        reject: () => console.log('Deletion rejected')
    });
};

const activateBanner = async (banner) => {
    try {
        if (!banner || !banner.id) {
            console.error('Banner ID is missing');
            return;
        }
        await activateBannerService(banner.id);
        await fetchBannersData();
    } catch (error) {
        console.error('Error activating banner:', error);
    }
};

const deleteBanner = async (banner) => {
    try {
        if (!banner || !banner.id) {
            console.error('Banner ID is missing');
            return;
        }
        await deleteBannerService(banner.id);
        await fetchBannersData();
    } catch (error) {
        console.error('Error deleting banner:', error);
    }
};

const getBannerStatus = (banner) => {
    const now = new Date();
    const startDate = new Date(banner.createStart);
    const endDate = new Date(banner.createEnd);

    if (now < startDate) {
        return 'Chưa bắt đầu';
    } else if (now >= startDate && now <= endDate) {
        return 'Đang diễn ra';
    } else {
        return 'Đã hết hạn';
    }
};

const isActivateButtonDisabled = (banner) => {
    return banner.isActive === 2;
};

onMounted(fetchBannersData);
</script>

<style scoped>
.banner-container {
    display: flex;
    flex-direction: column;
    gap: 40px;
}

.banner-item {
    display: flex;
    border: 1px solid #ddd;
    padding: 10px;
    border-radius: 8px;
    background-color: #f9f9f9;
}

.banner-image {
    max-width: 150px;
    max-height: 150px;
    margin-right: 20px;
}

.banner-info {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}
</style>
