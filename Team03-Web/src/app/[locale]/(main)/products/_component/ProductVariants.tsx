import React from 'react';
import { useTranslations } from 'next-intl';

type Variant = {
    option1: { name: string; value: { name: string } };
    option2: { name: string; value: { name: string } };
};

type ProductVariantsListProps = {
    variants: Variant[];
    selectedSize: string;
    selectedColor: string;
    handleSizeClick: (size: string) => void;
    handleColorClick: (color: string) => void;
};

const ProductVariantsList: React.FC<ProductVariantsListProps> = ({ variants, selectedSize, selectedColor, handleSizeClick, handleColorClick }) => {
    const t = useTranslations('productDetail');
    if (!variants.length) return <p>{t('noVariant')}</p>;

    const filteredVariants = variants.filter((variant) => variant.option1?.name !== 'default');


    const sizes = Array.from(new Set(filteredVariants.map((variant) => variant.option1?.value.name).filter(Boolean)));
    const colors = Array.from(new Set(filteredVariants.map((variant) => variant.option2?.value.name).filter(Boolean)));

    return (
        <div>
            <h3 className="text-xl font-bold text-gray-800">{filteredVariants[0]?.option1?.name || ''}</h3>
            <div className="flex flex-wrap gap-4 mt-4">
                {sizes.map((size, index) => (
                    <button
                        key={index}
                        className={`border hover:border-gray-800 font-semibold text-md rounded-md flex items-center justify-center shrink-0 px-4 py-2 ${selectedSize === size ? 'bg-gray-800 text-white' : ''}`}
                        onClick={() => {
                            handleSizeClick(size);
                        }}
                    >
                        {size || 'N/A'}
                    </button>
                ))}
            </div>
            <h3 className="text-xl font-bold text-gray-800">{filteredVariants[0]?.option2?.name || ''}</h3>
            <div className="flex flex-wrap gap-4 mt-4">
                {colors.map((color, index) => (
                    <button
                        key={index}
                        className={`border hover:border-gray-800 font-semibold text-md rounded-md flex items-center justify-center shrink-0 px-4 py-2 ${selectedColor === color ? 'bg-gray-800 text-white' : ''}`}
                        onClick={() => {
                            handleColorClick(color);
                        }}
                    >
                        {color || 'N/A'}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ProductVariantsList;
