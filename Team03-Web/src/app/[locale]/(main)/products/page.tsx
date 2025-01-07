'use client';
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Dropdown } from 'primereact/dropdown';

import { Paginator } from 'primereact/paginator';
import { useRouter } from '@/src/i18n/routing';
import Spinner from '@/src/components/spinner/spinner';
import { useTranslations } from 'next-intl';
import { getProductByFilter } from '@/src/app/[locale]/(main)/products/service/getProductByFilter';
import ProductFilter from '@/src/app/[locale]/(main)/products/_component/ProductFilter';
import ProductCard from '@/src/app/[locale]/(main)/products/_component/ProductCard';

interface Product {
    name: string;
    categoryId: string;
    addressId: string;
    price: number;
    createdAt: string;
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
    discountPercentage: number;
}

interface Filters {
    pageSize: number;
    pageIndex: number;
    type: number;
    name?: string;
    categoryId?: string;
    addressId?: string;
    startPrice?: number;
    endPrice?: number;
    rating?: number;
}

const ProductListing = () => {
    const t = useTranslations();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [pageSize] = useState<number>(12);
    const [totalElement, setTotalElement] = useState<number>(0);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const currentPage = parseInt(searchParams.get('page') || '1', 10);
    const pageIndex = currentPage - 1;

    const currentSort = searchParams.get('sort') || 'newest';

    const sortOptions = [
        { label: t('productListing.newest'), value: 'newest' },
        { label: t('productListing.priceAsc'), value: 'price-asc' },
        { label: t('productListing.priceDesc'), value: 'price-desc' },
        { label: t('productListing.highestRating'), value: 'rating' }
    ];

    const onSortChange = (value: string) => {
        const urlParams = new URLSearchParams(searchParams.toString());
        urlParams.set('sort', value);
        router.push(`?${urlParams.toString()}`);
    };
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };
    const onPageChange = (event: any) => {
        const urlParams = new URLSearchParams(searchParams.toString());
        urlParams.set('page', (event.page + 1).toString());
        router.push(`?${urlParams.toString()}`);
    };

    const getFiltersFromURL = (): Filters => {
        const filters: Filters = {
            pageSize,
            pageIndex: currentPage - 1,
            type: 1
        };

        const name = searchParams.get('name');
        const categoryId = searchParams.get('categoryId');
        const categoryParent = searchParams.get('categoryParent');
        const addressId = searchParams.get('addressId');
        const startPrice = searchParams.get('startPrice');
        const endPrice = searchParams.get('endPrice');
        const rating = searchParams.get('rating');

        if (name) filters.name = name;
        if (categoryId) filters.categoryId = categoryId;
        if (addressId) filters.addressId = addressId;
        if (startPrice) filters.startPrice = parseInt(startPrice, 10);
        if (endPrice) filters.endPrice = parseInt(endPrice, 10);
        if (rating) filters.rating = parseInt(rating, 10);

        return filters;
    };

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const filters = getFiltersFromURL();
            const categoryParent = searchParams.get('categoryParent');

            if (categoryParent && !filters.categoryId) {
                setTotalElement(0);
                setProducts([]);
                return;
            }

            const response = await getProductByFilter(filters);
            if (response?.data?.data?.content) {
                setTotalElement(response.data.data.page.totalElements);
                setProducts(response.data.data.content as Product[]);
            } else {
                setProducts([]);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [searchParams, pageIndex]);

    const getSortedProducts = (): Product[] => {
        let sortedProducts = [...products];

        switch (currentSort) {
            case 'price-asc':
                return sortedProducts.sort((a, b) => a.newPrice - b.newPrice);
            case 'price-desc':
                return sortedProducts.sort((a, b) => b.newPrice - a.newPrice);
            case 'rating':
                return sortedProducts.sort((a, b) => b.rating - a.rating);
            case 'newest':
            default:
                return sortedProducts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
    };

    const sortedProducts = getSortedProducts();

    return (
        <div className="max-w-[1280px] mx-auto h-full my-4">
            <div className="flex flex-col md:flex-row gap-4">
                <svg className="md:hidden cursor-pointer" onClick={toggleSidebar} xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000">
                    <path d="M440-160q-17 0-28.5-11.5T400-200v-240L168-736q-15-20-4.5-42t36.5-22h560q26 0 36.5 22t-4.5 42L560-440v240q0 17-11.5 28.5T520-160h-80Zm40-308 198-252H282l198 252Zm0 0Z" />
                </svg>
                <div className="flex flex-col md:flex-row gap-4">
                    <div className={`absolute inset-0 bg-gray-800 bg-opacity-50 z-40 transition-opacity ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={toggleSidebar}></div>
                    <div
                        className={`absolute inset-y-0 left-0 z-50 md:z-10 w-64 bg-white shadow-lg transform transition-transform ${isSidebarOpen ? 'translate-x-[0px]' : 'translate-x-[-1000px]'} md:relative md:translate-x-0 md:w-auto md:shadow-none`}
                    >
                        <ProductFilter />
                    </div>
                </div>

                <div className="flex-1">
                    {loading ? (
                        <div className="flex justify-between">
                            <div className="mb-4 flex justify-end">
                                <Dropdown value={currentSort} options={sortOptions} onChange={(e) => onSortChange(e.value)} placeholder={t('productListing.sortBy')} />
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="mb-4 flex justify-end">
                                <Dropdown value={currentSort} options={sortOptions} onChange={(e) => onSortChange(e.value)} placeholder={t('productListing.sortBy')} />
                            </div>

                            {sortedProducts.length === 0 ? (
                                <div className="text-center py-6">
                                    <p className="text-gray-500">{t('productListing.noProductsFound')}</p>
                                </div>
                            ) : (
                                <div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {sortedProducts.map((product) => (
                                            <ProductCard key={product.productId} product={product} />
                                        ))}
                                    </div>
                                    <Paginator first={pageIndex * pageSize} rows={pageSize} totalRecords={totalElement} onPageChange={onPageChange} className="mt-4" />
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductListing;
