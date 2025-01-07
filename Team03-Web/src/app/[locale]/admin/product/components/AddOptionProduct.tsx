import React, { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { useTranslations } from 'next-intl';
import InputComponent from '@/src/app/[locale]/admin/product/components/Input';

type OptionValue = {
    name: string;
};

type Option = {
    name: string;
    values: OptionValue[];
};

type ProductData = {
    options: Option[];
};

type AddOptionProductProps = {
    onChange: (options: Option[]) => void;
};

export default function AddOptionProduct({ onChange }: AddOptionProductProps) {
    const [productData, setProductData] = useState<ProductData>({ options: [] });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const t = useTranslations('createProduct');

    const validateOptions = (options: Option[]): { [key: string]: string } => {
        const newErrors: { [key: string]: string } = {};
        const allNames = new Set<string>();

        options.forEach((option, optionIndex) => {
            if (option.values.length === 0) {
                newErrors[`option${optionIndex}`] = t('optionMustHaveValue');
            }

            if (option.name && allNames.has(option.name.toLowerCase())) {
                newErrors[`optionName${optionIndex}`] = t('duplicateOptionName');
            } else if (option.name) {
                allNames.add(option.name.toLowerCase());
            }

            option.values.forEach((value, valueIndex) => {
                if (value.name && allNames.has(value.name.toLowerCase())) {
                    newErrors[`optionValue${optionIndex}-${valueIndex}`] = t('duplicateValueName');
                } else if (value.name) {
                    allNames.add(value.name.toLowerCase());
                }
            });
        });

        return newErrors;
    };

    const addOption = () => {
        if (productData.options.length < 2) {
            const newOption: Option = {
                name: '',
                values: [{ name: '' }]
            };
            const updatedOptions = [...productData.options, newOption];
            setProductData({ options: updatedOptions });
            onChange(updatedOptions);
        }
    };

    const updateOption = (optionIndex: number, value: string | OptionValue[], isName: boolean) => {
        const updatedOptions = productData.options.map((option, index) => {
            if (index === optionIndex) {
                return isName ? { ...option, name: value as string } : { ...option, values: value as OptionValue[] };
            }
            return option;
        });

        setProductData({ options: updatedOptions });
        const newErrors = validateOptions(updatedOptions);
        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            onChange(updatedOptions);
        }
    };

    const addOptionValue = (optionIndex: number) => {
        const updatedOptions = productData.options.map((option, index) => {
            if (index === optionIndex) {
                return { ...option, values: [...option.values, { name: '' }] };
            }
            return option;
        });

        setProductData({ options: updatedOptions });
        const newErrors = validateOptions(updatedOptions);
        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            onChange(updatedOptions);
        }
    };

    const removeOptionValue = (optionIndex: number, valueIndex: number) => {
        const updatedOptions = productData.options.map((option, index) => {
            if (index === optionIndex) {
                const updatedValues = option.values.filter((_, i) => i !== valueIndex);
                if (updatedValues.length === 0) {
                    return option;
                }
                return {
                    ...option,
                    values: updatedValues
                };
            }
            return option;
        });

        setProductData({ options: updatedOptions });
        const newErrors = validateOptions(updatedOptions);
        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            onChange(updatedOptions);
        }
    };

    const removeOption = (optionIndex: number) => {
        const updatedOptions = productData.options.filter((_, index) => index !== optionIndex);
        setProductData({ options: updatedOptions });
        const newErrors = validateOptions(updatedOptions);
        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            onChange(updatedOptions);
        }
    };

    return (
        <div>
            {productData.options.map((option, optionIndex) => (
                <div key={optionIndex} className="mb-4 border p-3 rounded">
                    <div className="flex justify-between items-center mb-2">
                        <label className="w-full">
                            {t('optionName')} {optionIndex + 1}:
                        </label>
                    </div>
                    <div className="flex gap-3 justify-center items-center text-center">
                        <div className="relative w-full">
                            <InputComponent value={option.name} setValue={(e) => updateOption(optionIndex, e.target.value, true)} maxLength={20} minLength={1} placeholder={t('optionName')} />
                            {errors[`optionName${optionIndex}`] && <small className="p-error absolute bottom-4 ">{errors[`optionName${optionIndex}`]}</small>}
                        </div>
                        <svg onClick={() => removeOption(optionIndex)} xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000" className="cursor-pointer">
                            <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
                        </svg>
                    </div>

                    <div className="flex mt-5">
                        <label className="w-[180px]">{t('addOptionValue')}:</label>
                        <div className="flex gap-5 items-center w-full flex-wrap">
                            {option.values.map((value, valueIndex) => (
                                <div key={valueIndex} className="flex items-center mb-4">
                                    <div className='relative'>
                                        <InputComponent
                                            value={value.name}
                                            setValue={(e) => {
                                                const updatedValues = [...option.values];
                                                updatedValues[valueIndex].name = e.target.value;
                                                updateOption(optionIndex, updatedValues, false);
                                            }}
                                            minLength={1}
                                            maxLength={20}
                                            placeholder={t('addOptionValue')}
                                        />
                                        {errors[`optionValue${optionIndex}-${valueIndex}`] && <small className="p-error absolute bottom-[-35px] block">{errors[`optionValue${optionIndex}-${valueIndex}`]}</small>}
                                    </div>

                                    {option.values.length > 1 && (
                                        <svg onClick={() => removeOptionValue(optionIndex, valueIndex)} xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000" className="cursor-pointer">
                                            <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z" />
                                        </svg>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {errors[`option${optionIndex}`] && <small className="p-error block mt-2">{errors[`option${optionIndex}`]}</small>}

                    <Button label={t('addOption')} className="bg-black mt-2" onClick={() => addOptionValue(optionIndex)} />
                </div>
            ))}
            {productData.options.length >= 2 ? (
                <div>{t('maxOptionsLimit')}</div>
            ) : (
                <label onClick={addOption} className="flex items-center justify-center max-w-[210px] w-full text-center border-1 border-dashed border-gray-200 rounded-md hover:border-blue-500 cursor-pointer">
                    <div className="text-primary-text text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                    </div>
                    <p className=" text-sm text-primary-text font-semibold">{t('addOptionGroup')}</p>
                </label>
            )}
        </div>
    );
}
