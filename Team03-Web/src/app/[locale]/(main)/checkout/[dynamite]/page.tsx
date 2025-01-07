'use client';
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useSearchParams, useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { checkoutService } from '@/src/app/[locale]/(main)/checkout/[dynamite]/service/checkoutService';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import PaymentMethodSelector from './components/PaymentMethodSelector';
import CartItemsDisplay from './components/CartItemsDisplay';
import AddressSelector from './components/AddressSelector';
import AddressForm from './components/AddressForm';
import Spinner from '@/src/components/spinner/spinner';

import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

interface UserData {
    userId: number;
    name: string;
    username: string;
    email: string;
    phone: string | null;
    addresses: any[];
}

interface AddressData {
    fullAddress: string[];
}

interface CartItem {
    item: {
        price: number;
        productFamily: {
            shopId: string;
            shopName: string;
            productImage: string;
            productName: string;
        };
        value1: { name: string };
        value2: { name: string };
    };
    itemQuantity: number;
}

const CheckoutPage = () => {
    const t = useTranslations('checkout');
    const params = useParams();
    const searchParams = useSearchParams();
    const dynamite = params.dynamite as string;
    const locale = params.locale as string;
    const { push } = useRouter();

    const cartItemId = useMemo(() => {
        const ids = searchParams.get('cartItemId')?.split(',') || [];
        return ids.filter((id) => id.trim() !== '');
    }, [searchParams]);

    const [userData, setUserData] = useState<any>(null);
    const [cartItems, setCartItems] = useState<any[]>([]);
    const [groupedCartItems, setGroupedCartItems] = useState<{ [key: string]: CartItem[] }>({});
    const [totalPrice, setTotalPrice] = useState<number>(0);
    const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [isAddAddressModalOpen, setIsAddAddressModalOpen] = useState(false);
    const [newAddress, setNewAddress] = useState({
        addressLine1: '',
        addressLine2: '',
        name: '',
        phone: ''
    });
    const [error, setError] = useState<string | null>(null);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('COD');

    const [showAddressSelect, setShowAddressSelect] = useState(false);
    const [provinces, setProvinces] = useState<any[]>([]);
    const [districts, setDistricts] = useState<any[]>([]);
    const [wards, setWards] = useState<any[]>([]);
    const [selectedProvince, setSelectedProvince] = useState<any>(null);
    const [selectedDistrict, setSelectedDistrict] = useState<any>(null);
    const [selectedWard, setSelectedWard] = useState<any>(null);
    const addressSelectRef = useRef<HTMLDivElement>(null);
    const toast = useRef<Toast>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [addressToEdit, setAddressToEdit] = useState<any>(null);
    const [isEditAddressModalOpen, setIsEditAddressModalOpen] = useState(false);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (addressSelectRef.current && !addressSelectRef.current.contains(event.target as Node)) {
                setShowAddressSelect(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const fetchProvinces = async () => {
        try {
            const provinces = await checkoutService.getProvinces();
            setProvinces(provinces);
        } catch (error) {
            console.error('Error fetching provinces:', error);
        }
    };

    const fetchDistricts = async (provinceId: number) => {
        try {
            const districts = await checkoutService.getDistricts(provinceId);
            setDistricts(districts);
        } catch (error) {
            console.error('Error fetching districts:', error);
        }
    };

    const fetchWards = async (districtId: number) => {
        try {
            const wards = await checkoutService.getWards(districtId);
            setWards(wards);
        } catch (error) {
            console.error('Error fetching wards:', error);
        }
    };

    const fetch = useCallback(async () => {
        if (!dynamite || cartItemId.length === 0) return;

        try {
            const cartItemIdParam = cartItemId.join(',');
            const data = await checkoutService.getCheckoutData(dynamite, cartItemIdParam);

            if (data.userDto?.addresses) {
                data.userDto.addresses = data.userDto.addresses.map((address: any) => ({
                    ...address,
                    name: address.name || data.userDto.name,
                    phone: address.phone || data.userDto.phone
                }));
            }

            setUserData(data.userDto);
            const items = data.cartItems || [];
            setCartItems(items);
            setTotalPrice(data.totalPrice);

            const groupedItems: { [key: string]: CartItem[] } = {};
            items.forEach((item: CartItem) => {
                const shopId = item.item.productFamily.shopId;
                if (!groupedItems[shopId]) {
                    groupedItems[shopId] = [];
                }
                groupedItems[shopId].push(item);
            });
            setGroupedCartItems(groupedItems);
        } catch (error) {
            console.error('Error fetching checkout data:', error);
            setError('Error loading checkout data');
        }
    }, [dynamite, cartItemId]);

    useEffect(() => {
        fetch();
    }, [fetch]);

    useEffect(() => {
        if (userData?.addresses && userData.addresses.length > 0 && selectedAddressIndex === 0) {
            setSelectedAddressIndex(0);
        }
    }, [userData]);

    useEffect(() => {
        if (isAddressModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isAddressModalOpen]);

        if (!cartItems.length || !userData) {
            return (
                <div className="min-h-screen flex items-center justify-center">
                    <Spinner isLoading={true} />
                </div>
            );
    }

    const shippingFee = 0;
    const subtotal = cartItems.reduce((acc, item) => acc + item.item.discountedPrice * item.itemQuantity, 0);
    const grandTotal = subtotal + shippingFee;

    const handlePayment = async () => {
        try {
            if (!userData?.addresses || userData.addresses.length === 0) {
                toast.current?.show({ severity: 'error', summary: t('pleaseAddAddress'), life: 3000 });
                return;
            }

            const selectedAddress = userData.addresses[selectedAddressIndex] || userData.addresses[0];
            if (!selectedAddress) {
                toast.current?.show({ severity: 'error', summary: t('pleaseSelectAddress'), life: 3000 });
                return;
            }

            if (!selectedPaymentMethod) {
                toast.current?.show({ severity: 'error', summary: t('pleaseSelectPaymentMethod'), life: 3000 });
                return;
            }

            const fullAddress = [selectedAddress.addressLine1, selectedAddress.addressLine2].filter(Boolean).join(', ');
            const phoneReception = selectedAddress.phone;
            const itemId = cartItems[0].item.itemId;
            const itemQuantity = cartItems[0].itemQuantity;

            const userDataFromStorage = localStorage.getItem('user');

            if (!userDataFromStorage) {
                console.error('User data not found');
                return;
            }

            const customerName = selectedAddress.name;

            setIsLoading(true);
            const apiResponse = await checkoutService.checkQuantity(itemId, itemQuantity);
            await new Promise((resolve) => setTimeout(resolve, 2000));
            setIsLoading(false);

            console.log('API Response:', apiResponse.status);
            if (apiResponse.status !== 200) {
                console.error('Error message:', apiResponse.message);
                toast.current?.show({ severity: 'error', summary: apiResponse.message, life: 3000 });
                return;
            }

            const paymentUrl = await checkoutService.createPayment(userData.userId, fullAddress, selectedPaymentMethod, grandTotal, cartItems, customerName, phoneReception);

            if (paymentUrl && typeof paymentUrl === 'string' && paymentUrl.startsWith('http')) {
                window.location.href = paymentUrl;
            } else {
                const shopName = cartItems[0].item.productFamily.shopName;
                toast.current?.show({
                    severity: 'success',
                    summary: t('orderSuccess'),
                    life: 3000
                });

                const shippingInfo = encodeURIComponent(
                    JSON.stringify({
                        address: fullAddress,
                        name: selectedAddress.name,
                        phone: selectedAddress.phone
                    })
                );

                push(`/${locale}/checkoutsuccess?amount=${grandTotal}&tex=${shopName}&shipping=${shippingInfo}`);
            }
        } catch (error) {
            setIsLoading(false);
            console.error('Payment error:', error);
            toast.current?.show({ severity: 'error', summary: t('paymentError'), life: 3000 });
        }
    };

    const handleChangeAddress = (index: number) => {
        setSelectedAddressIndex(index);
        setIsAddressModalOpen(false);
    };

    const handleEditAddress = (address: any) => {
        setAddressToEdit(address);
        setIsEditAddressModalOpen(true);
        setIsAddressModalOpen(false);
    };

    const selectedAddress = userData?.addresses ? userData.addresses[selectedAddressIndex] || userData.addresses[0] : null;

    return (
        <div className="min-h-screen bg-[#f5f5f5] py-4">
            <div>
                <Spinner isLoading={isLoading} />
                <Toast ref={toast} />
                <div className="max-w-[1280px] mx-auto px-4">
                    <div className="bg-white rounded p-4 mb-3">
                        <div className="flex items-center text-[#333333] text-xl">
                            <i className="pi pi-map-marker mr-2" />
                            <span className="font-bold">{t('shippingInformation')}</span>
                        </div>
                        <div className="mt-4 flex items-start">
                            <div className="flex-1">
                                <div className="text-[#333333] font-bold text-xl">{selectedAddress ? `${selectedAddress.name} | ${selectedAddress.phone}` : `${userData.name} | ${userData.phone || t('notProvided')}`}</div>
                                <div className="text-[#666666] mt-1 font-medium text-lg">{selectedAddress ? [selectedAddress.addressLine1, selectedAddress.addressLine2].filter(Boolean).join(', ') : t('notProvided')}</div>
                            </div>
                            <Button text onClick={() => setIsAddressModalOpen(true)} className="text-black font-bold text-lg">
                                {t('change')}
                            </Button>
                        </div>
                    </div>

                    <CartItemsDisplay groupedCartItems={groupedCartItems} t={t} />

                    <div className="bg-white rounded p-4 mb-3">
                        <PaymentMethodSelector selectedPaymentMethod={selectedPaymentMethod} setSelectedPaymentMethod={setSelectedPaymentMethod} t={t} />
                    </div>

                    <div className="bg-white rounded p-4">
                        <div className="flex flex-col space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-[#666666] text-base">{t('shippingFee')}</span>
                                <span className="text-[#666666] text-base">{shippingFee === 0 ? t('freeShip') : `${new Intl.NumberFormat().format(shippingFee)}₫`}</span>
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t">
                                <div className="flex items-center">
                                    <span className="text-black text-lg font-bold mr-4">{t('total')}:</span>
                                    <span className="text-primary-text text-2xl font-bold">{new Intl.NumberFormat().format(grandTotal)}₫</span>
                                </div>
                                <Button onClick={handlePayment} className="bg-btn-dart text-white px-12 py-3 rounded hover:bg-btn-hover-dart transition-colors text-lg" label={t('placeOrder')} />
                            </div>
                        </div>
                    </div>

                    <AddressSelector
                        isOpen={isAddressModalOpen}
                        onClose={() => setIsAddressModalOpen(false)}
                        addresses={userData?.addresses}
                        selectedAddressIndex={selectedAddressIndex}
                        handleChangeAddress={handleChangeAddress}
                        t={t}
                        setIsAddAddressModalOpen={() => setIsAddAddressModalOpen(true)}
                        onEditAddress={handleEditAddress}
                    />

                    <AddressForm
                        isOpen={isAddAddressModalOpen || isEditAddressModalOpen}
                        onClose={() => (isEditAddressModalOpen ? setIsEditAddressModalOpen(false) : setIsAddAddressModalOpen(false))}
                        onSuccess={fetch}
                        userId={userData?.userId}
                        t={t}
                        newAddress={newAddress}
                        setNewAddress={setNewAddress}
                        showAddressSelect={showAddressSelect}
                        setShowAddressSelect={setShowAddressSelect}
                        addressSelectRef={addressSelectRef}
                        provinces={provinces}
                        districts={districts}
                        wards={wards}
                        selectedProvince={selectedProvince}
                        selectedDistrict={selectedDistrict}
                        selectedWard={selectedWard}
                        setSelectedProvince={setSelectedProvince}
                        setSelectedDistrict={setSelectedDistrict}
                        setSelectedWard={setSelectedWard}
                        fetchProvinces={fetchProvinces}
                        fetchDistricts={fetchDistricts}
                        fetchWards={fetchWards}
                        editMode={isEditAddressModalOpen}
                        addressToEdit={isEditAddressModalOpen ? addressToEdit : undefined}
                    />
                </div>
            </div>

        </div>
    );
};

export default CheckoutPage;
