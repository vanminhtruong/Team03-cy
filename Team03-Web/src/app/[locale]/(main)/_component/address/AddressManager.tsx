'use client';
import React, { useEffect, useRef, useState } from 'react';
import ButtonCustom from '@/src/components/ButtonCustom';
import { fetchAddresses, deleteAddress } from '@/src/app/[locale]/(main)/_component/address/service/addressService';
import { AddressResponse } from '@/src/interface/address.interface';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Toast } from 'primereact/toast';
import useUserStore from '@/src/app/[locale]/(auth)/stores/useStore';
import AddressForm from '@/src/app/[locale]/(main)/checkout/[dynamite]/components/AddressForm';
import { useTranslations } from 'next-intl';
import { checkoutService } from '@/src/app/[locale]/(main)/checkout/[dynamite]/service/checkoutService';

interface Province {
    code: string;
    codename: string;
    division_type: string;
    name: string;
    phone_code: number;
    id: number;
}

interface District {
    code: string;
    codename: string;
    division_type: string;
    name: string;
    province_code: string;
    id: number;
}

interface Ward {
    code: string;
    codename: string;
    division_type: string;
    name: string;
    district_code: string;
    id: number;
}

export default function AddressManager() {
    const [addresses, setAddresses] = useState<AddressResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editAddress, setEditAddress] = useState<AddressResponse | null>(null);
    const toast = useRef<Toast>(null);
    const { id } = useUserStore();
    const t = useTranslations('checkout');
    const addressSelectRef = useRef<HTMLDivElement>(null);

    const [newAddress, setNewAddress] = useState({
        addressLine1: '',
        addressLine2: '',
        name: '',
        phone: ''
    });
    const [showAddressSelect, setShowAddressSelect] = useState(false);
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);
    const [wards, setWards] = useState<Ward[]>([]);
    const [selectedProvince, setSelectedProvince] = useState<Province | null>(null);
    const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null);
    const [selectedWard, setSelectedWard] = useState<Ward | null>(null);

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

    useEffect(() => {
        if (isModalOpen) {
            fetchProvinces();
        }
    }, [isModalOpen]);

        const fetchProvinces = async () => {
        try {
            const provinces = await checkoutService.getProvinces();
            setProvinces(provinces);
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: t('error'),
                detail: t('fetchProvincesError'),
                life: 3000
            });
        }
    };

    const fetchDistricts = async (provinceId: number) => {
        if (!provinceId) return;
        try {
            const districts = await checkoutService.getDistricts(provinceId);
            setDistricts(districts);
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: t('error'),
                detail: t('fetchDistrictsError'),
                life: 3000
            });
        }
    };

    const fetchWards = async (districtId: number) => {
        if (!districtId) return;
        try {
            const wards = await checkoutService.getWards(districtId);
            setWards(wards);
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: t('error'),
                detail: t('fetchWardsError'),
                life: 3000
            });
        }
    };

    useEffect(() => {
        const getAddresses = async () => {
            try {
                const data = await fetchAddresses(id);
                setAddresses(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        getAddresses();
    }, [id]);

    const handleDeleteAddress = (shippingAddressId: number) => {
        confirmDialog({
            message: t('confirmDeleteMessage'),
            header: t('confirmDeleteHeader'),
            icon: 'pi pi-exclamation-triangle',
            accept: async () => {
                try {
                    await deleteAddress(id, shippingAddressId);
                    toast.current?.show({
                        severity: 'success',
                        summary: t('success'),
                        detail: t('successDeleteMessage'),
                    });
                    setAddresses((prevAddresses) =>
                        prevAddresses.filter((address) => address.id !== shippingAddressId)
                    );
                } catch (err: any) {
                    setError(err.message);
                }
            },
            reject: () => {
                toast.current?.show({ severity: 'info', summary: t('info'), detail: t('cancelDeleteMessage') });
            },
        });
    };

    const handleOpenModal = (address?: AddressResponse) => {
        setEditAddress(address || null);
        setIsModalOpen(true);
        if (address) {
            setNewAddress({
                addressLine1: address.addressLine1 || '',
                addressLine2: address.addressLine2 || '',
                name: address.name || '',
                phone: address.phone || ''
            });
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditAddress(null);
        setNewAddress({
            addressLine1: '',
            addressLine2: '',
            name: '',
            phone: ''
        });
        setSelectedProvince(null);
        setSelectedDistrict(null);
        setSelectedWard(null);
        setShowAddressSelect(false);
    };

    const handleSuccess = async () => {
        try {
            const updatedAddresses = await fetchAddresses(id);
            setAddresses(updatedAddresses);
            handleCloseModal();
        } catch (err: any) {
            console.error(t('errorLoadingAddresses'), err);
        }
    };

    if (loading) {
        return <div className="p-6">{t('loading')}</div>;
    }

    if (error) {
        return <div className="p-6 text-red-500">{error}</div>;
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-[1280px] mx-auto bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold mb-4">{t('myAddresses')}</h2>
                <ButtonCustom
                    className="text-blue-500 border-blue-500 hover:bg-blue-50 mb-4"
                    onClick={() => handleOpenModal()}
                >
                    + {t('addNewAddress')}
                </ButtonCustom>
                <div className="space-y-6">
                    {addresses.map((address) => (
                        <div key={address.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-medium text-gray-800">{address.name}</p>
                                    <p className="text-gray-600">(+84) {address.phone}</p>
                                    <p className="text-gray-600">{address.addressLine1}</p>
                                    <p className="text-gray-600">{address.addressLine2}</p>
                                </div>
                                <div className="flex space-x-2">
                                    <ButtonCustom
                                        className="text-blue-500 border-blue-500 hover:bg-blue-50"
                                        onClick={() => handleOpenModal(address)}
                                    >
                                        {t('update')}
                                    </ButtonCustom>
                                    <ButtonCustom
                                        className="bg-red-500 text-white"
                                        onClick={() => handleDeleteAddress(address.id)}
                                        >
                                        {t('delete')}
                                    </ButtonCustom>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <ConfirmDialog />
            <Toast ref={toast} />
            <AddressForm
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSuccess={handleSuccess}
                userId={id}
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
                editMode={!!editAddress}
                addressToEdit={editAddress}
            />
        </div>
    );
}
