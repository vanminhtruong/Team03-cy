'use client';
import { PrimeReactProvider } from 'primereact/api';
import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { ProductDetail, ProductRelative, Variant } from '@/src/interface/product.interface';
import { Toast } from 'primereact/toast';
import { createCart, getProductById, getRelative } from '@/src/app/[locale]/(main)/products/service/serviceProduct';
import ProductLikeButton from '@/src/app/[locale]/(main)/products/_component/ProductLikeButton';
import ProductActions from '@/src/app/[locale]/(main)/products/_component/ProductAction';
import { useRouter } from '@/src/i18n/routing';
import Spinner from '@/src/components/spinner/spinner';
import useChatStore from '@/src/app/[locale]/(main)/stores/useChatStore';
import useHandleCart from '@/src/layout/store/useHandleCart';
import ProductVariantsList from '@/src/app/[locale]/(main)/products/_component/ProductVariants';
import QuantitySelector from '@/src/app/[locale]/(main)/products/_component/QuantitySelector';
import { fetchUsersChatBySenderId } from '@/src/app/[locale]/(main)/service/homePageService';
import ShopDetails from '@/src/app/[locale]/(main)/products/_component/ShopDetails';
import FeedbackList from '@/src/app/[locale]/(main)/products/_component/FeedbackList';
import RelatedProducts from '@/src/app/[locale]/(main)/products/_component/RelatedProducts';
import ButtonCustom from '@/src/components/ButtonCustom';
import ProductDescription from '@/src/app/[locale]/(main)/products/_component/ProductDescription';
import ProductFeedback from '@/src/app/[locale]/(main)/products/_component/ProductFeedback';
import { useTranslations } from 'next-intl';

