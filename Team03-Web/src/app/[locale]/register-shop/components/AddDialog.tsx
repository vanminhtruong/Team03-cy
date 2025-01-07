'use client';
import { use, useEffect, useRef, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { useTranslations } from 'next-intl';
import { Toast } from 'primereact/toast';
import { getAddress } from '@/src/app/[locale]/register-shop/service/serviceSignupShop';
import { Dropdown } from 'primereact/dropdown';
import TextArea from 'antd/es/input/TextArea';
import useSignupStore from '@/src/app/[locale]/admin/stores/signup/useSignupStore';
import { checkInput } from '@/src/utils/checkInput';
import { handleBlurValidation } from '@/src/utils/inputHandlers';
import { z } from 'zod';

interface AddDialogProps {
    visible: boolean;
    onClose: () => void;
    onSave: (name: string, phone: string, address: number, addressDetail: string) => void;
    header: string;
}

const AddDialog = ({ visible, onClose, onSave, header }: AddDialogProps) => {
    const t = useTranslations('admin-signup');
    const { fullName, phoneAddress, addressDetail, setAddressDetail, address, setAddress, selectedCity, setSelectedCity, selectedDistrict, setSelectedDistrict, selectedWard, setSelectedWard } = useSignupStore();
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const toast = useRef<Toast>(null);
    const [cities, setCities] = useState<any[]>([]);
    const [districts, setDistricts] = useState<any[]>([]);
    const [wards, setWards] = useState<any[]>([]);
    const [errorMessages, setErrorMessages] = useState<any>({
        name: '',
        phone: '',
        address: '',
        addressDetail: '',
        city: '',
        district: '',
        ward: ''
    });
    const formSchema = z.object({
        name: z.string().min(3, t('addNewAddress.conditionMinName')).max(30, t('addNewAddress.conditionMaxName')).nonempty(t('addNewAddress.enterFullName')),
        phone: z
            .string()
            .length(10, t('addNewAddress.conditionLimitPhone'))
            .regex(/^[0-9]+$/, t('addNewAddress.conditonTypePhone'))
            .nonempty(t('addNewAddress.enterPhone')),
        address: z
            .number({ required_error: t('addNewAddress.enterAddress') })
            .nullable()
            .refine((val) => val !== 0, t('addNewAddress.enterAddress')),
        addressDetail: z.string().min(10, t('addNewAddress.conditionMinAddressDetail')).max(100, t('addNewAddress.conditionMaxAddressDetail')).nonempty(t('addNewAddress.enterAddressDetail'))
    });

    const showMess = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({
            severity,
            summary,
            detail,
            life: 3000
        });
    };
    const formData = {
        name,
        phone,
        address,
        addressDetail
    };

    const getAllAddress = async (parentId: number) => {
        try {
            const response = await getAddress(parentId);
            if (response.status === 200) {
                return response.data;
            }
        } catch (error) {
            showMess('error', 'Error1', 'Error');
        }
        return null;
    };

    useEffect(() => {
        const fetchData = async () => {
            const citiesData = await getAllAddress(0);
            if (citiesData) {
                setCities(citiesData);
            }
        };

        fetchData();
    }, []);

    const handleSelectedCity = async (e: any) => {
        setSelectedCity(e.value);
        try {
            const districtsData = await getAllAddress(e.value.id);
            if (districtsData) {
                setDistricts(districtsData);
            }
        } catch (error) {
            setDistricts([]);
        }
        setSelectedDistrict(null);
        setSelectedWard(null);
    };

    const handleSelectedDistrict = async (e: any) => {
        setSelectedDistrict(e.value);
        try {
            const wardsData = await getAllAddress(e.value.id);
            setWards(wardsData.length === 0 ? [] : wardsData);
        } catch (error) {
            setWards([]);
        }
        setSelectedWard(null);
    };

    const handleSelectedWard = (e: any) => {
        if (e.value) {
            setAddress(e.value.id);
        }
        setSelectedWard(e.value);
    };

    const handleSave = () => {
        if (checkInput(formData, setErrorMessages, formSchema)) {
            onSave(name, phone, address, addressDetail);
            onClose();
        }
    };

    useEffect(() => {
        setName(fullName);
        setPhone(phoneAddress);
        const fetchData = async () => {
            if (selectedCity) {
                const districtsData = await getAllAddress(selectedCity.id);
                if (districtsData) {
                    setDistricts(districtsData);
                }
                const wardsData = await getAllAddress(selectedDistrict.id);
                if (wardsData) {
                    setWards(wardsData);
                }
            }
        };
        fetchData();
    }, [fullName, phoneAddress]);

    return (
        <Dialog visible={visible} onHide={onClose} className="w-[90vw] md:w-[58vw]" header={header}>
            <div className="p-2 text-md flex flex-col gap-5 mx-auto">
                <div className="flex flex-col gap-2">
                    <label htmlFor="full-name">{t('addNewAddress.fullName')}</label>
                    <InputText
                        id="full-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onBlur={() => handleBlurValidation('name', formData, setErrorMessages, formSchema)}
                        type="text"
                        placeholder={t('addNewAddress.enterFullName')}
                        className="w-full border-2"
                        style={{ padding: '0.5rem' }}
                    />
                    <small className="text-xs text-red-500 italic">{errorMessages.name}</small>
                </div>

                <div className="flex flex-col gap-2">
                    <label htmlFor="phone1">{t('addNewAddress.phone')}</label>
                    <InputText
                        id="phone1"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        onBlur={() => handleBlurValidation('phone', formData, setErrorMessages, formSchema)}
                        type="text"
                        placeholder={t('addNewAddress.enterPhone')}
                        className="w-full border-2"
                        style={{ padding: '0.5rem' }}
                    />
                    <small className="text-xs text-red-500 italic">{errorMessages.phone}</small>
                </div>

                <div className="flex flex-col gap-2 w-full">
                    <label htmlFor="address">{t('addNewAddress.address')}</label>
                    <div className="flex flex-col gap-2 md:flex-row md:justify-between w-full">
                        <Dropdown
                            value={selectedCity}
                            onChange={handleSelectedCity}
                            onBlur={() => handleBlurValidation('city', formData, setErrorMessages, formSchema)}
                            options={cities}
                            optionLabel="name"
                            placeholder={t('addNewAddress.selectCity')}
                            className="w-full"
                        />
                        <Dropdown
                            value={selectedDistrict}
                            onChange={handleSelectedDistrict}
                            onBlur={() => handleBlurValidation('district', formData, setErrorMessages, formSchema)}
                            options={districts}
                            optionLabel="name"
                            placeholder={t('addNewAddress.selectDistrict')}
                            className="w-full"
                        />
                        <Dropdown
                            value={selectedWard}
                            onChange={handleSelectedWard}
                            onBlur={() => handleBlurValidation('ward', formData, setErrorMessages, formSchema)}
                            options={wards}
                            optionLabel="name"
                            placeholder={t('addNewAddress.selectWard')}
                            className="w-full"
                        />
                    </div>
                    <small className="text-xs text-red-500 italic">{errorMessages.address}</small>
                </div>

                <div className="flex flex-col gap-2">
                    <label htmlFor="address-detail">{t('addNewAddress.addressDetail')}</label>
                    <TextArea
                        id="address-detail"
                        rows={3}
                        value={addressDetail}
                        onChange={(e) => setAddressDetail(e.target.value)}
                        onBlur={() => handleBlurValidation('addressDetail', formData, setErrorMessages, formSchema)}
                        placeholder={t('addNewAddress.enterAddressDetail')}
                        className="w-full border-2 text-md"
                    />
                    <small className="text-xs text-red-500 italic">{errorMessages.addressDetail}</small>
                </div>

                <div className="flex mt-2 md:mt-5 w-full justify-end gap-2">
                    <Button label={t('addNewAddress.cancel')} icon="pi pi-times" onClick={onClose} className="p-button-text text-primary-text" />
                    <Button label={t('addNewAddress.save')} icon="pi pi-check" onClick={handleSave} className="p-button-primary bg-primary-text hover:bg-secondary-text text-white" />
                </div>
            </div>
            <Toast ref={toast} />
        </Dialog>
    );
};

export default AddDialog;
