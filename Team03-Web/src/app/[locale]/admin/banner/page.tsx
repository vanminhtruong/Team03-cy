'use client';
import React, { useEffect, useState } from 'react';
import { useUserStore } from '../stores/user';
import BannerItem from '@/src/app/[locale]/admin/banner/component/BannerItem';
import { fetchBannersById } from '@/src/app/[locale]/admin/banner/service/CreateBannerPayload';
import { useRouter } from '@/src/i18n/routing';
import { useTranslations } from 'next-intl';

interface Banner {
    id: string;
    image: string;
    createStart: string;
    createEnd: string;
    isActive: number;
}

const BannerList = () => {
    const { id } = useUserStore();
    const [banners, setBanners] = useState<Banner[]>([]);
    const router = useRouter();
    const t = useTranslations('banner');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await fetchBannersById(id);
                setBanners(data);
            } catch (error) {
                console.error('Error loading banners:', error);
            }
        };

        fetchData();
    }, [id]);

    const handleCreateBanner = () => {
        router.push('/admin/banner/create');
    };

    const handleDelete = (id: string) => {
        setBanners((prevBanners) => prevBanners.filter(banner => banner.id !== id));
    };

    return (
        <div>
            <button onClick={handleCreateBanner} className="bg-black text-white p-3 rounded hover:bg-gray-800 w-max-[200px] transition-colors">
                {t('createBanner')}
            </button>

            <div className="grid">
                {banners.map((banner) => (
                    <BannerItem key={banner.id} banner={banner} t={t} onDelete={handleDelete} />
                ))}
            </div>
        </div>
    );
};

export default BannerList;
