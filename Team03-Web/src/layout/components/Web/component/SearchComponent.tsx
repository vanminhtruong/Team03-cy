import React, { useState, useRef } from 'react';
import { ProductResponse } from '@/src/interface/product.interface';
import { useRouter } from '@/src/i18n/routing';
import { Rating } from 'primereact/rating';
import { useTranslations } from 'next-intl';

const SearchComponent = ({ products }: { products: ProductResponse[] }) => {
    const [showProducts, setShowProducts] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const t = useTranslations('HomePage');

    const handleFocus = () => setShowProducts(true);

    const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setShowProducts(false);
        }
    };

    React.useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleProductClick = (productId: number) => {
        router.push(`/products/${productId}`);
        setShowProducts(false);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            const queryParams: Record<string, string | number | string[] | number[]> = {
                name: searchTerm
            };
            router.push({
                pathname: '/products',
                query: queryParams,
            });
            setShowProducts(false);
        }
    };

    return (
        <div className="relative w-[600px] max-sm:w-[510px] max-sm:ml-[-70px] max-lg:ml-[90px] max-md:ml-[-20px]">
            <div className="flex items-center bg-gray-100 ml-24 rounded-sm px-4 py-3 shadow-md">
                <i className="pi pi-search text-gray-400 mr-2"></i>
                <input
                    type="text"
                    placeholder={t('search')}
                    className="bg-transparent outline-none text-gray-600 placeholder-gray-400 w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={handleFocus}
                    onKeyDown={handleKeyDown}
                />
            </div>
            <div
                ref={dropdownRef}
                className={`absolute left-24 z-50 w-[515px] bg-white rounded-sm shadow-md mt-2 transition-all duration-300 ease-in-out max-sm:w-[425px] 
                    ${showProducts ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0'} transform origin-top`}
                style={{ transformOrigin: 'top' }}
            >
                <ul className="py-2">
                    {products.map((product: ProductResponse) => (
                        <li key={product.productId} className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer" onClick={() => handleProductClick(product.productId)}>
                            <img src={product.image} alt={product.productName} className="w-16 h-16 rounded mr-4" />
                            <div>
                                <span className="font-semibold text-gray-700 block line-clamp-2">{product.productName}</span>

                                <div className="flex items-center text-sm gap-3">
                                    <div className='flex items-center justify-center'>
                                        <span className="text-gray-600 ml-2">{product.rating.toFixed(1)}</span>
                                    </div>
                                    <Rating value={product.rating} cancel={false} stars={5} className="mr-2" />
                                </div>

                                <span className="text-sm text-gray-500">{product.sold} {t('sold')}</span>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default SearchComponent;
