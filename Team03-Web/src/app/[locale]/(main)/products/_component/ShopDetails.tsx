import React from 'react';
import { useRouter } from 'next/router';
import ButtonCustom from '@/src/components/ButtonCustom';
import { useTranslations } from 'next-intl';
import { PiStar } from 'react-icons/pi';

interface ShopDetailsProps {
    product: any;
    userId: string | null;
    handleChatNow: () => void;
    hanldeViewShop: (idShop: any) => void;
    formatTimeJoined: (days: any) => string;
}

const ShopDetails: React.FC<ShopDetailsProps> = ({ product, userId, handleChatNow, hanldeViewShop, formatTimeJoined }) => {
    const roundUp = (num: number) => {
        return Math.ceil(num * 10) / 10;
    };
    const t = useTranslations('productDetail');
    return (
        <div className="flex items-center justify-between bg-white p-10 my-10 rounded-lg shadow-md">
            <div className="flex items-center space-x-3">
                <img src={product.shop.profilePicture || '/layout/images/product/shop_6672180.png'} alt="Logo" className="w-20 h-20 rounded-full" />
                <div>
                    <p className="font-semibold text-lg text-gray-800">{product.shop.shopName}</p>
                    <p className="text-sm text-gray-500">{product.shop.shopAddress}</p>
                </div>
            </div>
            <div className="flex items-center space-x-6">
                <div>
                    <p className="text-xl font-semibold text-red-500">{product.shop.feedbackCount}</p>
                    <p className="text-md text-gray-500">{t('evaluate')}</p>
                </div>
                <div>
                    <p className="text-xl font-semibold text-red-500">{product.shop.sold}</p>
                    <p className="text-md text-gray-500">{t('sales')}</p>
                </div>
                <div className='flex flex-col items-center justify-center gap-2'>
                    <p className="text-xl font-semibold text-red-500">{roundUp(product.shop.rating)}</p>
                    <p className="text-md text-gray-500">
                        <PiStar className="text-yellow-500" />
                    </p>
                </div>
                <div>
                    <p className="text-xl font-semibold text-red-500">{product.shop.productCount}</p>
                    <p className="text-md text-gray-500">{t('product')}</p>
                </div>
                <div>
                    <p className="text-xl font-semibold text-red-500">{formatTimeJoined(product.shop.joined)}</p>
                    <p className="text-md text-gray-500">{t('join')}</p>
                </div>
            </div>

            <div className="flex items-center space-x-4">
                {userId !== product?.shop?.shopId && (
                    <ButtonCustom onClick={handleChatNow} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 text-[14px] font-[500]">
                        {t('chatNow')}
                    </ButtonCustom>
                )}
                <ButtonCustom onClick={() => hanldeViewShop(product?.shop?.shopId)} className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 text-[14px] font-[500]">
                    {t('viewShop')}
                </ButtonCustom>
            </div>
        </div>
    );
};

export default ShopDetails;
