'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import 'swiper/css';
import 'swiper/css/navigation';
import '../../../../public/css/styles.css';

import ImageCarousel from '@/src/app/[locale]/(main)/_component/home-page/ImageCarousel';
import CategorySwiper from '@/src/app/[locale]/(main)/_component/home-page/CategorySwiper';
import ProductCard from '@/src/app/[locale]/(main)/_component/home-page/ProductCard';
import FreeSection from '@/src/app/[locale]/(main)/_component/home-page/FreeSection';
import { PrimeReactProvider } from 'primereact/api';
import PaginatorComponent from '@/src/app/[locale]/(main)/_component/home-page/PaginatorComponent';
import { useRouter } from '@/src/i18n/routing';
import { Rating } from 'primereact/rating';
import Cookies from 'js-cookie';
import { fetchActiveBanner, fetchCategories, fetchProducts, fetchUsersChatBySenderId } from '@/src/app/[locale]/(main)/service/homePageService';
import { ProductResponse } from '@/src/interface/product.interface';
import { Category } from '@/src/interface/category.interface';
import FallingLeaves from '@/src/app/[locale]/(main)/_component/home-page/FallingLeaves';
import { Cherry } from 'lucide-react';
import CherryBlossoms from '@/src/app/[locale]/(main)/_component/home-page/CherryBlossoms';
import SummerFlowers from '@/src/app/[locale]/(main)/_component/home-page/SummerFlowers';
import Snowflakes from '@/src/app/[locale]/(main)/_component/home-page/Snowflakes';
const freeImages = ['/layout/images/home-page/free1.webp', '/layout/images/home-page/free2.webp', '/layout/images/home-page/free3.webp', '/layout/images/home-page/free4.webp', '/layout/images/home-page/free5.webp'];