const ProductDetail = () => {
    const { id } = useParams();
    const [product, setProduct] = useState<ProductDetail | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [variants, setVariants] = useState<Variant[]>([]);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [selectedSize, setSelectedSize] = useState<string>('');
    const [selectedColor, setSelectedColor] = useState<string>('');
    const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
    const [quantity, setQuantity] = useState<number>(1);
    const toast = useRef<Toast>(null);
    const [addedQuantity, setAddedQuantity] = useState<number>(0);
    const [relatedProducts, setRelatedProducts] = useState<ProductRelative[]>([]);
    const [currentPage, setCurrentPage] = useState(0);
    const itemsPerPage = 9;
    const router = useRouter();
    const startIdx = currentPage * itemsPerPage;
    const { setOpenChat, setRecipientId, setShopName, setimageShop } = useChatStore();
    const { triggerFetch, setTriggerFetch } = useHandleCart();
    const [fullscreenMedia, setFullscreenMedia] = useState(null);
    const maxVisibleMedia = 5;
    const [outOfStock, setOutOfStock] = useState<boolean>(false);
    const t = useTranslations('productDetail');
    const handleNext = () => {
        if (startIdx + itemsPerPage < relatedProducts.length) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePrevious = () => {
        if (currentPage > 0) {
            setCurrentPage(currentPage - 1);
        }
    };

    useEffect(() => {
        const fetchRelatedProducts = async () => {
            try {
                const numericId = Number(id);
                const response = await getRelative(numericId);
                setRelatedProducts(response.data.data.content);
            } catch (error) {
                console.error('Error fetching related products:', error);
            }
        };
        fetchRelatedProducts();
    }, []);

    const fetchProduct = async () => {
        try {
            setLoading(true);
            const response = await getProductById(Number(id));
            const productData = response.data.data;
            setProduct(productData);
            setSelectedImage(productData.images[0]?.imageLink || '/path/to/default-placeholder.jpg');
            setVariants(productData.variants || []);
        } catch (error) {
            console.error('Error fetching product:', error);
        } finally {
            setLoading(false);
        }
    };
    const storedUserData = localStorage.getItem('user');
    const userId = storedUserData ? JSON.parse(storedUserData).state.id : null;
    const handleAddToCart = async () => {
        if (outOfStock) {
            toast.current?.show({
                severity: 'error',
                summary: t('outOfStock'),
                detail: t('detailOutOfStock')
            });
            return;
        }
        if (variants.length > 0 && !selectedVariant) {
            toast.current?.show({
                severity: 'error',
                summary: t('summary.error'),
                detail: t('pleaseChooseVariation')
            });
            return;
        }

        if (!userId) {
            toast.current?.show({
                severity: 'warn',
                summary: 'Warning',
                detail: t('pleaseLogin')
            });
            return;
        }

        try {
            const selectedVariantId = selectedVariant ? selectedVariant.variantId : variants[0]?.variantId;
            const response = await createCart(userId, selectedVariantId, quantity);
            if (response.status === 201) {
                setTriggerFetch(!triggerFetch);
                setAddedQuantity((prev) => prev + quantity);
                toast.current?.show({
                    severity: 'success',
                    summary: t('summary.success'),
                    detail: t('addToCartSuccess')
                });
            }
        } catch (error: any) {
            console.error('Error adding to cart:', error);
            if (error.response?.data?.message === 'Requested quantity exceeds available stock') {
                toast.current?.show({
                    severity: 'error',
                    summary: t('summary.error'),
                    detail: t('inventory')
                });
            } else {
                const errorMessage = error.response?.data?.message || t('summary.anErrorOccurred');
                toast.current?.show({
                    severity: 'error',
                    summary: t('summary.error'),
                    detail: errorMessage
                });
            }
        }
    };

    const updateSelectedVariant = () => {
        const foundVariant = variants.find((variant) => {
            if (variant.option1 && variant.option2) {
                return variant.option1?.value.name === selectedSize && variant.option2?.value.name === selectedColor;
            }
            else if (variant.option1) {
                return variant.option1?.value.name === selectedSize || variant.option1?.value.name === selectedColor;
            }
            return false;
        });
        if (foundVariant) {
            setSelectedVariant(foundVariant);
            setSelectedImage(foundVariant.image);
            setOutOfStock(foundVariant.quantity <= 0);
        } else {
            setSelectedVariant(null);
            setSelectedImage(product?.images?.[0]?.imageLink || '/layout/images/product/default-imagr.jpg');
            setOutOfStock(false);
        }
    };

    const handleThumbnailClick = (imageLink: string) => setSelectedImage(imageLink);
    const handleSizeClick = (size: string) => {
        setSelectedSize(size);
        setQuantity(1);
        updateSelectedVariant();
    };

    const handleColorClick = (color: string) => {
        setSelectedColor(color);
        setQuantity(1);
        updateSelectedVariant();
    };

    useEffect(() => {
        if (id) fetchProduct();
    }, [id]);

    useEffect(() => {
        if (variants.length === 1) {
            setSelectedVariant(variants[0]);
            setSelectedSize(variants[0].option1?.value.name || '');
            setSelectedColor(variants[0].option2?.value.name || '');
        }
    }, [variants]);

    useEffect(() => {
        updateSelectedVariant();
    }, [selectedSize, selectedColor]);
    const formatDescription = (description: string = '') => {
        return description.replaceAll(/(\r\n|\n)/g, '<br />');
    };

    if (loading) {
        return <Spinner isLoading={loading} />;
    }
    if (!product) {
        return (
            <div className="flex items-center justify-center">
                <img alt="" src="/layout/images/product/2809510.webp" />
            </div>
        );
    }
    const handleFeedbackImageClick = (mediaLink: any) => {
        setFullscreenMedia(mediaLink);
    };

    const formatCurrency = (value: number | undefined, locale: string = 'vi-VN', currency: string = 'VND') => {
        if (value === undefined || value === null) {
            return 'N/A';
        }
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency
        }).format(value);
    };

    const formatTimeJoined = (days: any) => {
        if (days < 30) {
            return `${days} ${t('daysAgo')}` ;
        } else if (days < 365) {
            const months = Math.floor(days / 30);
            return `${months} ${t('monthAgo')}`;
        } else {
            const years = Math.floor(days / 365);
            return `${years} ${t('yearAgo')}`;
        }
    };
    const hanldeViewShop = (idShop: any) => {
        router.push(`/shop/${idShop}`);
    };

    async function handleChatNow() {
        const shopName = product?.shop?.shopName ?? '';
        const shopId = product?.shop?.shopId ?? null;
        setShopName(shopName);
        setOpenChat(true);
        setRecipientId(shopId);
        setimageShop(product?.shop?.profilePicture ?? '');
    }

    return (
        <div className=" font-sans flex items-center justify-center">
            <Toast ref={toast} />
            {fullscreenMedia && (
                <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50" onClick={() => setFullscreenMedia(null)}>
                    <div className="relative max-w-4xl">
                        {/\.(mp4|webm|ogg)$/i.test(fullscreenMedia) ? (
                            <video controls autoPlay className="w-full h-auto max-h-[80vh] object-cover">
                                <source src={fullscreenMedia} type="video/mp4" />
                                {t('notSupported')}
                            </video>
                        ) : (
                            <img src={fullscreenMedia} alt="Fullscreen Media" className="w-full h-auto max-h-[80vh] object-contain" />
                        )}
                        <button onClick={() => setFullscreenMedia(null)} className="absolute top-0 right-4 text-white text-2xl font-bold">
                            x
                        </button>
                    </div>
                </div>
            )}
            <div className="p-4 max-w-[1280px] w-full">
                <PrimeReactProvider value={{ unstyled: true }}>
                    <div className="grid items-start grid-cols-1 lg:grid-cols-2 gap-16 max-lg:gap-16">
                        <div className="w-full lg:sticky top-0 text-center">
                            <div className="lg:h-[560px] flex justify-center items-center">
                                <img
                                    src={selectedImage || product?.images?.[0]?.imageLink || '/layout/images/product/default-imagr.jpg'}
                                    alt={product?.productName || 'Product'}
                                    className="lg:w-11/12 w-full h-full max-h-[560px] rounded-md object-cover object-top"
                                />
                            </div>
                            <div className="flex flex-wrap gap-4 justify-center mx-auto mt-4 ">
                                {product?.images?.map((image, index) => (
                                    <img alt="" key={index} src={image.imageLink} className="w-20 h-20 cursor-pointer rounded-md object-cover" onClick={() => handleThumbnailClick(image.imageLink)} />
                                ))}
                            </div>
                        </div>
                        <div>
                            <div className="flex flex-wrap items-start gap-4">
                                <div className="flex flex-col flex-wrap">
                                    <h3 className=" font-bold text-gray-800 break-words max-w-[450px] w-full">{product.productName}</h3>
                                    <p className="text-md text-gray-500 mt-2 break-words">{product.category?.categoryName || 'Default Category'}</p>
                                </div>
                                <div className="ml-auto flex flex-wrap gap-4">
                                    <button type="button" className="px-2.5 py-1.5 bg-pink-100 text-xs text-pink-600 rounded-md flex items-center break-words">
                                        <svg className="w-3 mr-1" fill="currentColor" viewBox="0 0 14 13" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M7 0L9.4687 3.60213L13.6574 4.83688L10.9944 8.29787L11.1145 12.6631L7 11.2L2.8855 12.6631L3.00556 8.29787L0.342604 4.83688L4.5313 3.60213L7 0Z" />
                                        </svg>
                                        {product.rating.toFixed(1)}
                                    </button>
                                    <div className="ml-auto flex flex-wrap gap-4">
                                        <ProductLikeButton productId={product.productId} initialLikes={product.numberOfLike} initialIsFavorite={product.numberOfLike} />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between items-center">
                                    <div className="flex gap-4 items-center">
                                        <div>
                                            <p className="text-gray-800 text-4xl font-bold">{selectedVariant ? selectedVariant.newPrice.toLocaleString() : variants[0]?.newPrice.toLocaleString()}đ</p>
                                        </div>
                                        {selectedVariant?.oldPrice !== selectedVariant?.newPrice && (
                                            <div className="flex items-center justify-center">
                                                <p className="text-gray-700 text-2xl line-through">{selectedVariant ? selectedVariant.oldPrice.toLocaleString() : variants[0]?.oldPrice.toLocaleString()}đ</p>
                                            </div>
                                        )}
                                    </div>
                                    <div>{product.discountPercentage !== 0 && <p className="inline-block px-4 py-1 bg-red-600 text-white text-lg font-semibold rounded-md shadow-md">{product.discountPercentage}% OFF</p>}</div>
                                </div>

                                <p className="text-gray-600 text-md mt-2">{t('stock')}: {selectedVariant ? selectedVariant.quantity : product.totalQuantity}</p>
                            </div>

                            <hr className="my-8" />

                            <ProductVariantsList variants={variants} selectedSize={selectedSize} selectedColor={selectedColor} handleSizeClick={handleSizeClick} handleColorClick={handleColorClick} />
                            <hr className="my-8" />
                            {outOfStock && <div className="text-red-500 font-semibold mt-4">{t('detailOutOfStock')}</div>}
                            {userId !== product?.shop?.shopId && <QuantitySelector quantity={quantity} setQuantity={setQuantity} selectedVariant={selectedVariant} addedQuantity={addedQuantity} />}
                            <div className="flex flex-wrap gap-4">
                                {userId !== product?.shop?.shopId ? (
                                    <ProductActions handleAddToCart={handleAddToCart} />
                                ) : (
                                    <ButtonCustom onClick={() => router.push(`/admin/product/update?id=${product.productId}`)} className="min-w-[200px] uppercase py-4 my-5 font-[500] bg-black">
                                        {t('editProduct')}
                                    </ButtonCustom>
                                )}
                            </div>
                        </div>
                    </div>
                    <ShopDetails product={product} userId={userId} handleChatNow={handleChatNow} hanldeViewShop={hanldeViewShop} formatTimeJoined={formatTimeJoined} />
                    <div className="flex gap-20">
                        <div className="mt-10 max-w-4xl flex-[0.7]">
                            <div className="mt-8">
                                <ProductDescription description={product.description} />
                                <ProductFeedback feedbacks={product.feedbacks} maxVisibleMedia={maxVisibleMedia} handleFeedbackImageClick={handleFeedbackImageClick} />
                            </div>
                        </div>
                        <RelatedProducts relatedProducts={relatedProducts} handleNext={handleNext} handlePrevious={handlePrevious} currentPage={currentPage} itemsPerPage={itemsPerPage} formatCurrency={formatCurrency} />
                    </div>
                </PrimeReactProvider>
            </div>
        </div>
    );
};

export default ProductDetail;
