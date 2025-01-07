import React from 'react';
import { useRouter } from '@/src/i18n/routing';
import { ProductRelative } from '@/src/interface/product.interface';
import { useTranslations } from 'next-intl';


interface RelatedProductsProps {
    relatedProducts: ProductRelative[];
    handleNext: () => void;
    handlePrevious: () => void;
    currentPage: number;
    itemsPerPage: number;
    formatCurrency: (value: number | undefined) => string;
}

const RelatedProducts: React.FC<RelatedProductsProps> = ({ relatedProducts, handleNext, handlePrevious, currentPage, itemsPerPage, formatCurrency }) => {
    const router = useRouter();
    const startIdx = currentPage * itemsPerPage;
    const paginatedProducts = relatedProducts.slice(startIdx, startIdx + itemsPerPage);
    const t = useTranslations('productDetail');
    return (
        <div className="mt-20 max-w-2xl flex-[0.3]">
            <h4 className="text-xl font-bold text-gray-800">{t('related')}</h4>
            <div className="relative">
                <button onClick={handlePrevious} disabled={currentPage === 0} className="absolute left-[-50px] top-1/2 transform -translate-y-1/2 px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed">
                    <span className="pi pi-angle-left text-3xl font-bold"></span>
                </button>
                <div className="grid grid-cols-2 gap-6 mt-6">
                    {paginatedProducts.length === 0 ? (
                        <p className="text-gray-500">{t('noRelatedProductsFound')}</p>
                    ) : (
                        paginatedProducts.map((product) => (
                            <div key={product.productId} className="cursor-pointer border rounded-md p-4 shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out" onClick={() => router.push(`/products/${product.productId}`)}>
                                <img src={product.image} alt={product.productName} className="w-full h-40 object-cover rounded-md mb-4 transition-transform duration-300 ease-in-out hover:scale-105" />
                                <h5 className="text-lg font-semibold text-gray-800 mt-2 line-clamp-1">{product.productName}</h5>
                                <div className="mt-2">
                                    <span className="text-md text-red-600 font-bold">{formatCurrency(product.newPrice)}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                <button onClick={handleNext} disabled={startIdx + itemsPerPage >= relatedProducts.length} className="absolute right-[-50px] top-1/2 transform -translate-y-1/2 px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed">
                    <span className="pi pi-angle-right text-3xl font-bold"></span>
                </button>
            </div>
        </div>
    );
};

export default RelatedProducts;
