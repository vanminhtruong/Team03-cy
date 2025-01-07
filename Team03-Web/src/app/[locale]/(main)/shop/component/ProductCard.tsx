import React from 'react';
import { useRouter } from '@/src/i18n/routing';
import formatMoney from '@/src/utils/formatMoney';
import { Rating } from 'primereact/rating';
import { useTranslations } from 'next-intl';

interface Product {
    productId: number;
    productName: string;
    image: string;
    oldPrice: number;
    newPrice: number;
    category: {
        categoryId: number;
        categoryName: string;
    };
    sold: number;
    numberOfFeedBack: number;
    numberOfLike: number;
    rating: number;
    inventoryStatus?: string;
}

export default function ProductCard({ product }: { product: Product }) {
    const router = useRouter();
    const t = useTranslations('shopDetail');

    const handleProductClick = (id: number) => {
        router.push(`/products/${id}`);
    };

    return (
        <div
            onClick={() => handleProductClick(product.productId)}
            className="relative border flex flex-col justify-between rounded-lg shadow-md p-4
              w-full sm:w-[200px] md:w-[220px] lg:w-[230px] bg-white
              hover:scale-105 transition-transform duration-300 ease-in-out
              cursor-pointer"
        >
            <div
                className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-pink-500
                   text-white text-xs font-semibold px-3 py-1 rounded-full shadow-2xl
                   transform hover:scale-105 transition-transform duration-200
                   uppercase tracking-wider z-10"
            >
                New
            </div>

            <div className="flex flex-col">
                <div className="aspect-w-1 aspect-h-1 w-full mb-4">
                    <img src={product.image} alt={product.productName} className="object-cover w-full h-full rounded-md" />
                </div>
                <p className="font-semibold text-sm md:text-base lg:text-lg mb-2 line-clamp-2">{product.productName}</p>
            </div>

            <div className="flex flex-col">
                <div className="flex flex-col items-center justify-start gap-2 mb-1 sm:flex-row">
                    <span className="text-red-500 font-bold text-base md:text-lg">{formatMoney(product.newPrice)}</span>
                    {product.newPrice !== product.oldPrice && <p className="text-gray-400 text-sm line-through">{formatMoney(product.oldPrice)}</p>}
                </div>
                <div className="flex items-center gap-2 mb-2">
                    <Rating value={product.rating} readOnly cancel={false} stars={5} className="text-sm md:text-base" />
                </div>
                <p className="text-gray-500 text-xs md:text-sm">{t('sold', { count: product.sold.toLocaleString() })}</p>
            </div>
        </div>
    );
}
