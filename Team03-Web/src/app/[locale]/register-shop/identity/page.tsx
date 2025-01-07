'use client';
import { useRouter } from '@/src/i18n/routing';
import React, { useState, useRef, useEffect } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { useTranslations } from 'next-intl';
import useSignupStore from '@/src/app/[locale]/admin/stores/signup/useSignupStore';
import SignupPage from '../page';
import CustomFileInput from '../components/CustomFileInput';
import { signupShop, scanQRCode } from '../service/serviceSignupShop';
import { handleBlurValidation } from '@/src/utils/inputHandlers';
import { checkInput } from '@/src/utils/checkInput';
import Spinner from '@/src/components/spinner/spinner';
import { customToFile } from '@/src/utils/customToFile';
import { z } from 'zod';

const IdentityPage = () => {
    const t = useTranslations('admin-signup');
    const toast = useRef<Toast>(null);
    const { userId, shopName, address, addressDetail, phone, taxCode, cardID, idFront, idBack, codeQR, setCodeQR, setTaxCode, setIdFront, setIdBack, setCardID } = useSignupStore();
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const showMess = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({
            severity,
            summary,
            detail,
            life: 3000
        });
    };

    const [errorMessages, setErrorMessages] = useState<any>({
        taxCode: '',
        idFront: '',
        idBack: '',
        codeQR: '',
        cardID: ''
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const formData = {
        taxCode,
        idFront,
        idBack,
        codeQR,
        cardID
    };

    const identitySchema = z.object({
        taxCode: z.string().min(10, t('conditionMinLengthTaxCode')).max(10, t('conditionMaxLengthTaxCode')).nonempty(t('enterTaxCode')),
        idFront: z
            .string()
            .regex(/^data:image\/[a-zA-Z]+;base64,/, t('regexIdFront'))
            .nullable()
            .refine((val) => val !== null, t('enterIdFront')),
        idBack: z
            .string()
            .regex(/^data:image\/[a-zA-Z]+;base64,/, t('regexIdBack'))
            .nullable()
            .refine((val) => val !== null, t('enterIdBack')),
        codeQR: z
            .string()
            .regex(/^data:image\/[a-zA-Z]+;base64,/, t('regexCodeQR'))
            .nullable()
            .refine((val) => val !== null, t('enterCodeQR')),
        cardID: z.string().nonempty(t('enterCitizenIdentification'))
    });

    async function handleInputFront(file: File | null) {
        if (file) {
            setIdFront(file);
        }
    }

    async function handleInputCodeQR(file: File | null) {
        if (file && typeof file === 'string') {
            setCodeQR(file);
        }
    }

    useEffect(() => {
        async function fetchData() {
            if (codeQR && typeof codeQR === 'string' && codeQR.trim() !== '') {
                try {
                    const convertedCodeQR = customToFile(codeQR, 'codeQR.jpg');

                    if (convertedCodeQR instanceof File) {
                        const response = await scanQRCode(convertedCodeQR);

                        if (response && response.number) {
                            setCardID(response.number);
                            setErrorMessages((prev: any) => ({ ...prev, cardID: '' }));
                        }
                    }
                } catch (error) {
                    setErrorMessages((prev: any) => ({ ...prev, cardID: t('invalidID') }));
                }
            } else {
                setCardID('');
            }
        }

        fetchData();
    }, [codeQR]);

    function handleInputBack(file: File | null) {
        if (file) {
            setIdBack(file);
        }
    }

    function handleTaxCode(e: React.ChangeEvent<HTMLInputElement>) {
        const value = e.target.value;
        if (value === '' || /^[0-9]+$/.test(value)) {
            setTaxCode(value);
        }
    }

    function handleBack() {
        router.back();
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        const convertedIdFront = idFront && customToFile(idFront, 'idFront.jpg');
        const convertedIdBack = idBack && customToFile(idBack, 'idBack.jpg');

        if (checkInput(formData, setErrorMessages, identitySchema)) {
            try {
                setIsLoading(true);
                const res = await signupShop(userId!, shopName!, address!, addressDetail!, phone!, convertedIdFront!, convertedIdBack!, taxCode!, cardID!);
                if (res.data.status === 200) {
                    setIsLoading(false);
                    router.push('/register-shop/success');
                } else {
                    setIsLoading(false);
                    showMess('error', t('error'), res.data.message);
                }
            } catch (error: any) {
                setIsLoading(false);
                showMess('error', t('error'), error.message);
            }
        }
    }

    return (
        <SignupPage>
            <form onSubmit={handleSubmit}>
                <div className="flex flex-col justify-center items-center gap-3 md:gap-4 p-4 w-full">
                    <div className="flex flex-col md:flex-row gap-2 md:gap-4 w-full md:items-center">
                        <label htmlFor="taxCode1" className="font-medium md:w-1/3 md:text-right">
                            {t('taxCode')}
                        </label>
                        <div className="flex flex-col gap-1">
                            <InputText
                                id="taxCode1"
                                value={taxCode}
                                onChange={handleTaxCode}
                                onBlur={() => handleBlurValidation('taxCode', formData, setErrorMessages, identitySchema)}
                                type="text"
                                placeholder={t('taxCode')}
                                className="w-full md:w-30rem border-2"
                                style={{ padding: '0.5rem' }}
                            />
                            <small className="text-xs text-red-500 italic">{errorMessages.taxCode}</small>
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row gap-2 md:gap-4 w-full md:items-center">
                        <label htmlFor="idFront1" className="font-medium md:w-1/3 md:text-right">
                            {t('idFront')}
                        </label>
                        <div className="flex flex-col gap-1">
                            <CustomFileInput
                                id="idFront1"
                                value={idFront}
                                onChange={handleInputFront}
                                placeholder={t('uploadIdFront')}
                                fieldName="idFront"
                                onUploadSuccess={() => handleBlurValidation('idFront', formData, setErrorMessages, identitySchema)}
                            />
                            <small className="text-xs text-red-500 italic">{errorMessages.idFront}</small>
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row gap-2 md:gap-4 w-full md:items-center">
                        <label htmlFor="idBack1" className="font-medium md:w-1/3 md:text-right">
                            {t('idBack')}
                        </label>
                        <div className="flex flex-col gap-1">
                            <CustomFileInput
                                id="idBack1"
                                value={idBack}
                                onChange={handleInputBack}
                                placeholder={t('uploadIdBack')}
                                fieldName="idBack"
                                onUploadSuccess={() => handleBlurValidation('idBack', formData, setErrorMessages, identitySchema)}
                            />
                            <small className="text-xs text-red-500 italic">{errorMessages.idBack}</small>
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row gap-2 md:gap-4 w-full md:items-center">
                        <label htmlFor="codeQR1" className="font-medium md:w-1/3 md:text-right">
                            {t('codeQR')}
                        </label>
                        <div className="flex flex-col gap-1">
                            <CustomFileInput
                                id="codeQR1"
                                value={codeQR}
                                onChange={handleInputCodeQR}
                                placeholder={t('uploadCodeQR')}
                                fieldName="codeQR"
                                onUploadSuccess={() => handleBlurValidation('codeQR', formData, setErrorMessages, identitySchema)}
                            />
                            <small className="text-xs text-red-500 italic">{errorMessages.codeQR}</small>
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row gap-2 md:gap-4 w-full md:items-center">
                        <label htmlFor="cardID1" className="font-medium md:w-1/3 md:text-right">
                            {t('citizenIdentification')}
                        </label>
                        <div className="flex flex-col gap-1">
                            <InputText id="cardID1" value={cardID} type="text" placeholder={t('cardID')} className="w-full md:w-30rem border-2 bg-[#E8F0FE]" style={{ padding: '0.5rem' }} disabled />
                            <small className="text-xs text-red-500 italic">{errorMessages.cardID}</small>
                        </div>
                    </div>
                    <div className="flex w-full justify-between ">
                        <Button label={t('back')} className="p-button-text text-primary-text" onClick={handleBack} />
                        <div className="flex justify-end gap-2">
                            <Button type="submit" label={t('next')} className="bg-primary-text text-white" />
                        </div>
                    </div>
                </div>
            </form>
            <Toast ref={toast} />
            <Spinner isLoading={isLoading} />
        </SignupPage>
    );
};

export default IdentityPage;
