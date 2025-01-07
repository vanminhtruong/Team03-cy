import React from 'react';
import FeedbackList from '@/src/app/[locale]/(main)/products/_component/FeedbackList';
import { useTranslations } from 'next-intl';

const ProductFeedback = ({ feedbacks, maxVisibleMedia, handleFeedbackImageClick }: any) => {
    const t = useTranslations('productDetail');
    return (
        <div className="mt-10">
            <h3 className="text-xl font-bold text-gray-800">{t('productReviews')}</h3>
            <div className="mt-4">
                <FeedbackList feedbacks={feedbacks} maxVisibleMedia={maxVisibleMedia} handleFeedbackImageClick={handleFeedbackImageClick} />
            </div>
        </div>
    );
};

export default ProductFeedback;
