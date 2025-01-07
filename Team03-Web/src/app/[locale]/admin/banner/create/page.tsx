'use client';
import React, { useState, useRef } from 'react';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { FileUpload } from 'primereact/fileupload';
import { Toast } from 'primereact/toast';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import '@/public/css/styles.css';
import useUserStore from '@/src/app/[locale]/(auth)/stores/useStore';
import Spinner from '@/src/components/spinner/spinner';
import { useRouter } from '@/src/i18n/routing';
import { createBanner } from '@/src/app/[locale]/admin/banner/service/CreateBannerPayload';
import { useTranslations } from 'next-intl';

const CreateBanner = () => {
    const toast = useRef<Toast>(null);
    const { id } = useUserStore();
    const router = useRouter();
    const [loading, setLoading] = useState<boolean>(false);
    const [formData, setFormData] = useState({
        price: 0,
        image: null as File | null,
        createStart: null as Date | null,
        createEnd: null as Date | null
    });
    const t = useTranslations('banner');

    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [errors, setErrors] = useState({
        image: '',
        createStart: '',
        createEnd: ''
    });

    const handleDateValidation = () => {
        let hasError = false;
        const newErrors = {
            image: '',
            createStart: '',
            createEnd: ''
        };
        if (formData.createStart) {
            const currentDate = new Date();
            const startDate = new Date(formData.createStart);
            if (startDate < currentDate) {
                newErrors.createStart = t('startDateCannotBeInPast');
                hasError = true;
            }
        }
        if (formData.createStart && formData.createEnd) {
            const start = new Date(formData.createStart);
            const end = new Date(formData.createEnd);
            if (start >= end) {
                newErrors.createEnd = t('endDateMustBeAfterStartDate');
                hasError = true;
            }
            const diffInDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
            if (diffInDays > 7) {
                newErrors.createEnd = t('cannotExceedSevenDays');
                hasError = true;
            }
        }

        setErrors(newErrors);
        return hasError;
    };

    const handleFileChange = (e: any) => {
        if (e.files && e.files.length > 0) {
            const file = e.files[0];
            setFormData((prevState) => ({
                ...prevState,
                image: file
            }));

            const imageUrl = URL.createObjectURL(file);
            setImagePreview(imageUrl);
            setErrors((prevState) => ({ ...prevState, image: '' }));
        } else {
            setImagePreview(null);
        }
    };

    const handleClearFile = () => {
        setFormData((prevState) => ({
            ...prevState,
            image: null
        }));
        setImagePreview(null);
        setErrors((prevState) => ({
            ...prevState,
            image: t('imageRequired')
        }));
    };

    const handleStartChange = (e: any) => {
        setFormData((prevState) => ({
            ...prevState,
            createStart: e.value
        }));
        setErrors((prevState) => ({ ...prevState, createStart: '' }));
        handleDateValidation();
    };

    const handleEndChange = (e: any) => {
        setFormData((prevState) => ({
            ...prevState,
            createEnd: e.value
        }));
        setErrors((prevState) => ({ ...prevState, createEnd: '' }));
        handleDateValidation();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        let hasError = false;
        const newErrors = {
            image: '',
            createStart: '',
            createEnd: ''
        };

        if (!formData.image) {
            newErrors.image = t('imageRequired');
            hasError = true;
        }
        if (!formData.createStart) {
            newErrors.createStart = t('startDateRequired');
            hasError = true;
        }
        if (!formData.createEnd) {
            newErrors.createEnd = t('endDateRequired');
            hasError = true;
        }

        setErrors(newErrors);

        if (hasError) {
            return;
        }

        const formatDate = (date: Date | null | undefined) => {
            return date ? date.toISOString().slice(0, 19) : '';
        };

        const payload = {
            price: formData.price,
            image: formData.image!,
            createStart: formatDate(formData.createStart),
            createEnd: formatDate(formData.createEnd),
            shopId: id
        };

        try {
            setLoading(true);
            await createBanner(payload);
            toast.current?.show({
                severity: 'success',
                summary: t('success'),
                detail: t('bannerCreateSuccess'),
                life: 3000
            });
            router.push('/admin/banner');
        } catch (error) {
            console.error('Error creating banner:', error);
            toast.current?.show({
                severity: 'error',
                summary: t('error'),
                detail: t('bannerCreateFailed'),
                life: 3000
            });
        } finally {
            setLoading(false);
        }

        setFormData({
            price: 0,
            image: null,
            createStart: null,
            createEnd: null
        });
        setImagePreview(null);
        setErrors({
            image: '',
            createStart: '',
            createEnd: ''
        });
        handleClearFile();
    };

    return (
        <div className="flex justify-content-center align-items-center mt-5" style={{ width: '100%' }}>
            <Toast ref={toast} />
            <Spinner isLoading={loading} />

            <Card className="shadow-3 w-full" style={{ padding: '2rem' }}>
                <h2 className="text-center mb-4">{t('createNewBanner')}</h2>
                <form onSubmit={handleSubmit} className="p-fluid">
                    <div className="field grid align-items-center mb-4">
                        <label htmlFor="image" className="col-12 sm:col-3 font-bold text-right" style={{ minWidth: '150px' }}>
                            {t('image')}:
                        </label>
                        <div className="col-12 sm:col-9">
                            <FileUpload
                                name="image"
                                mode="advanced"
                                customUpload
                                accept="image/*"
                                maxFileSize={1000000}
                                onSelect={handleFileChange}
                                onRemove={() => {
                                    handleClearFile();
                                    setImagePreview(null);
                                }}
                                onClear={() => {
                                    setImagePreview(null);
                                }}
                                className="w-full"
                                chooseLabel={t('selectImage')}
                                uploadLabel={t('uploadImage')}
                                style={{ width: '100%' }}
                                chooseOptions={{
                                    icon: 'pi pi-upload',
                                    className: 'p-button custom-choose-button'
                                }}
                                cancelOptions={{
                                    icon: 'pi pi-times',
                                    className: 'p-button custom-cancel-button',
                                    label: t('cancel')
                                }}
                                uploadOptions={{
                                    icon: 'pi pi-cloud-upload',
                                    className: 'p-button custom-upload-button'
                                }}
                            />

                            {imagePreview && (
                                <div className="my-4">
                                    <img src={imagePreview} alt="Preview" className="max-w-[500px] max-h-[200px]" />
                                </div>
                            )}
                            {errors.image && <small className="p-error">{errors.image}</small>}
                        </div>
                    </div>
                    <div className="field grid align-items-center mb-4">
                        <label htmlFor="createStart" className="col-12 sm:col-3 font-bold text-right" style={{ minWidth: '150px' }}>
                            {t('createStart')}
                        </label>
                        <div className="col-12 sm:col-9">
                            <Calendar id="createStart" name="createStart" value={formData.createStart} onChange={handleStartChange} showTime className="w-full" />
                            {errors.createStart && <small className="p-error">{errors.createStart}</small>}
                        </div>
                    </div>
                    <div className="field grid align-items-center mb-4">
                        <label htmlFor="createEnd" className="col-12 sm:col-3 font-bold text-right" style={{ minWidth: '150px' }}>
                            {t('createEnd')}
                        </label>
                        <div className="col-12 sm:col-9">
                            <Calendar id="createEnd" name="createEnd" value={formData.createEnd} onChange={handleEndChange} showTime className="w-full" />
                            {errors.createEnd && <small className="p-error">{errors.createEnd}</small>}
                        </div>
                    </div>
                    <div className="flex justify-center">
                        <Button type="submit" className="mt-2 w-full sm:w-auto custom-button">
                            {t('createBanner')}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default CreateBanner;
