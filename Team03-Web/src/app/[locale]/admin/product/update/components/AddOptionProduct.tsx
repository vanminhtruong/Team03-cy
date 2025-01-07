import React, { useState, useEffect, useRef } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { deleteOption } from '@/src/app/[locale]/admin/product/sevice/deleteOption';
import { deleteOptionValue } from '@/src/app/[locale]/admin/product/sevice/deleteOptionValue';
import { addOptionService } from '@/src/app/[locale]/admin/product/sevice/addOption';
import { addOptionValueService } from '@/src/app/[locale]/admin/product/sevice/addOptionValue';
import { useTranslations } from 'next-intl';
import { updateOptionById } from '@/src/app/[locale]/admin/product/sevice/updateOptionById';
import { updateValueById } from '@/src/app/[locale]/admin/product/sevice/updateValueById';
import InputComponent from '@/src/app/[locale]/admin/product/update/components/Input';

type OptionValue = {
    valueId?: number;
    name: string;
};

type Option = {
    optionId?: number;
    name: string;
    values: OptionValue[];
};

type AddOptionProductProps = {
    onChange: (options: Option[]) => void;
    variants?: any[];
    productId?: any;
    onRefreshStock?: () => void;
};

export default function AddOptionProduct({ onChange, variants = [], productId, onRefreshStock }: AddOptionProductProps) {
    const toastRef = useRef<Toast>(null);
    const [productData, setProductData] = useState<Option[]>([]);
    const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>({});
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const t = useTranslations('updateProduct');

    const transformVariantsToOptions = (variants: any[]): Option[] => {
        if (!variants || variants.length === 0) return [];

        const optionsMap = new Map<string, Option>();
        variants.forEach((variant) => {
            [variant.option1, variant.option2].forEach((option) => {
                if (option) {
                    if (!optionsMap.has(option.name)) {
                        optionsMap.set(option.name, {
                            optionId: option.optionId,
                            name: option.name,
                            values: []
                        });
                    }
                    const currentOption = optionsMap.get(option.name)!;
                    if (!currentOption.values.some((v) => v.name === option.value.name)) {
                        currentOption.values.push({
                            valueId: option.value.valueId,
                            name: option.value.name
                        });
                    }
                }
            });
        });

        return Array.from(optionsMap.values());
    };

    useEffect(() => {
        const transformedOptions = transformVariantsToOptions(variants);
        setProductData(transformedOptions);
        onChange(transformedOptions);
    }, [variants]);

    const validateOptionName = (name: string, currentOptionIndex: number): boolean => {
        if (!name.trim()) {
            toastRef.current?.show({
                severity: 'error',
                summary: 'Lỗi',
                detail: 'Tên phân loại không được để trống'
            });
            setErrors((prev) => ({
                ...prev,
                [`option-${currentOptionIndex}`]: 'Tên phân loại không được để trống'
            }));
            return false;
        }

        const isDuplicate = productData.some((option, index) => index !== currentOptionIndex && option.name.trim().toLowerCase() === name.trim().toLowerCase());

        if (isDuplicate) {
            toastRef.current?.show({
                severity: 'error',
                summary: 'Lỗi',
                detail: 'Tên phân loại đã tồn tại'
            });
            setErrors((prev) => ({
                ...prev,
                [`option-${currentOptionIndex}`]: 'Tên phân loại đã tồn tại'
            }));
            return false;
        }

        setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[`option-${currentOptionIndex}`];
            return newErrors;
        });
        return true;
    };

    const validateOptionValue = (value: string, values: OptionValue[], currentValueIndex: number, optionIndex: number): boolean => {
        if (!value.trim()) {
            toastRef.current?.show({
                severity: 'error',
                summary: 'Lỗi',
                detail: 'Giá trị tùy chọn không được để trống'
            });
            setErrors((prev) => ({
                ...prev,
                [`value-${optionIndex}-${currentValueIndex}`]: 'Giá trị tùy chọn không được để trống'
            }));
            return false;
        }

        const isDuplicate = values.some((v, index) => index !== currentValueIndex && v.name.trim().toLowerCase() === value.trim().toLowerCase());

        if (isDuplicate) {
            toastRef.current?.show({
                severity: 'error',
                summary: 'Lỗi',
                detail: 'Giá trị tùy chọn đã tồn tại trong phân loại này'
            });
            setErrors((prev) => ({
                ...prev,
                [`value-${optionIndex}-${currentValueIndex}`]: 'Giá trị tùy chọn đã tồn tại'
            }));
            return false;
        }

        setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[`value-${optionIndex}-${currentValueIndex}`];
            return newErrors;
        });
        return true;
    };

    const saveOptionToService = async (option: Option, type: 'name' | 'value' = 'name') => {
        if (!productId) {
            console.error('Product ID is required to save option');
            return null;
        }

        const loadingKey = type === 'name' ? option.name : option.values[0].name;

        try {
            setIsLoading((prev) => ({ ...prev, [loadingKey]: true }));

            const validValues = option.values.filter((value) => value.name.trim() !== '');

            if (validValues.length === 0) {
                console.error('At least one value is required');
                toastRef.current?.show({
                    severity: 'error',
                    summary: 'Lỗi',
                    detail: 'Phải có ít nhất một giá trị tùy chọn'
                });
                return null;
            }

            const optionData = {
                name: option.name.trim(),
                values: validValues.map((value) => ({
                    name: value.name.trim(),
                    valueId: value.valueId
                }))
            };

            let currentOptionId = option.optionId;

            if (!currentOptionId) {
                if (!optionData.name) {
                    console.error('Option name is required');
                    return null;
                }

                const savedOption = await addOptionService(productId, optionData);
                onRefreshStock?.();
                currentOptionId = savedOption.data.optionId;
            }

            const savedValues = await Promise.all(
                validValues.map(async (value) => {
                    if (value.valueId) {
                        await updateValueById(value.valueId, { name: value.name });
                        return value;
                    }

                    if (!currentOptionId) {
                        console.error('No option ID available');
                        return value;
                    }

                    const savedValue = await addOptionValueService(productId, {
                        name: value.name.trim(),
                        optionId: currentOptionId
                    });
                    onRefreshStock?.();
                    return savedValue.data;
                })
            );

            setProductData((prevData) =>
                prevData.map((opt) =>
                    opt.name === option.name
                        ? {
                              ...opt,
                              optionId: currentOptionId,
                              values: savedValues
                          }
                        : opt
                )
            );

            toastRef.current?.show({
                severity: 'success',
                summary: 'Thành công',
                detail: type === 'name' ? 'Đã lưu tên phân loại' : 'Đã lưu tùy chọn'
            });

            return { optionId: currentOptionId, savedValues };
        } catch (error) {
            console.error('Failed to save option:', error);
            toastRef.current?.show({
                severity: 'error',
                summary: 'Lỗi',
                detail: 'Không thể lưu tùy chọn'
            });
            throw error;
        } finally {
            setIsLoading((prev) => ({ ...prev, [loadingKey]: false }));
        }
    };

    const handleOptionNameBlur = async (optionIndex: number) => {
        const option = productData[optionIndex];

        if (!validateOptionName(option.name, optionIndex)) {
            return;
        }

        if (option.name.trim() !== '') {
            try {
                await updateOption(optionIndex, option.name, true); // Update the option name
                await saveOptionToService(option, 'name');
            } catch (error) {
                console.error('Error saving option name:', error);
            }
        }
    };
    const handleOptionValueBlur = async (optionIndex: number, valueIndex: number) => {
        const option = productData[optionIndex];
        const value = option.values[valueIndex];

        if (!validateOptionValue(value.name, option.values, valueIndex, optionIndex)) {
            return;
        }

        if (value.name.trim() !== '') {
            try {
                const updatedValues = option.values.map((v, i) => (i === valueIndex ? { ...v, name: value.name } : v));
                await updateOption(optionIndex, updatedValues, false);
                await saveOptionToService(option, 'value');
                onRefreshStock?.();
            } catch (error) {
                console.error('Error saving option value:', error);
            }
        }
    };
    const addOption = () => {
        if (productData.length < 2) {
            const newOption: Option = {
                name: '',
                values: [{ name: '' }]
            };
            const updatedOptions = [...productData, newOption];
            setProductData(updatedOptions);
            onChange(updatedOptions);
        }
    };

    const updateOption = async (optionIndex: number, value: string | OptionValue[], isName: boolean) => {
        const optionToUpdate = productData[optionIndex];

        if (optionToUpdate.optionId) {
            try {
                const updatedOptionData = isName
                    ? { ...optionToUpdate, name: value as string }
                    : {
                          ...optionToUpdate,
                          values: value as OptionValue[]
                      };

                const dataToUpdate = { name: updatedOptionData.name };

                await updateOptionById(optionToUpdate.optionId, dataToUpdate);
                onRefreshStock?.();
                const updatedOptions = productData.map((option, index) => {
                    if (index === optionIndex) {
                        return updatedOptionData;
                    }
                    return option;
                });

                setProductData(updatedOptions);
                onChange(updatedOptions);
            } catch (error) {
                console.error('Failed to update option:', error);
            }
        } else {
            const updatedOptions = productData.map((option, index) => {
                if (index === optionIndex) {
                    return isName
                        ? { ...option, name: value as string }
                        : {
                              ...option,
                              values: value as OptionValue[]
                          };
                }
                return option;
            });

            setProductData(updatedOptions);
            onChange(updatedOptions);
        }
    };

    const addOptionValue = (optionIndex: number) => {
        const updatedOptions = productData.map((option, index) => {
            if (index === optionIndex) {
                return {
                    ...option,
                    values: [...option.values, { name: '' }]
                };
            }
            return option;
        });
        setProductData(updatedOptions);
        onChange(updatedOptions);
    };

    const removeOptionValue = async (optionIndex: number, valueIndex: number) => {
        try {
            const optionToUpdate = productData[optionIndex];
            const valueToRemove = optionToUpdate.values[valueIndex];

            if (valueToRemove.valueId) {
                await deleteOptionValue(valueToRemove.valueId);
            }

            const updatedOptions = productData.map((option, index) => {
                if (index === optionIndex) {
                    return {
                        ...option,
                        values: option.values.filter((_, i) => i !== valueIndex)
                    };
                }
                return option;
            });

            setProductData(updatedOptions);
            onChange(updatedOptions);

            if (productId && updatedOptions[optionIndex]) {
                await saveOptionToService(updatedOptions[optionIndex]);
                onRefreshStock?.();
            }
        } catch (error) {
            console.error('Failed to remove option value:', error);
            toastRef.current?.show({
                severity: 'error',
                summary: 'Lỗi',
                detail: 'Không thể xóa tùy chọn'
            });
        }
    };

    const removeOption = async (optionIndex: number) => {
        const optionToDelete = productData[optionIndex];

        if (!optionToDelete?.optionId) {
            const updatedOptions = productData.filter((_, index) => index !== optionIndex);
            setProductData(updatedOptions);
            onChange(updatedOptions);
            return;
        }

        try {
            await deleteOption(optionToDelete.optionId, productId);
            const updatedOptions = productData.filter((_, index) => index !== optionIndex);
            setProductData(updatedOptions);
            onChange(updatedOptions);
            onRefreshStock?.();
        } catch (error) {
            console.error('Failed to delete option:', error);
            toastRef.current?.show({
                severity: 'error',
                summary: 'Lỗi',
                detail: 'Không thể xóa nhóm phân loại'
            });
        }
    };

    return (
        <div>
            <Toast ref={toastRef} />
            {productData.map((option, optionIndex) => (
                <div key={optionIndex} className="mb-4 border p-3 rounded">
                    <div className="flex justify-between items-center mb-2">
                        <label className="w-full">{t('optionLabel', { index: optionIndex + 1 })}:</label>
                    </div>

                    <div className="flex gap-3 justify-center items-center text-center">
                        <InputComponent
                            value={option.name}
                            placeholder={t('optionNamePlaceholder')}
                            setValue={(e: any) => {
                                const updatedOptions = [...productData];
                                updatedOptions[optionIndex] = {
                                    ...updatedOptions[optionIndex],
                                    name: e.target.value
                                };
                                setProductData(updatedOptions);
                            }}
                            onBlur={() => handleOptionNameBlur(optionIndex)}
                            minLength={1}
                            maxLength={20}
                            className={`w-full mb-2 ${errors[`option-${optionIndex}`] ? 'p-invalid' : ''}`}
                            disabled={isLoading[option.name] || false}
                        />
                        {productData.length > 1 && (
                            <svg
                                onClick={() => removeOption(optionIndex)}
                                xmlns="http://www.w3.org/2000/svg"
                                height="24px"
                                viewBox="0 -960 960 960"
                                width="24px"
                                fill="#000000"
                                className="cursor-pointer"
                                role="button"
                                aria-label={t('removeOptionLabel')}
                            >
                                <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
                            </svg>
                        )}
                    </div>
                    {errors[`option-${optionIndex}`] && <small className="text-red-500">{errors[`option-${optionIndex}`]}</small>}

                    <div className="flex mt-5">
                        <label className="w-[80px]">Tùy chọn:</label>
                        <div className="flex gap-5 items-center w-full flex-wrap">
                            {option.values.map((value, valueIndex) => (
                                <div key={valueIndex} className="flex flex-col relative items-start mb-4">
                                    <div className="flex  items-center">
                                        <InputComponent
                                            value={value.name}
                                            placeholder={t('optionValuePlaceholder')}
                                            setValue={(e) => {
                                                const updatedValues = [...option.values];
                                                updatedValues[valueIndex] = {
                                                    ...updatedValues[valueIndex],
                                                    name: e.target.value
                                                };
                                                const updatedOptions = [...productData];
                                                updatedOptions[optionIndex] = {
                                                    ...updatedOptions[optionIndex],
                                                    values: updatedValues
                                                };
                                                setProductData(updatedOptions);
                                            }}
                                            minLength={1}
                                            maxLength={20}
                                            onBlur={() => handleOptionValueBlur(optionIndex, valueIndex)}
                                            className={`mr-2 w-[200px] ${errors[`value-${optionIndex}-${valueIndex}`] ? 'p-invalid' : ''}`}
                                            disabled={isLoading[value.name] || false}
                                        />
                                        {option.values.length > 1 && (
                                            <svg
                                                onClick={() => removeOptionValue(optionIndex, valueIndex)}
                                                xmlns="http://www.w3.org/2000/svg"
                                                height="24px"
                                                viewBox="0 -960 960 960"
                                                width="24px"
                                                fill="#000000"
                                                className="cursor-pointer "
                                                role="button"
                                                aria-label={t('removeOptionValueLabel')}
                                            >
                                                <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z" />
                                            </svg>
                                        )}
                                    </div>
                                    {errors[`value-${optionIndex}-${valueIndex}`] && <small className="text-red-500 absolute bottom-[-35px]">{errors[`value-${optionIndex}-${valueIndex}`]}</small>}
                                </div>
                            ))}
                        </div>
                    </div>

                    <Button label={t('addOptionButton')} className="mt-5 bg-black hover:bg-white  hover:text-black font-bold" onClick={() => addOptionValue(optionIndex)} />
                </div>
            ))}

            {productData.length >= 2 ? (
                <div>{t('maxClassificationWarning')}</div>
            ) : (
                <label onClick={addOption} className="flex items-center justify-center max-w-[210px] w-full text-center border-1 border-dashed border-gray-200 rounded-md hover:border-blue-500 cursor-pointer">
                    <div className="text-primary-text text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                    </div>
                    <p className=" text-sm text-primary-text font-semibold">{t('addClassificationGroup')}</p>
                </label>
            )}
        </div>
    );
}
