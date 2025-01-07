'use client';

import React, { useRef, useState } from 'react';
import { z } from 'zod';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import AddImageButton from '@/src/app/[locale]/admin/product/components/AddImage';
import InputComponent from '@/src/app/[locale]/admin/product/components/Input';
import SelectCategory from '@/src/app/[locale]/admin/product/components/SelectCategory';
import Spinner from '@/src/components/spinner/spinner';
import AddOptionProduct from '@/src/app/[locale]/admin/product/components/AddOptionProduct';
import { useRouter } from '@/src/i18n/routing';
import { createProduct } from '@/src/app/[locale]/admin/product/sevice/createproductService';
import { useTranslations } from 'next-intl';
import InputTextareaComponent from '@/src/app/[locale]/admin/product/components/InputTextareaComponent';

interface ValidationErrors {
    [key: string]: string | ValidationErrors[];
}

const productSchema = z.object({
    name: z
        .string()
        .min(10, { message: 'Product name must be at least 10 characters' })
        .max(100, { message: 'Product name cannot exceed 100 characters' })
        .refine((val) => val.trim().length > 0, { message: 'Product name cannot be empty' }),
    description: z
        .string()
        .min(50, { message: 'Description must be at least 50 characters' })
        .max(3000, { message: 'Description cannot exceed 3000 characters' })
        .refine((val) => val.trim().length > 0, { message: 'Description cannot be empty' }),
    categoryId: z
        .number({
            required_error: 'Category is required',
            invalid_type_error: 'Please select a valid category'
        })
        .min(1, { message: 'Please select a category' }),
    files: z.array(z.instanceof(File)).min(1, { message: 'At least one image is required' }).max(10, { message: 'Maximum 10 images allowed' }),
    options: z
        .array(
            z.object({
                name: z.string().min(1, { message: 'Option name is required' }),
                values: z
                    .array(
                        z.object({
                            name: z.string().min(1, { message: 'Value cannot be empty' })
                        })
                    )
                    .min(1, { message: 'At least one option value is required' })
            })
        )
        .optional()
});

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

