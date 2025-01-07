'use client';
import React, { useState, useEffect } from 'react';
import { Upload, message } from 'antd';
import type { UploadFile, UploadProps } from 'antd';
import ImgCrop from 'antd-img-crop';
import { ProgressSpinner } from 'primereact/progressspinner';
import { addImage } from '@/src/app/[locale]/admin/product/sevice/addImageService';
import { useTranslations } from 'next-intl';
import { getStockByIdProduct } from '@/src/app/[locale]/admin/product/sevice/getStockByIdProduct';
import { Button } from 'primereact/button';

interface Variant {
    id: string;
    value1: string;
    value2: string | null;
    price: number;
    quantity: number;
    image: string | null;
}

interface ProductVariantTableProps {
    idProduct: number | null;
    refreshTrigger?: number;
    onUpdateVariants: (updatedVariants: { id: number; image: string; price: number; quantity: number }[]) => void;
}

const ProductVariantTable: React.FC<ProductVariantTableProps> = ({ idProduct, refreshTrigger, onUpdateVariants }) => {
    const [variants, setVariants] = useState<Variant[]>([]);
    const [uploading, setUploading] = useState<{ [key: string]: boolean }>({});
    const [setPrice, setSetPrice] = useState<number | ''>('');
    const [setQuantity, setSetQuantity] = useState<number | ''>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [option1Name, setOption1Name] = useState<string>('Option 1');
    const [option2Name, setOption2Name] = useState<string | null>(null);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const t = useTranslations('updateProduct');

    useEffect(() => {
        const fetchProductStock = async () => {
            try {
                setLoading(true);
                if (idProduct != null) {
                    const resp = await getStockByIdProduct(idProduct);

                    if (resp.data && resp.data.data) {
                        const transformedVariants = resp.data.data.map((variant: any) => ({
                            id: variant.variantId.toString(),
                            value1: variant.option1?.value?.name || 'Default',
                            value2: variant.option2?.value?.name || null,
                            price: variant.oldPrice || 0,
                            quantity: variant.quantity || 0,
                            image: variant.image || null
                        }));
                        setVariants(transformedVariants);

                        if (resp.data.data.length > 0) {
                            setOption1Name(resp.data.data[0].option1?.name || 'Option 1');
                            setOption2Name(resp.data.data[0].option2?.name || null);
                        }
                    }
                }
            } catch (error) {
                console.error('Failed to fetch product data', error);
                message.error('Failed to fetch product data');
            } finally {
                setLoading(false);
            }
        };

        if (idProduct != null) {
            fetchProductStock();
        }
    }, [idProduct, refreshTrigger]);

    useEffect(() => {
        const updatedData = variants.map((v) => ({
            id: parseInt(v.id),
            image: v.image || '',
            price: v.price,
            quantity: v.quantity
        }));
        onUpdateVariants(updatedData);
    }, [variants]);

    const options = {
        value1: [...new Set(variants.map((v) => v.value1))],
        value2: option2Name ? [...new Set(variants.map((v) => v.value2).filter(Boolean))] : ['']
    };

    const handleInputChange = (index: number, field: keyof Variant, value: any) => {
        if (value <= 0) {
            message.error('Value must be greater than 0');
            setErrors((prev) => ({
                ...prev,
                [`${field}-${index}`]: 'Value must be greater than 0'
            }));
            return;
        }

        setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[`${field}-${index}`];
            return newErrors;
        });

        const updatedVariants = [...variants];
        updatedVariants[index] = {
            ...updatedVariants[index],
            [field]: value
        };
        setVariants(updatedVariants);
    };

    const handleImageUpload = async (index: number, file: File) => {
        const variant = variants[index];
        const variantKey = option2Name ? `${variant.value1}-${variant.value2}` : variant.value1;

        setUploading((prev) => ({ ...prev, [variantKey]: true }));

        try {
            const resp = await addImage(file);
            const imageUrl = resp.data;

            const updatedVariants = [...variants];
            updatedVariants[index] = {
                ...updatedVariants[index],
                image: imageUrl
            };
            setVariants(updatedVariants);

            return imageUrl;
        } catch (error) {
            console.error(`Failed to upload image for variant ${variantKey}`, error);
            message.error('Upload failed');
            return null;
        } finally {
            setUploading((prev) => ({ ...prev, [variantKey]: false }));
        }
    };

    const applyToAll = () => {
        if (setPrice !== '' || setQuantity !== '') {
            const updatedVariants = variants.map((variant) => ({
                ...variant,
                price: setPrice !== '' ? setPrice : variant.price,
                quantity: setQuantity !== '' ? setQuantity : variant.quantity
            }));
            setVariants(updatedVariants);
        }
    };

    const getUploadButton = (variant: Variant, index: number) => {
        const variantKey = option2Name ? `${variant.value1}-${variant.value2}` : variant.value1;

        return (
            <div className="flex flex-col items-center text-center justify-center w-full h-full cursor-pointer">
                {uploading[variantKey] ? (
                    <div className="flex justify-center items-center">
                        <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="4" fill="var(--surface-ground)" animationDuration=".5s" />
                    </div>
                ) : (
                    <>
                        <div className="text-primary-text">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                        </div>
                        <p className="mt-2 text-sm text-primary-text font-semibold">Add Image</p>
                    </>
                )}
            </div>
        );
    };

    const handleRemoveImage = (index: number) => {
        const updatedVariants = [...variants];
        updatedVariants[index] = {
            ...updatedVariants[index],
            image: null
        };
        setVariants(updatedVariants);
    };

    if (loading) return <div>Loading...</div>;

    const handleSetPriceChange = (value: string) => {
        const parsedValue = value === '' ? '' : parseFloat(value);
        if (parsedValue !== '' && parsedValue <= 0) {
            message.error('Price must be greater than 0');
            setErrors((prev) => ({
                ...prev,
                setPrice: 'Price must be greater than 0'
            }));
            return;
        }
        setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors.setPrice;
            return newErrors;
        });
        setSetPrice(parsedValue);
    };

    const handleSetQuantityChange = (value: string) => {
        const parsedValue = value === '' ? '' : parseInt(value);
        if (parsedValue !== '' && parsedValue <= 0) {
            message.error('Quantity must be greater than 0');
            setErrors((prev) => ({
                ...prev,
                setQuantity: 'Quantity must be greater than 0'
            }));
            return;
        }
        setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors.setQuantity;
            return newErrors;
        });
        setSetQuantity(parsedValue);
    };

    return (
        <div className="p-4">
            <p>{t('applyToAll')}</p>
            <div className="flex h-[50px] mt-3 mb-6 gap-4">
                <table className="w-[50%]">
                    <tbody>
                        <tr>
                            <td className="border border-gray-300 px-4 py-2 text-center">
                                <input type="number" value={setPrice} onChange={(e) => handleSetPriceChange(e.target.value)} className="w-full px-2 py-1 border rounded" placeholder={t('setPrice')} />
                            </td>
                            <td className="border border-gray-300 px-4 py-2 text-center">
                                <input type="number" value={setQuantity} onChange={(e) => handleSetQuantityChange(e.target.value)} className="w-full px-2 py-1 border rounded" placeholder={t('setQuantity')} />
                            </td>
                        </tr>
                    </tbody>
                </table>
                <Button label={t('applyToAll')} className="bg-black w-auto p-2  font-medium rounded text-white" onClick={applyToAll} />
            </div>
            <table className="table-auto w-full border-collapse border border-gray-300">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-4 py-2">{option1Name}</th>
                        {option2Name && <th className="border border-gray-300 px-4 py-2">{option2Name}</th>}
                        <th className="border border-gray-300 px-4 py-2">Price (₫)</th>
                        <th className="border border-gray-300 px-4 py-2">Quantity</th>
                        <th className="border border-gray-300 px-4 py-2">Image</th>
                    </tr>
                </thead>
                <tbody>
                    {options.value1.map((value1, value1Index) => (
                        <React.Fragment key={value1Index}>
                            {options.value2.map((value2, value2Index) => {
                                const index = variants.findIndex((v) => v.value1 === value1 && (option2Name ? v.value2 === value2 : true));
                                const variant = variants[index];

                                if (!variant) return null;

                                return (
                                    <tr key={`${value1}-${value2}`} className="odd:bg-white even:bg-gray-50">
                                        {value2Index === 0 && (
                                            <td rowSpan={option2Name ? options.value2.length : 1} className="border border-gray-300 px-4 py-2 font-medium text-center align-middle">
                                                {value1}
                                            </td>
                                        )}
                                        {option2Name && value2 && <td className="border border-gray-300 px-4 py-2 text-center">{value2}</td>}
                                        <td className="border border-gray-300 px-4 py-2 text-center">
                                            <input type="number" value={variant.price} onChange={(e) => handleInputChange(index, 'price', parseFloat(e.target.value))} className="w-full px-2 py-1 border rounded" />
                                            {errors[`price-${index}`] && <small className="text-red-500">{errors[`price-${index}`]}</small>}
                                        </td>
                                        <td className="border border-gray-300 px-4 py-2 text-center">
                                            <input type="number" value={variant.quantity} onChange={(e) => handleInputChange(index, 'quantity', parseInt(e.target.value))} className="w-full px-2 py-1 border rounded" />
                                            {errors[`quantity-${index}`] && <small className="text-red-500">{errors[`quantity-${index}`]}</small>}
                                        </td>
                                        <td className="border border-gray-300 px-4 py-2 text-center relative">
                                            <ImgCrop>
                                                <Upload
                                                    listType="picture-card"
                                                    showUploadList={false}
                                                    beforeUpload={async (file) => {
                                                        const uploadedImage = await handleImageUpload(index, file);
                                                        return uploadedImage ? false : Upload.LIST_IGNORE;
                                                    }}
                                                >
                                                    {variant.image ? (
                                                        <div className="relative group">
                                                            <img src={variant.image} alt={`${value1} ${value2}`} className="w-25 h-25 rounded-lg object-cover mx-auto" />
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleRemoveImage(index);
                                                                }}
                                                                className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-2 h-5 flex items-center justify-center text-xs"
                                                            >
                                                                X
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        getUploadButton(variant, index)
                                                    )}
                                                </Upload>
                                            </ImgCrop>
                                        </td>
                                    </tr>
                                );
                            })}
                        </React.Fragment>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ProductVariantTable;
