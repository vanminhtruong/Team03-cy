<!-- eslint-disable prettier/prettier -->
<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import AppMenuItem from './AppMenuItem.vue';

const { t } = useI18n();

const model = computed(() => [
    {
        label: t('layout.home'),
        items: [{ label: t('layout.dashboard'), icon: 'pi pi-fw pi-home', to: '/' }]
    },
    {
        label: t('layout.product'),
        icon: 'pi pi-fw pi-briefcase',
        to: '/pages',
        items: [
            {
                label: t('layout.orderApproval'),
                icon: 'pi pi-fw pi-check-circle',
                to: '/order-approval'
            }
        ]
    },
    {
        label: t('layout.promotionManagement'),
        items: [
            {
                label: t('layout.promotion'),
                icon: 'pi pi-fw pi-bookmark',
                to: '/promotion-management'
            }
        ]
    },

    {
        label: t('layout.management'),
        items: [
            {
                label: t('layout.banner_manager'),
                icon: 'pi pi-fw pi-image',
                to: '/banner_management'
            },
            {
                label: t('layout.user_manager'),
                icon: 'pi pi-fw pi-users',
                to: '/user'
            },
            {
                label: t('layout.shop_manager'),
                icon: 'pi pi-fw pi-shopping-bag',
                to: '/shop-management'
            },
            {
                label: t('layout.category'),
                icon: 'pi pi-fw pi-bookmark',
                to: '/category'
            }
        ]
    }
]);
</script>

<template>
    <ul class="layout-menu">
        <template v-for="(item, i) in model" :key="i">
            <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
            <li v-if="item.separator" class="menu-separator"></li>
        </template>
    </ul>
</template>

<style lang="scss" scoped></style>