export default function HomePage() {
    const t = useTranslations('HomePage');
    const router = useRouter();
    const [categories, setCategories] = useState<Category[]>([]);
    const [products, setProducts] = useState([]);
    const [showBanner, setShowBanner] = useState(true);
    const [first, setFirst] = useState(0);
    const [rows] = useState(35);
    const [totalRecords, setTotalRecords] = useState(0);
    const [users, setUsers] = useState([]);
    const [userId, setUserId] = useState<string | null>(null);
    const token = Cookies.get('token');
    const [bannerUrl, setBannerUrl] = useState('');
    const [idShop, setIdShop] = useState('');
    useEffect(() => {
        if (token) {
            const userData = localStorage.getItem('user');
            if (userData) {
                const user = JSON.parse(userData);
                setUserId(user.state.id);
            }
        }
    }, [token]);
    useEffect(() => {
        const getBanner = async () => {
            try {
                const url = await fetchActiveBanner();
                setBannerUrl(url.image);
                setIdShop(url.shopId)
                console.log(url.shopId)
            } catch (error) {
                console.error('Failed to load banner:', error);
            }
        };
        getBanner();
    }, []);

    useEffect(() => {
        const fetchChatData = async () => {
            try {
                if (userId) {
                    const userChats = await fetchUsersChatBySenderId(userId);
                    setUsers(userChats);
                }
            } catch (error) {
                console.error('Error fetching chat data:', error);
            }
        };

        fetchChatData();
    }, [userId]);

    useEffect(() => {
        const fetchCategoryData = async () => {
            try {
                const rootCategories = await fetchCategories();
                setCategories(rootCategories);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };

        fetchCategoryData();
    }, []);

    useEffect(() => {
        const fetchInitialProducts = async () => {
            try {
                const { products, totalRecords } = await fetchProducts(0, rows);
                setProducts(products);
                setTotalRecords(totalRecords);
            } catch (error) {
                console.error('Error fetching products:', error);
            }
        };

        fetchInitialProducts();
    }, [rows]);

    useEffect(() => {
        const hasSeenBanner = localStorage.getItem('hasSeenBanner');
        if (hasSeenBanner) {
            setShowBanner(false);
        }
    }, []);

    const handleBannerClose = () => {
        setShowBanner(false);
    };

    const formatCurrency = (value: number | undefined, locale = 'vi-VN', currency = 'VND') => {
        if (value === undefined || value === null) return 'N/A';
        return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value);
    };

    const images = ['/layout/images/home-page/imageoppo1.jpg', '/layout/images/home-page/imageoppo2.jpg', '/layout/images/home-page/imageoppo3.jpg'];

    const onPageChange = async (event: any) => {
        const page = event.page;
        setFirst(page * rows);

        try {
            const { products } = await fetchProducts(page, rows);
            setProducts(products);
        } catch (error) {
            console.error('Error fetching paginated products:', error);
        }
    };

    const handleProductClick = (id: number) => {
        router.push(`/products/${id}`);
    };


    return (
        <PrimeReactProvider value={{ unstyled: true }}>
            {showBanner && bannerUrl && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
                    <div className="relative rounded-lg p-6 max-w-[600px] w-full cursor-pointer scale-105">
                        <button className="absolute top-2 right-2 text-3xl text-cyan-400 hover:text-white" onClick={handleBannerClose}>
                            ✖
                        </button>
                        <img src={bannerUrl} onClick={() => router.push(`/shop/${idShop}`)} alt="Banner" className="w-full max-w-[500px] h-auto rounded-lg" />
                    </div>
                </div>
            )}
            <div className={`bg-gray-100 flex flex-col items-center justify-center ${showBanner ? 'z-10' : 'z-0'}`}>
                <CherryBlossoms />
                <ImageCarousel images={images} />
                <CategorySwiper categories={categories} />
                <span className="text-[28px] font-[500] mt-8">{t('hotSale')}</span>

                <div className="grid grid-cols-5 gap-4 max-w-[1280px] mt-8">
                    {products.slice(0, 5).map((product, index) => (
                        <ProductCard key={index} product={product} onClick={handleProductClick} />
                    ))}
                </div>

                <FreeSection freeImages={freeImages} />

                <div id="justForYou" className="bg-gray-100 flex flex-col items-center justify-center py-8">
                    <span className="text-[28px] sm:text-[32px] font-[500] mt-4 text-gray-800">{t('justForYou')}</span>
                    <div className="flex mt-8 w-full px-4 cursor-pointer">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-6 max-w-[1280px] mx-auto">
                            {products.slice(first, first + rows).map((product: ProductResponse, index) => {
                                return (
                                    <div
                                        key={index}
                                        onClick={() => handleProductClick(product.productId)}
                                        className="relative border flex flex-col justify-between rounded-lg shadow-md p-4 w-full sm:w-[200px] md:w-[220px] lg:w-[230px] bg-white hover:scale-105 transition-transform duration-300 ease-in-out cursor-pointer"
                                    >
                                        {product.discountPercentage > 0 && (
                                            <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-2xl transform hover:scale-105 transition-transform duration-200 uppercase tracking-wider z-10">
                                                {product.discountPercentage.toLocaleString()} %
                                            </div>
                                        )}

                                        <div className="flex flex-col">
                                            <div className="aspect-w-1 aspect-h-1 w-full mb-4">
                                                <img src={product.image} alt={product.productName} className="object-cover w-full h-full rounded-md" />
                                            </div>
                                            <p className="font-semibold text-sm md:text-base lg:text-lg mb-2 line-clamp-2">{product.productName}</p>
                                        </div>

                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2 text-base md:text-lg mb-1">
                                                <span className="text-red-500 font-bold">{formatCurrency(product.newPrice)}</span>
                                                {product.oldPrice !== product.newPrice && <span className="text-gray-400 text-sm line-through">{formatCurrency(product.oldPrice)}</span>}
                                            </div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <PrimeReactProvider value={{ unstyled: false }}>
                                                    <Rating value={product.rating} readOnly cancel={false} stars={5} className="text-sm md:text-base" />
                                                </PrimeReactProvider>
                                            </div>
                                            <p className="text-gray-500 text-xs md:text-sm">Đã bán {product.sold.toLocaleString()} </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <PaginatorComponent first={first} rows={rows} totalRecords={totalRecords} onPageChange={onPageChange} />
                </div>
            </div>
        </PrimeReactProvider>
    );
}
