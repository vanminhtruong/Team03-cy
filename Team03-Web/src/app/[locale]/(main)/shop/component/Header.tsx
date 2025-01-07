import React from 'react';
import { Button } from 'primereact/button';
import useChatStore from '@/src/app/[locale]/(main)/stores/useChatStore';
import { useTranslations } from 'next-intl';


interface ShopProps {
    idShop: any;
    urlImage: string;
    shopName: string;
    shopAddress: string;
    rating: number;
    productCount: number;
    joinedTime: string;
}

export default function Header({ idShop, urlImage, shopName, shopAddress, rating, productCount, joinedTime }: ShopProps) {
    const { setOpenChat, recipientId, setRecipientId, setShopName, setimageShop } = useChatStore();
    const [currentUserId, setCurrentUserId] = React.useState<string | null>(null);
    const t = useTranslations('shopDetail');

    function handleChatNow() {
        setOpenChat(true);
        setRecipientId(idShop);
        setimageShop(urlImage);
        console.log(recipientId);
        setShopName(shopName);
        const userData = localStorage.getItem('user');

        if (userData) {
            const user = JSON.parse(userData);
            setCurrentUserId(user.state.id);
        }
    }

    return (
        <div className="bg-white shadow-sm">
            <div className="max-w-[1280px] w-full mx-auto px-4 py-6">
                <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
                    <div className="flex items-center space-x-4">
                        <div className="relative w-[400px] h-[100px]">
                            <img className="absolute inset-0 w-full h-full object-cover border-4 border-white" src={urlImage || 'https://careplusvn.com/Uploads/t/de/default-image_730.jpg'} alt="Shop Background" />
                            <div className="absolute inset-0 bg-black bg-opacity-15 flex items-center justify-start px-6 text-white">
                                <div className="relative mr-4">
                                    <img className="w-[80px] h-[80px] rounded-full object-cover border-4 border-white shadow-md" src={urlImage || 'https://careplusvn.com/Uploads/t/de/default-image_730.jpg'} alt="Shop Logo" />
                                    <div className="absolute bottom-0 right-0 bg-green-500 w-6 h-6 rounded-full border-2 border-white"></div>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{shopName}</p>
                                    <p className="text-gray-200">{shopAddress}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex space-x-6 text-gray-600">
                        <div className="flex items-center space-x-2">
                            <i className="pi pi-shopping-cart text-black text-lg"></i>
                            <span>{t('products', { count: productCount })}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <i className="pi pi-calendar text-black text-lg"></i>
                            <span>{joinedTime}</span>
                        </div>
                    </div>
                    <div>{currentUserId !== idShop && <Button onClick={handleChatNow} label={t('chatShop')} className="bg-black text-white px-4 py-2 rounded-lg hover:bg-white hover:text-black" />}</div>
                </div>
            </div>
        </div>
    );
}
