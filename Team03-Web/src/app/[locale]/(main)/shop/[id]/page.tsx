'use client';
import React, { useEffect, useRef, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import ProductCard from '../component/ProductCard';
import Header from '../component/Header';
import Promotions from '@/src/app/[locale]/(main)/shop/component/Promotions';
import CategoryFilter from '@/src/app/[locale]/(main)/shop/component/CategoryFilter';
import ItemProduct from '@/src/app/[locale]/(main)/shop/component/ItemProduct';
import ItemProductPromotion from '@/src/app/[locale]/(main)/shop/component/ItemProductPromotion';
import { getProductbyIdShop } from '@/src/app/[locale]/(main)/shop/service/getProductbyIdShop';
import { getProduct } from '@/src/app/[locale]/(main)/shop/service/getProduct';
import { getProductPromotion } from '@/src/app/[locale]/(main)/shop/service/getProductPromotion';
import { Paginator } from 'primereact/paginator';
import { useTranslations } from 'next-intl';
import Spinner from '@/src/components/spinner/spinner';

interface Product {
    productId: number;
    productName: string;
    image: string;
    oldPrice: number;
    newPrice: number;
    discountPercentage?: number;
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

interface ShopDetails {
    shopId: string;
    profilePicture: string;
    shopName: string;
    shopAddress: string;
    productCount: number;
    joined: number;
}

const ShopDetail: React.FC = () => {
    const { id } = useParams() as { id: string };
    const router = useRouter();
    const searchParams = useSearchParams();
    const t = useTranslations('shopDetail');
    const idShop = Number(id);

    const [products, setProducts] = useState<Product[]>([]);
    const [dataProduct, setDataProduct] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [shopDetails, setShopDetails] = useState<ShopDetails | null>(null);
    const [categories, setCategories] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [first, setFirst] = useState(0);
    const [rows] = useState(12);
    const [totalElements, setTotalElements] = useState(0);

    const [productPromotion, setProductPromotion] = useState<Product[]>([]);
    const [promotionName, setPromotionName] = useState<string | null>(null);
    const promotionRef = useRef<HTMLElement>(null);

    const initialSelectedCategories = searchParams.get('categories')?.split(',') || [];
    useEffect(() => {
        const name = searchParams.get('name')?.toLowerCase() || '';
        const categoryIds = searchParams.get('categoryIds')?.split(',').map(Number) || [];
        const startPrice = parseInt(searchParams.get('startPrice') || '0');
        const endPrice = parseInt(searchParams.get('endPrice') || '100000000');
        const rating = searchParams.get('rating') !== null ? parseInt(searchParams.get('rating') || '0') : null;

        let filtered = [...products];

        if (name) {
            filtered = filtered.filter((p) => p.productName.toLowerCase().includes(name));
        }

        if (categoryIds.length > 0) {
            filtered = filtered.filter((p) => categoryIds.includes(p.category.categoryId));
        }

        if (!isNaN(startPrice)) {
            filtered = filtered.filter((p) => p.newPrice >= startPrice);
        }

        if (!isNaN(endPrice)) {
            filtered = filtered.filter((p) => p.newPrice <= endPrice);
        }

        if (rating !== null) {
            filtered = filtered.filter((p) => p.rating >= rating);
        }

        setFilteredProducts(filtered);
    }, [products, searchParams]);
    useEffect(() => {
        const fetchDataProduct = async () => {
            setIsLoading(true);
            try {
                const size = 12;
                const res = await getProductbyIdShop(idShop, size, first);

                if (res.data.data.content) {
                    const products = res.data.data.content;
                    setProducts(products);
                    setFilteredProducts(products);
                    setTotalElements(Math.ceil(res.data.data.page.totalElements / size));

                    if (products.length > 0) {
                        const shopDto = products[0].shopDto;
                        setShopDetails({
                            shopId: shopDto.shopId,
                            profilePicture: shopDto.profilePicture,
                            shopName: shopDto.shopName,
                            shopAddress: shopDto.shopAddress,
                            productCount: shopDto.productCount,
                            joined: shopDto.joined
                        });

                        const uniqueCategories: string[] = Array.from(new Set(products?.map((product: any) => product?.category?.categoryName) ?? []));
                        setCategories(uniqueCategories);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch products:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDataProduct();
    }, [idShop, first]);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await getProduct(idShop);
                if (res.data.data.content) {
                    setDataProduct(res.data.data.content);
                }
            } catch (error) {
                console.error('Failed to fetch products:', error);
            }
        };

        fetchProduct();
    }, [idShop]);

    const handleCategoryChange = (selectedCategories: string[]) => {
        // Update URL parameters
        const params = new URLSearchParams(searchParams.toString());

        if (selectedCategories.length > 0) {
            params.set('categories', selectedCategories.join(','));
        } else {
            params.delete('categories');
        }

        router.push(`${window.location.pathname}?${params.toString()}`, { scroll: false });

        if (selectedCategories.length === 0) {
            setFilteredProducts(products);
        } else {
            const filtered = products.filter((product) => selectedCategories.includes(product.category.categoryName));
            setFilteredProducts(filtered);
        }
    };

    const handleOnSelectPromotion = async (promotionId: number, promotionName: string, discountPercentage: number) => {
        try {
            const resp = await getProductPromotion(promotionId, idShop);

            if (resp?.data?.data?.content) {
                const matchingItems = resp.data.data.content.filter((item: Product) => item.discountPercentage === discountPercentage);
                setProductPromotion(matchingItems);
            }

            setPromotionName(promotionName);

            // Scroll to promotion section
            if (promotionRef.current) {
                const elementPosition = promotionRef.current.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - 150;
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        } catch (error) {
            console.error('Error selecting promotion:', error);
        }
    };

    const onPageChange = (event: { first: number; rows: number }) => {
        setFirst(event.first);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (isLoading) {
        return <Spinner isLoading={isLoading} />;
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            {shopDetails && (
                <Header
                    idShop={shopDetails.shopId}
                    urlImage={shopDetails.profilePicture}
                    shopName={shopDetails.shopName}
                    shopAddress={shopDetails.shopAddress}
                    rating={4.7}
                    productCount={shopDetails.productCount}
                    joinedTime={t('joined', { days: shopDetails.joined })}
                />
            )}

            <div className="container max-w-[1290px] mx-auto px-4 py-6">
                <Promotions idShop={idShop} onSelect={handleOnSelectPromotion} />

                <section className="mt-10">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-xl font-bold text-gray-800">{t('latestProducts')}</h2>
                        <button className="text-red-500 hover:underline">{t('viewAll')}</button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                        {[...dataProduct]
                            .reverse()
                            .slice(0, 5)
                            .map((product) => (
                                <ProductCard key={product.productId} product={product} />
                            ))}
                    </div>
                </section>

                {/* Best Selling Products Section */}
                <section className="mt-10">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-xl font-bold text-gray-800">{t('bestSellingProducts')}</h2>
                        <button className="text-red-500 hover:underline">{t('viewAll')}</button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                        {dataProduct.slice(0, 5).map((product) => (
                            <ProductCard key={product.productId} product={product} />
                        ))}
                    </div>
                </section>

                {/* Promotion Products Section */}
                <section ref={promotionRef} className="mt-10">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-xl font-bold text-gray-800">{promotionName}</h2>
                        <button className="text-red-500 hover:underline">{t('viewAll')}</button>
                    </div>
                    {promotionName && productPromotion.length === 0 ? (
                        <h3 className="w-full text-center">Không có sản phẩm</h3>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                            {productPromotion.slice(0, 5).map((product) => (
                                <ItemProductPromotion
                                    key={product.productId}
                                    product={{
                                        ...product,
                                        discountPercentage: product.discountPercentage ?? 0
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </section>

                <section className="mt-10">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-xl font-bold text-gray-800">{t('allProducts')}</h2>
                    </div>

                    <div className="flex flex-col md:flex-row gap-6">
                        <CategoryFilter product={products} />

                        <div className="flex-grow">
                            {filteredProducts.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {filteredProducts.map((product) => (
                                        <ItemProduct
                                            key={product.productId}
                                            product={{
                                                ...product,
                                                discountPercentage: product.discountPercentage ?? 0
                                            }}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center">{t('noProducts')}</p>
                            )}

                            <div className="flex w-full justify-center mt-4">
                                <Paginator first={first} rows={rows} totalRecords={totalElements} onPageChange={onPageChange} />
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default ShopDetail;
