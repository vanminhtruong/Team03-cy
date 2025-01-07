'use client';

import React, { useEffect, useRef, useState } from 'react';
import AddImageButton from '@/src/app/[locale]/admin/product/update/components/AddImage';
import InputComponent from '@/src/app/[locale]/admin/product/components/Input';
import { Button } from 'primereact/button';
import SelectCategory from '@/src/app/[locale]/admin/product/update/components/SelectCategory';
import { Toast } from 'primereact/toast';
import Spinner from '@/src/components/spinner/spinner';
import AddOptionProduct from '@/src/app/[locale]/admin/product/update/components/AddOptionProduct';
import TableStock from '@/src/app/[locale]/admin/product/update/components/TableStock';
import { getProductById } from '@/src/app/[locale]/admin/product/sevice/getProductById';
import { updateStock } from '@/src/app/[locale]/admin/product/sevice/updateStock';
import { updateProduct } from '@/src/app/[locale]/admin/product/sevice/updateProduct';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import InputTextareaComponent from '@/src/app/[locale]/admin/product/components/InputTextareaComponent';

export interface ProductData {
    files: File[];
    name: string;
    description: string;
    categoryId: number;
    user_id: number;
    options?: any[];
    variants?: any[];
    note?: string;
}

const CreateProduct = () => {
    const t = useTranslations('updateProduct');
    const [activeTab, setActiveTab] = useState('tab-1');
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
    const [productName, setProductName] = useState('');
    const [productDescription, setProductDescription] = useState('');
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [options, setOptions] = useState<any[]>([]);
    const [variants, setVariants] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [productByIdData, setProductByIdData] = useState<any>(null);
    const [refreshStock, setRefreshStock] = useState(0);

    const userData = localStorage.getItem('user');
    const toast = useRef<Toast>(null);
    const searchParams = useSearchParams();
    const productId = searchParams.get('id');

    const handleTriggerStockRefresh = () => {
        setRefreshStock((prev) => prev + 1);
    };

    const sectionRefs = {
        'tab-1': useRef<HTMLDivElement>(null),
        'tab-2': useRef<HTMLDivElement>(null)
    };

    const tabs = [
        { id: 'tab-1', label: t('tabs.basicInfo') },
        { id: 'tab-2', label: t('tabs.salesInfo') }
    ];

    const showMessage = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    const scrollToSection = (sectionId: string) => {
        const sectionRef = sectionRefs[sectionId as keyof typeof sectionRefs];
        setActiveTab(sectionId);
        if (sectionRef.current) {
            const navHeight = 150;
            const elementPosition = sectionRef.current.getBoundingClientRect().top + window.pageYOffset;
            const offsetPosition = elementPosition - navHeight;
            window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        }
    };

    const handleImagesChange = (images: File[]) => {
        setSelectedFiles(images);
    };

    const handleOptionsChange = (updatedOptions: any) => {
        setOptions(updatedOptions);
    };

    const handleCategorySelect = (categoryId: number) => {
        setSelectedCategoryId(categoryId);
    };

    const prepareFormData = () => {
        const user = userData ? JSON.parse(userData) : null;
        const userId = user?.state?.id;

        if (!userId) {
            showMessage('error', 'Error', t('errors.userNotFound'));
            return null;
        }

        const formData = new FormData();
        formData.append('name', productName);
        formData.append('description', productDescription);
        formData.append('categoryId', selectedCategoryId?.toString() || '');
        formData.append('user_id', userId.toString());
        if (options.length > 0) formData.append('options', JSON.stringify(options));
        selectedFiles.forEach((file) => formData.append('files', file));

        return formData;
    };

    const validateForm = () => {
        let isValid = true;

        if (productName.trim().length < 10 || productName.trim().length > 100) {
            showMessage('error', 'Error', t('errors.invalidProductName'));
            isValid = false;
        }

        if (productDescription.trim().length < 50 || productDescription.trim().length > 3000) {
            showMessage('error', 'Error', t('errors.invalidProductDescription'));
            isValid = false;
        }

        if (!selectedCategoryId) {
            showMessage('error', 'Error', t('errors.invalidCategory'));
            isValid = false;
        }

        return isValid;
    };

    useEffect(() => {
        const fetchData = async () => {
            if (productId) {
                const numericProductId = Number(productId);

                if (!isNaN(numericProductId)) {
                    try {
                        setIsLoading(true);
                        const res = await getProductById(numericProductId);
                        const productData = res.data.data;

                        if (productData) {
                            setIsLoading(false);
                            setProductByIdData(productData);
                            setSelectedFiles(productData.variants.images);
                            setProductName(productData.productName || '');
                            setProductDescription(productData.description || '');
                            setSelectedCategoryId(productData.category.categoryId);
                        }
                    } catch (error) {
                        setIsLoading(false);
                        console.error('Error fetching product:', error);
                        showMessage('error', 'Error', t('errors.productLoadError'));
                    }
                } else {
                    setIsLoading(false);
                    console.error('Invalid product ID');
                    showMessage('error', 'Error', t('errors.invalidProductId'));
                }
            }
        };

        fetchData();
    }, [productId, t, refreshStock]);

    const handleUpdateProduct = async () => {
        if (!validateForm()) return;

        const formData = prepareFormData();
        if (!formData) return;
        const numericProductId = Number(productId);

        try {
            setIsLoading(true);
            const resp = await updateProduct(numericProductId, formData);
            if (resp.data.status === 200) {
                setIsLoading(false);
                try {
                    setIsLoading(true);
                    const resp = await updateStock(variants);
                    if (resp.data.status === 201) {
                        setIsLoading(false);
                        showMessage('success', 'Success', t('messages.productUpdatedSuccess'));
                    }
                } catch (e) {
                    setIsLoading(false);
                    console.error('Error updating stock:', e);
                    showMessage('error', 'Error', t('errors.stockUpdateError'));
                }
            }
        } catch (e) {
            setIsLoading(false);
            console.error('Error updating product:', e);
            showMessage('error', 'Error', t('errors.productUpdateError'));
        }
    };

    return (

            <div className="relative card h-full">
                <Toast ref={toast} />
                <Spinner isLoading={isLoading} />

                <div className="sticky z-[10] top-[70px] bg-gray-50 w-full p-3 rounded shadow my-3">
                    <ul className="flex flex-wrap border-b border-gray-200">
                        {tabs.map((tab) => (
                            <li
                                key={tab.id}
                                onClick={() => scrollToSection(tab.id)}
                                className={`tab-button px-2 md:px-4 py-2 text-base md:text-lg font-medium cursor-pointer ${activeTab === tab.id ? 'text-black border-b-[3px] border-black' : 'text-gray-600 hover:text-primary-text hover:border-black'}`}
                            >
                                {tab.label}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="card h-full">
                    <div ref={sectionRefs['tab-1']} className="w-full top-[65px] rounded shadow p-4 my-5">
                        <h3 className="text-xl font-semibold mb-4">{t('tabs.basicInfo')}</h3>
                        <div className="flex flex-col gap-4">
                            <p>
                                <span className="text-red-600">*</span> {t('basicInfoSection.productImages')} <i
                                className="italic text-gray-400 text-[12px]">({t('basicInfoSection.productImagesNote')})</i>
                            </p>
                            <AddImageButton initialImages={productByIdData?.images || []}
                                            onImagesChange={handleImagesChange} />
                            <div className="flex flex-col gap-5">
                                <div className="sm:flex items-center gap-3">
                                    <label className="w-full max-w-[150px]">
                                        <span className="text-red-600">*</span> {t('basicInfoSection.productName')}
                                    </label>
                                    <InputComponent placeholder={t('basicInfoSection.productName')} value={productName}
                                                    setValue={(e) => setProductName(e.target.value)} minLength={10}
                                                    maxLength={100} />
                                </div>

                                <div className="sm:flex items-center gap-3">
                                    <label className="w-full max-w-[150px]">
                                        <span className="text-red-600">*</span> {t('basicInfoSection.category')}
                                    </label>
                                    <SelectCategory idchild={selectedCategoryId}
                                                    onCategorySelect={handleCategorySelect} />
                                </div>

                                <div className="sm:flex items-start gap-3">
                                    <label className="w-full max-w-[150px]">
                                        <span
                                            className="text-red-600">*</span> {t('basicInfoSection.productDescription')}
                                    </label>
                                    <InputTextareaComponent placeholder={t('basicInfoSection.productDescription')}
                                                            rows={8} value={productDescription}
                                                            setValue={(value) => setProductDescription(value)}
                                                            minLength={50} maxLength={4000} />
                                </div>
                            </div>

                            <div className="mt-5 flex flex-col gap-3">
                                <label className="w-full mb-3">
                                    {t('basicInfoSection.optionalClassification')} <i
                                    className="text-sm font-medium text-gray-500">{t('basicInfoSection.optionalClassificationNote')}</i>
                                </label>
                                <AddOptionProduct variants={productByIdData?.variants || []}
                                                  onChange={handleOptionsChange} productId={productId || undefined}
                                                  onRefreshStock={handleTriggerStockRefresh} />
                            </div>
                        </div>
                    </div>
                    <div>
                        <div ref={sectionRefs['tab-2']} className="w-full top-[65px] rounded shadow p-4 my-5">
                            <h3 className="text-xl font-semibold mb-4">{t('tabs.salesInfo')}</h3>
                            <TableStock
                                idProduct={productId ? parseInt(productId) : null}
                                refreshTrigger={refreshStock}
                                onUpdateVariants={(updatedVariants) => {
                                    setVariants(updatedVariants);
                                }}
                            />
                        </div>
                        <div className="w-full top-[65px] rounded shadow p-4 my-5">
                            <div className="mt-6 flex justify-end">
                                <Button label={t('buttons.complete')} onClick={handleUpdateProduct}
                                        className="bg-black hover:bg-white hover:text-black  uppercase px-6 py-3 rounded" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            );
            };

            export default CreateProduct;
