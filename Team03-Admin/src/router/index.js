import AppLayout from '@/layout/AppLayout.vue';
import { createRouter, createWebHistory } from 'vue-router';
import auth from '@/middleware/auth';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            component: AppLayout,
            beforeEnter: auth,
            children: [
                {
                    path: '/',
                    name: 'dashboard',
                    component: () => import('@/views/Dashboard.vue')
                },
                {
                    path: '/order-approval',
                    name: 'order-approval',
                    component: () => import('@/views/pages/order-approval/order-approval.vue')
                },
                {
                    path: '/category',
                    name: 'category',
                    component: () => import('@/views/pages/category/index.vue')
                },
                {
                    path: '/user',
                    name: 'user_manager',
                    component: () => import('@/views/pages/user-manager/index.vue')
                },
                {
                    path: '/user/:id',
                    name: 'user_detail',
                    component: () => import('@/views/pages/user-manager/components/UserDetail.vue')
                },
                {
                    path: '/shop-management',
                    name: 'shop-management',
                    component: () => import('@/views/pages/shop-management/index.vue')
                },
                {
                    path: '/promotion-management',
                    name: 'promotion-management',
                    component: () => import('@/views/pages/promotion-management/index.vue')
                },
                {
                    path: '/banner_management',
                    name: 'banner_management',
                    component: () => import('@/views/pages/banner_management/index.vue')
                }
            ]
        },

        {
            path: '/login',
            name: 'login',
            component: () => import('@/views/pages/auth/Login.vue')
        }
    ]
});

export default router;
