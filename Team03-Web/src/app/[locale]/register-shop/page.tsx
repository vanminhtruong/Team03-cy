'use client';
import { useRouter } from '@/src/i18n/routing';
import React, { useContext, useState, useEffect, useRef, useCallback, useMemo, Suspense } from 'react';
import { Button } from 'primereact/button';
import { LayoutContext } from '@/src/layout/context/layoutcontext';
import { InputText } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';
import useUserStore from '@/src/app/[locale]/(auth)/stores/useStore';
import useSignupStore from '@/src/app/[locale]/admin/stores/signup/useSignupStore';
import { Toast } from 'primereact/toast';
import { usePathname } from '@/src/i18n/routing';
import { useTranslations } from 'next-intl';
import Spinner from '@/src/components/spinner/spinner';
import { getFullAddress, getUserShopName } from '@/src/app/[locale]/register-shop/service/serviceSignupShop';
import { PrimeReactProvider } from 'primereact/api';
import AddDialog from './components/AddDialog';
import { isNumberic } from '@/src/utils/inputHandlers';
import { handleBlurValidation } from '@/src/utils/inputHandlers';
import { checkInput } from '@/src/utils/checkInput';
import { z } from 'zod';

const Steps = React.lazy(() => import('primereact/steps').then((module) => ({ default: module.Steps })));
const SignupPage = ({ children }: any) => {
    const t = useTranslations('admin-signup');

    const toast = useRef<Toast>(null);
    const { id, email } = useUserStore();
    const [activeIndex, setActiveIndex] = useState(0);
    const pathname = usePathname();
    const [isLoading, setIsLoading] = useState(false);
    const [header, setHeader] = useState('');
    const { shopName, address, addressDetail, phone, setShopName, setAddress, setAddressDetail, setPhone, setUserId, selectedAddress, setSelectedAddress, fullName, setFullName, phoneAddress, setPhoneAddress } = useSignupStore();
    const router = useRouter();
    const [isSelected, setIsSelected] = useState(false);
    const [isShowDialog, setIsShowDialog] = useState(false);
    const [shopNames, setShopNames] = useState<string[]>([]);
    const joinselectedAddress = selectedAddress ? Object.values(selectedAddress).join(', ') : '';

    const [errorMessages, setErrorMessages] = useState<any>({
        shopName: '',
        phone: '',
        addressDetail: ''
    });

    const formData = {
        shopName,
        addressDetail,
        phone
    };

    const checkActiveIndex = useCallback(() => {
        const paths = pathname.split('/');
        const currentPath = paths[paths.length - 1];

        switch (currentPath) {
            case 'identity':
                setActiveIndex(1);
                break;
            case 'success':
                setActiveIndex(2);
                break;
            default:
                break;
        }
    }, [pathname]);

    useEffect(() => {
        checkActiveIndex();
    }, [checkActiveIndex]);

    const wizardItems = useMemo(
        () => [
            { label: t('shopinfo'), command: () => router.push('/register-shop') },
            { label: t('identity'), command: () => router.push('/register-shop/identity') },
            { label: t('success'), command: () => router.push('/register-shop/success') }
        ],
        [t, router]
    );

    const showMess = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({
            severity,
            summary,
            detail,
            life: 3000
        });
    };

    const { layoutConfig } = useContext(LayoutContext);
    const containerClassName = classNames('surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden', { 'p-input-filled': layoutConfig.inputStyle === 'filled' });
    const SignupSchema = z.object({
        shopName: z
            .string()
            .nonempty(t('enterShopName'))
            .refine(
                (value) => {
                    const normalizedValue = value.trim().replace(/\s+/g, '').toLowerCase();
                    return !shopNames.includes(normalizedValue);
                },
                {
                    message: t('errorShopName') 
                }
            ),
        addressDetail: z.string().nonempty(t('enterShopAddressDetail')),
        phone: z
            .string()
            .regex(/^(03|05|07|08|09)\d{8}$/, t('invalidVietnamPhone'))
            .nonempty(t('enterPhone'))
    });

    function handlePhoneChange(e: any) {
        const value = e.target.value;
        if (value === '' || isNumberic(value)) {
            if (value !== phone) {
                setPhone?.(value);
            }
        }
    }

    function handleSubmit(e: any) {
        e.preventDefault();
        if (checkInput(formData, setErrorMessages, SignupSchema)) {
            try {
                setIsLoading(true);
                setUserId?.(id);
                router.push('/register-shop/identity');
            } catch (error: any) {
                setIsLoading(false);
                showMess('error', t('error'), t('errormessage'));
            }
        }
    }

    async function handleSetShopName(e: any) {
        setShopName(e.target.value);
        try {
            const response = await getUserShopName();
            setShopNames(response.filter((item: any) => item.shop_name).map((item: any) => item.shop_name.trim().replace(/\s+/g, '').toLowerCase()));
        } catch (error: any) {
            showMess('error', t('error'), error.message);
        }
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (address === 0) return;
                const response = await getFullAddress(address);
                if (response.status === 200) {
                    setSelectedAddress(response.data);
                    setAddress(address);
                    setIsSelected(true);
                }
            } catch (error: any) {
                showMess('error', t('error'), error.message);
            }
        };

        fetchData();
    }, []);

    function handleAddressDetail() {
        setHeader(t('addNewAddress.titleEdit'));
        setIsShowDialog(true);
    }

    async function handleSaveAddress(name: string, phone: string, address: number, addressDetail: string) {
        setFullName(name);
        setPhoneAddress(phone);
        setAddressDetail(addressDetail);
        setAddress(address);
        try {
            if (address === 0) return;
            const response = await getFullAddress(address);
            if (response.status === 200) {
                setSelectedAddress(response.data);
                setAddress(address);
                setIsSelected(true);
            }
        } catch (error: any) {
            showMess('error', t('error'), error.message);
        }
        setIsShowDialog(false);
        handleBlurValidation('addressDetail', formData, setErrorMessages, SignupSchema);
    }

    function handleAddAddress(e: any) {
        e.preventDefault();
        setHeader(t('addNewAddress.title'));
        setIsShowDialog(true);
    }

    return (
        <PrimeReactProvider value={{ unstyled: false }}>
            <AddDialog visible={isShowDialog} onClose={() => setIsShowDialog(false)} onSave={handleSaveAddress} header={header} />
            <div className={containerClassName}>
                <div className="flex mx-auto w-full mt-8 py-2 md:px-6 max-w-[1280px]">
                    <div className="w-full surface-card pt-4 sm:px-4 shadow-2xl rounded-lg">
                        <div className="text-center mb-5">
                            <span className="text-600 font-medium">{t('subtitle')}</span>
                            <Suspense fallback={<Spinner isLoading={true} />}>
                                <Steps className="mt-4 mx-auto" model={wizardItems} activeIndex={activeIndex} onSelect={(e) => setActiveIndex(e.index)} readOnly={true} />
                            </Suspense>
                        </div>
                        <hr />

                        {pathname === '/register-shop' ? (
                            <form onSubmit={handleSubmit}>
                                <div className="flex flex-col text-md justify-center items-center gap-3 md:gap-4 p-4 w-full">
                                    <div className="flex flex-col md:flex-row gap-2 md:gap-4 w-full md:items-center">
                                        <label htmlFor="shopName1" className="font-medium md:w-1/3 md:text-right">
                                            <span className="text-red-500">*</span>
                                            {t('shopName')}
                                        </label>
                                        <div className="flex flex-col gap-1">
                                            <InputText
                                                id="shopName1"
                                                value={shopName}
                                                onChange={handleSetShopName}
                                                onBlur={() => handleBlurValidation('shopName', formData, setErrorMessages, SignupSchema)}
                                                type="text"
                                                placeholder={t('shopName')}
                                                className="w-full md:w-30rem border-2 text-md"
                                                style={{ padding: '0.5rem' }}
                                            />
                                            <small className="text-xs text-red-500 italic">{errorMessages.shopName}</small>
                                        </div>
                                    </div>

                                    <div className="flex flex-col md:flex-row gap-2 md:gap-4 w-full md:items-center">
                                        <label htmlFor="addressDetail1" className="font-medium md:w-1/3 md:text-right">
                                            <span className="text-red-500">*</span>
                                            {t('shopaddressdetail')}
                                        </label>
                                        <div className="flex flex-col gap-1">
                                            {address === 0 ? (
                                                <Button type="button" label="+ Add" className="p-button-text w-fit" onClick={handleAddAddress} />
                                            ) : (
                                                <div>
                                                    <div>
                                                        {fullName} | {phoneAddress}
                                                    </div>
                                                    <div>{addressDetail}</div>
                                                    <div>{joinselectedAddress}</div>
                                                    <span className="text-blue-500 cursor-pointer" onClick={handleAddressDetail}>
                                                        {t('edit')}
                                                    </span>
                                                </div>
                                            )}
                                            <small className="text-xs text-red-500 italic">{errorMessages.addressDetail}</small>
                                        </div>
                                    </div>

                                    <div className="flex flex-col md:flex-row gap-2 md:gap-4 w-full md:items-center">
                                        <label htmlFor="email1" className="font-medium md:w-1/3 md:text-right">
                                            {t('email')}
                                        </label>
                                        <InputText id="email1" value={email} type="text" placeholder={t('email')} className="w-full md:w-30rem border-2 bg-[#E8F0FE]" style={{ padding: '0.5rem' }} disabled />
                                    </div>

                                    <div className="flex flex-col md:flex-row gap-2 md:gap-4 w-full md:items-center">
                                        <label htmlFor="phone1" className="font-medium md:w-1/3 md:text-right">
                                            <span className="text-red-500">*</span>
                                            {t('phone')}
                                        </label>
                                        <div className="flex flex-col gap-1">
                                            <InputText
                                                id="phone1"
                                                value={phone}
                                                onChange={handlePhoneChange}
                                                onBlur={() => handleBlurValidation('phone', formData, setErrorMessages, SignupSchema)}
                                                type="text"
                                                placeholder={t('phone')}
                                                className="w-full md:w-30rem border-2"
                                                style={{ padding: '0.5rem' }}
                                            />
                                            <small className="text-xs text-red-500 italic">{errorMessages.phone}</small>
                                        </div>
                                    </div>

                                    <div className="flex mt-2 md:mt-5 w-full justify-end gap-2">
                                        <Button type="submit" className="bg-primary-text text-white" label={t('next')} />
                                    </div>
                                </div>
                            </form>
                        ) : (
                            <>{children}</>
                        )}
                    </div>
                </div>
                ;
            </div>
            <Toast ref={toast} />
            <Spinner isLoading={isLoading} />
        </PrimeReactProvider>
    );
};

export default SignupPage;
