import React, { useState } from 'react';
import { useTranslations } from 'next-intl';

const ProductDescription = ({ description }: any) => {
    const [showFullDescription, setShowFullDescription] = useState(false);
    const t = useTranslations('productDetail');
    const formatDescription = (description = '') => {
        return description.replaceAll(/(\r\n|\n)/g, '<br />');
    };

    return (
        <div>
            <h3 className="text-xl font-bold text-gray-800">{t('descriptionProduct')}</h3>
            <p className={`text-md font-[500] text-gray-800 mt-4 ${showFullDescription ? '' : 'line-clamp-5'}`} dangerouslySetInnerHTML={{ __html: formatDescription(description) }} />
            {description?.length > 300 && (
                <button className="mt-2 text-blue-700 hover:underline text-md font-semibold" onClick={() => setShowFullDescription(!showFullDescription)}>
                    {showFullDescription ? t('hideLess') : t('readMore')}
                </button>
            )}
        </div>
    );
};

export default ProductDescription;
