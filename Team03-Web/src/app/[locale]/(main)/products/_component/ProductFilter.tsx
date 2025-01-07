'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { Card } from 'primereact/card';
import { Checkbox } from 'primereact/checkbox';
import { Panel } from 'primereact/panel';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { MultiSelect, MultiSelectChangeEvent } from 'primereact/multiselect';
import formatMoney from '@/src/utils/formatMoney';
import { useTranslations } from 'next-intl';
import { getAllCategory } from '@/src/app/[locale]/(main)/products/service/getAllCategory';

const useDebounce = <T,>(value: T, delay: number): T => {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);

    return debouncedValue;
};

const DEFAULT_MIN_PRICE = 0;
const DEFAULT_MAX_PRICE = 100000000;

interface Filters {
    name: string;
    categoryId: number[] | [];
    categoryParent: number | null;
    startPrice: number;
    endPrice: number;
    rating: number | null;
}

interface Category {
    categoryId: number;
    categoryName: string;
    parentId: number;
}

const ProductFilter = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const router = useRouter();
    const searchParams = useSearchParams();
    const t = useTranslations();

    const [filters, setFilters] = useState<Filters>({
        name: searchParams.get('name') || '',
        categoryId: searchParams.get('categoryId') ? searchParams .get('categoryId')!.split(',').map(Number) : [],
        categoryParent: searchParams.get('categoryParent') ? parseInt(searchParams.get('categoryParent')!) : null,
        startPrice: searchParams.has('startPrice') ? parseInt(searchParams.get('startPrice')!) : DEFAULT_MIN_PRICE,
        endPrice: searchParams.has('endPrice') ? parseInt(searchParams.get('endPrice')!) : DEFAULT_MAX_PRICE,
        rating: searchParams.get('rating') ? parseInt(searchParams.get('rating')!) : null
    });

    const [tempStartPrice, setTempStartPrice] = useState<number>(filters.startPrice);
    const [tempEndPrice, setTempEndPrice] = useState<number>(filters.endPrice);

    const [priceError, setPriceError] = useState<boolean>(false);

    const debouncedFilters = useDebounce(filters, 200);

    const updateURLParams = useCallback(
        (newParams: Partial<Filters>) => {
            const current = new URLSearchParams(Array.from(searchParams.entries()));

            Object.entries(newParams).forEach(([key, value]) => {
                if (value === '' || value === null || value === undefined || (Array.isArray(value) && value.length === 0) || (key === 'startPrice' && value === DEFAULT_MIN_PRICE) || (key === 'endPrice' && value === DEFAULT_MAX_PRICE)) {
                    current.delete(key);
                } else {
                    current.set(key, Array.isArray(value) ? value.join(',') : String(value));
                }
            });

            const search = current.toString();
            const query = search ? `?${search}` : '';

            if (current.toString() !== searchParams.toString()) {
                router.push(`${window.location.pathname}${query}`);
            }
        },
        [searchParams, router]
    );

    useEffect(() => {
        updateURLParams(debouncedFilters);
    }, [debouncedFilters, updateURLParams]);

    const handleChange = <K extends keyof Filters>(key: K, value: Filters[K]) => {
        setFilters((prev) => {
            let updatedFilters = { ...prev, [key]: value };

            if (key === 'categoryParent') {
                updatedFilters = {
                    ...updatedFilters,
                    categoryId: []
                };
            }

            return updatedFilters;
        });
    };

    const resetFilters = () => {
        setFilters({
            name: '',
            categoryId: [],
            categoryParent: null,
            startPrice: DEFAULT_MIN_PRICE,
            endPrice: DEFAULT_MAX_PRICE,
            rating: null
        });
        setTempStartPrice(DEFAULT_MIN_PRICE);
        setTempEndPrice(DEFAULT_MAX_PRICE);
        setPriceError(false);
    };

    useEffect(() => {
        const fetchCategoryData = async () => {
            try {
                const res = await getAllCategory();
                setCategories(res.data.data);

                if (filters.categoryParent) {
                    const hasChildren = res.data.data.some((cat: Category) => cat.parentId === filters.categoryParent);

                    if (!hasChildren) {
                        setFilters((prev) => ({ ...prev, categoryId: [] }));
                        return;
                    }

                    const childCategories = res.data.data.filter((cat: Category) => cat.parentId === filters.categoryParent).map((cat: Category) => cat.categoryId);

                    setFilters((prev) => ({ ...prev, categoryId: childCategories }));
                } else {
                    setFilters((prev) => ({ ...prev, categoryId: [] }));
                }
            } catch (e) {
                console.error('Error fetching categories', e);
            }
        };

        fetchCategoryData();
    }, [filters.categoryParent]);

    const parentCategories = categories.filter((cat) => cat.parentId === 0);
    const childCategories = categories.filter((cat) => cat.parentId !== 0);

    const handleApplyPriceFilter = () => {
        if (tempStartPrice > tempEndPrice) {
            setPriceError(true);
            return;
        }
        setPriceError(false);
        setFilters((prev) => ({
            ...prev,
            startPrice: Math.max(tempStartPrice, DEFAULT_MIN_PRICE),
            endPrice: Math.min(tempEndPrice, DEFAULT_MAX_PRICE)
        }));
    };
    const parseMoney = (value: string) => {
        return parseInt(value.replace(/[^\d]/g, ''), 10) || 0;
    };

    return (
        <div className="w-[300px] h-full">
            <Card title={t('productListing.filters')} className="mb-8">
                <Panel header={t('productListing.search')} className="mb-3">
                    <div className="mb-2">
                        <span className="p-float-label">
                            <InputText className='w-full' id="name" value={filters.name} onChange={(e) => handleChange('name', e.target.value)} />
                            <label htmlFor="name">{t('productListing.productName')}</label>
                        </span>
                    </div>

                    {parentCategories.length > 0 && (
                        <div className="w-full my-8">
                            <span className="p-float-label">
                                <Dropdown
                                    id="categoryParent"
                                    className="w-full"
                                    value={filters.categoryParent}
                                    options={parentCategories.map((item) => ({
                                        label: item.categoryName,
                                        value: item.categoryId
                                    }))}
                                    onChange={(e: DropdownChangeEvent) => handleChange('categoryParent', e.value)}
                                    placeholder={t('productListing.chooseParentCategory')}
                                />
                                <label htmlFor="categoryParent">{t('productListing.parentCategory')}</label>
                            </span>
                        </div>
                    )}

                    {childCategories.length > 0 && filters.categoryParent && (
                        <div className="w-full my-8">
                            <span className="p-float-label">
                                <MultiSelect
                                    id="categoryId"
                                    className="w-full"
                                    value={filters.categoryId}
                                    options={childCategories
                                        .filter((item) => item.parentId === filters.categoryParent)
                                        .map((item) => ({
                                            label: item.categoryName,
                                            value: item.categoryId
                                        }))}
                                    onChange={(e: MultiSelectChangeEvent) => handleChange('categoryId', e.value)}
                                    placeholder={t('productListing.chooseCategory')}
                                />
                                <label htmlFor="categoryId">{t('productListing.subCategory')}</label>
                            </span>
                        </div>
                    )}
                </Panel>

                <Panel header={t('productListing.priceRange')} className="mb-4">
                    <div className="flex flex-col gap-2">
                        <div className="flex mt-3 justify-content-between items-center gap-2">
                            <span className="p-float-label">
                                <InputText
                                    id="startPrice"
                                    className="w-[90px]"
                                    placeholder={tempStartPrice === DEFAULT_MIN_PRICE ? t('productListing.min') : ''}
                                    value={tempStartPrice === DEFAULT_MIN_PRICE ? '' : formatMoney(tempStartPrice)}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setTempStartPrice(parseMoney(value));
                                    }}
                                    onBlur={(e) => {
                                        const value = e.target.value;
                                        setTempStartPrice(Math.max(parseMoney(value), DEFAULT_MIN_PRICE));
                                    }}
                                />
                                <label htmlFor="startPrice">{t('productListing.min')}</label>
                            </span>
                            <span className="text-gray-500">-</span>
                            <span className="p-float-label">
                                <InputText
                                    id="endPrice"
                                    className="w-[120px]"
                                    placeholder={tempEndPrice === DEFAULT_MAX_PRICE ? t('productListing.max') : ''}
                                    value={tempEndPrice === DEFAULT_MAX_PRICE ? '' : formatMoney(tempEndPrice)}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setTempEndPrice(parseMoney(value));
                                    }}
                                    onBlur={(e) => {
                                        const value = e.target.value;
                                        setTempEndPrice(Math.min(parseMoney(value), DEFAULT_MAX_PRICE));
                                    }}
                                />
                                <label htmlFor="endPrice">{t('productListing.max')}</label>
                            </span>
                        </div>
                        <div className="flex justify-end">
                            <Button onClick={handleApplyPriceFilter} label={t('productListing.apply')} className="w-1/2 mx-auto text-sm  bg-black text-white hover:bg-white hover:text-black mt-2" />
                        </div>
                        {priceError && <small className="text-red-500">{t('productListing.priceError')}</small>}
                    </div>
                </Panel>

                <Panel header={t('productListing.rating')} className="mb-3">
                    <div className="flex flex-col gap-2">
                        {[5, 4, 3, 2, 1].map((rating) => (
                            <div key={rating} className="flex items-center">
                                <Checkbox inputId={`rating-${rating}`} checked={filters.rating === rating} onChange={(e) => handleChange('rating', e.checked ? rating : null)} />
                                <label htmlFor={`rating-${rating}`} className="ml-2">
                                    {rating} {t('productListing.starsOrMore')}
                                </label>
                            </div>
                        ))}
                    </div>
                </Panel>

                <div className="flex justify-center mt-4">
                    <Button className="bg-black hover:bg-white text-white hover:text-black font-bold" onClick={resetFilters}>
                        {t('productListing.clearFilters')}
                    </Button>
                </div>
            </Card>
        </div>
    );
};

export default ProductFilter;
