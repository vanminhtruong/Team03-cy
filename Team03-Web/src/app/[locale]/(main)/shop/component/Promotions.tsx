import React, { useEffect, useState } from 'react';
import { getPromotionShop } from '@/src/app/[locale]/(main)/shop/service/getPromotionShop';
import { useTranslations } from 'next-intl';

interface Promotion {
    id: number;
    name: string;
    discountPercentage: number;
    endDate: string;
}

interface PromotionsProps {
    idShop: number;
    onSelect: (id: number, name: string, discountPercentage: any) => void;
}

const Promotions: React.FC<PromotionsProps> = ({ idShop, onSelect }) => {
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const t = useTranslations('shopDetail');

    useEffect(() => {
        const fetchDataPromotion = async () => {
            try {
                const res = await getPromotionShop(idShop);
                setPromotions(res.data.data.content);
            } catch (e) {
                console.error('Error fetching promotions:', e);
            }
        };

        fetchDataPromotion();
    }, [idShop]);

    useEffect(() => {
        const timer = setInterval(() => {
            if (promotions.length > 0) {
                setCurrentIndex((prev) => (prev + 1) % promotions.length);
            }
        }, 6000);

        return () => clearInterval(timer);
    }, [promotions.length]);

    const calculateTimeRemaining = (endDate: string): string => {
        const end = new Date(endDate).getTime();
        const now = new Date().getTime();
        const distance = end - now;

        if (distance < 0) return t('ended');

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

        return `${days} ${t('days')} ${hours} ${t('hours')} ${minutes} ${t('minutes')}`;
    };

    const goToSlide = (index: number) => {
        setCurrentIndex(index);
    };

    if (promotions.length === 0) {
        return null;
    }

    return (
        <div className="container max-w-[1280px] mx-auto px-4 py-6">
            <div className="relative">
                <div className="overflow-hidden">
                    <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
                        {promotions.map((promo) => (
                            <div key={promo.id} className="w-full flex-shrink-0 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-lg p-5 shadow-sm h-[150px]">
                                <div className="flex sm:flex-row flex-col justify-between items-center w-full h-full">
                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-center gap-6">
                                            <span className="text-3xl font-semibold">{promo.name}</span>
                                            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm">{t('discount', { percent: promo.discountPercentage })}</span>
                                        </div>
                                        <b className="text-gray-500 text-lg">{t('timeRemaining', { time: calculateTimeRemaining(promo.endDate) })}</b>
                                    </div>
                                    <button onClick={() => onSelect(promo.id, promo.name, promo.discountPercentage)} className="bg-red-500 w-full sm:w-[100px] hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors">
                                        {t('view')}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-center mt-4 gap-2">
                    {promotions.map((_, index) => (
                        <button key={index} onClick={() => goToSlide(index)} className={`w-2 h-2 rounded-full transition-all ${index === currentIndex ? 'bg-red-500 w-4' : 'bg-gray-300'}`} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Promotions;