const CreateProduct: React.FC = () => {
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
    const [productName, setProductName] = useState<string>('');
    const [productDescription, setProductDescription] = useState<string>('');
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [options, setOptions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [errors, setErrors] = useState<ValidationErrors>({});

    const t = useTranslations('createProduct');
    const userData = localStorage.getItem('user');
    const toast = useRef<Toast>(null);
    const router = useRouter();

    const showMessage = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    const handleImagesChange = (images: File[]) => {
        setSelectedFiles(images);
        if (errors.files) {
            const newErrors = { ...errors };
            delete newErrors.files;
            setErrors(newErrors);
        }
    };

    const handleOptionsChange = (updatedOptions: any) => {
        setOptions(updatedOptions);
        if (errors.options) {
            const newErrors = { ...errors };
            delete newErrors.options;
            setErrors(newErrors);
        }
    };

    const handleCategorySelect = (categoryId: number) => {
        setSelectedCategoryId(categoryId);
        if (errors.categoryId) {
            const newErrors = { ...errors };
            delete newErrors.categoryId;
            setErrors(newErrors);
        }
    };

    const validateForm = (): boolean => {
        try {
            const productData: ProductData = {
                name: productName,
                description: productDescription,
                categoryId: selectedCategoryId!,
                files: selectedFiles,
                user_id: 0,
                options
            };

            productSchema.parse(productData);
            setErrors({});
            return true;
        } catch (error) {
            if (error instanceof z.ZodError) {
                const newErrors: ValidationErrors = {};
                error.errors.forEach((err) => {
                    newErrors[err.path[0].toString()] = err.message;
                });
                setErrors(newErrors);
                showMessage('error', t('messages.validationError'), error.errors[0].message);
            }
            return false;
        }
    };

    const handleSubmit = async () => {
        const user = userData ? JSON.parse(userData) : null;
        const userId = user?.state?.id;
        if (!userId) {
            showMessage('error', t('messages.error'), t('messages.userNotFound'));
            console.log('User not found');
            return;
        }

        if (!validateForm()) {
            return;
        }

        try {
            setIsLoading(true);

            const formData = new FormData();
            formData.append('name', productName.trim());
            formData.append('description', productDescription.trim());
            formData.append('categoryId', selectedCategoryId!.toString());
            formData.append('user_id', userId.toString());

            if (options && options.length > 0) {
                formData.append('options', JSON.stringify(options));
            }

            selectedFiles.forEach((file) => {
                formData.append('files', file);
            });

            const response = await createProduct(formData);

            showMessage('success', t('messages.success'), t('messages.productAdded'));

            if (response && response.data.data) {
                const newParams = new URLSearchParams();
                newParams.set('id', response.data.data);
                router.push(`/admin/product/update?${newParams.toString()}`, { scroll: false });
            }
        } catch (error) {
            showMessage('error', t('messages.unexpectedError'), t('messages.unexpectedErrorDetail'));
            console.error('Error creating product:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="card h-full">
            <div className="relative">
                <Toast ref={toast} />
                <Spinner isLoading={isLoading} />

                <h3 className="text-2xl w-full text-center font-semibold mb-4 uppercase">{t('pageTitle')}</h3>

                <div className="w-full top-[65px] rounded shadow p-4 my-5">
                    <h3 className="text-xl font-semibold mb-4">{t('basicInfoTitle')}</h3>

                    <div className="flex flex-col gap-4">
                        <div className="relative">
                            <p>
                                <span className="text-red-600">*</span> {t('productImages')}
                                <i className="italic text-gray-400 text-[12px]">{t('imageSizeNote')}</i>
                            </p>
                            <AddImageButton onImagesChange={handleImagesChange} />
                            {errors.files && typeof errors.files === 'string' && <small className="text-red-500 text-sm mt-1 block">{errors.files}</small>}
                        </div>

                        <div className="flex flex-col gap-5">
                            <div className="sm:flex items-center gap-3">
                                <label className="w-full max-w-[150px]">
                                    <span className="text-red-600">*</span> {t('productName')}
                                </label>
                                <div className="flex-1">
                                    <InputComponent
                                        placeholder={t('productName')}
                                        value={productName}
                                        setValue={(e) => {
                                            setProductName(e.target.value);
                                            if (errors.name) {
                                                const newErrors = { ...errors };
                                                delete newErrors.name;
                                                setErrors(newErrors);
                                            }
                                        }}
                                        minLength={10}
                                        maxLength={100}
                                    />
                                </div>
                            </div>

                            <div className="sm:flex items-center gap-3">
                                <label className="w-full max-w-[150px]">
                                    <span className="text-red-600">*</span> {t('category')}
                                </label>
                                <div className="flex-1">
                                    <SelectCategory idchild={selectedCategoryId} onCategorySelect={handleCategorySelect} />
                                    {errors.categoryId && typeof errors.categoryId === 'string' && <small className="text-red-500 text-sm mt-1 block">{errors.categoryId}</small>}
                                </div>
                            </div>

                            <div className="sm:flex items-start gap-3">
                                <label className="w-full max-w-[150px]">
                                    <span className="text-red-600">*</span> {t('productDescription')}
                                </label>
                                <div className="flex-1">
                                    <InputTextareaComponent
                                        placeholder={t('productDescription')}
                                        rows={8}
                                        value={productDescription}
                                        setValue={(value) => {
                                            setProductDescription(value);
                                            if (errors.description) {
                                                const newErrors = { ...errors };
                                                delete newErrors.description;
                                                setErrors(newErrors);
                                            }
                                        }}
                                        minLength={50}
                                        maxLength={4000}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-5 flex flex-col gap-3">
                            <label className="w-full mb-3">
                                {t('optionalGroup')}
                                <i className="text-sm font-medium text-gray-500">{t('optionalGroupNote')}</i>
                            </label>
                            <AddOptionProduct onChange={handleOptionsChange} />
                            {errors.options && typeof errors.options === 'string' && <small className="text-red-500 text-sm mt-1 block">{errors.options}</small>}
                        </div>
                    </div>

                    <div className="w-full  p-2 my-5">
                        <div className="flex justify-end">
                            <Button label={t('saveButton')} onClick={handleSubmit} className="bg-black uppercase text-white p-3 rounded hover:bg-gray-800 transition-colors" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateProduct;
