import React, { useState, useEffect } from 'react';
import { POST } from '@/src/config/ApiService';
import { createFavourite } from '@/src/app/[locale]/(main)/products/service/serviceProduct';
import { useTranslations } from 'next-intl';

const ProductLikeButton = ({ productId, initialLikes, initialIsFavorite }: any) => {
    const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
    const [likeCount, setLikeCount] = useState(initialLikes);
    const [userId, setUserId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const t = useTranslations('productDetail')

    useEffect(() => {
        const storedUserData = localStorage.getItem('user');
        if (storedUserData) {
            const parsedData = JSON.parse(storedUserData);
            if (parsedData && parsedData.state && parsedData.state.id) {
                setUserId(parsedData.state.id);
            }
        }
    }, []);

    const handleLikeClick = async () => {
        if (!userId) {
            return;
        }

        setIsLoading(true);

        setTimeout(async () => {
            try {
                const response = await createFavourite(userId, productId);
                if (response.status === 200) {
                    setIsFavorite((prev: any) => !prev);
                    setLikeCount((prev: any) => (isFavorite ? prev - 1 : prev + 1));
                }
            } catch (error) {
                console.error('Error updating favorite status:', error);
            } finally {
                setIsLoading(false);
            }
        }, 1000);
    };

    return (
        <button onClick={handleLikeClick} className={`px-2.5 py-1.5 text-xs rounded-md flex items-center ${isFavorite ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`} disabled={isLoading}>
            {isLoading ? t('loading') : `${likeCount} ❤️`}
        </button>
    );
};

export default ProductLikeButton;
