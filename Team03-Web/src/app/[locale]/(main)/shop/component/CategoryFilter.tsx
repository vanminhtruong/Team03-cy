import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { Checkbox } from 'primereact/checkbox';
import { Panel } from 'primereact/panel';
import { InputNumber } from 'primereact/inputnumber';
import { Rating } from 'primereact/rating';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import formatMoney from '@/src/utils/formatMoney';

interface Product {
    productId: number;
    productName: string;
    category: {
        categoryId: number;
        categoryName: string;
    };
    newPrice: number;
    rating: number;
}

interface CategoryFilterProps {
    product: Product[];
}

interface Filters {
    name: string;
    categoryIds: number[];
    startPrice: number;
    endPrice: number;
    rating: number | null;
}

const DEFAULT_MIN_PRICE = 0;
const DEFAULT_MAX_PRICE = 100000000;

const CategoryFilter: React.FC<CategoryFilterProps> = ({ product }) => {
    const t = useTranslations();
    const router = useRouter();
    const searchParams = useSearchParams();

    const categories = Array.from(new Set(product.map((p) => p.category.categoryName)));
    const categoryMap = product.reduce((map, p) => {
        map[p.category.categoryName] = p.category.categoryId;
        return map;
    }, {} as { [key: string]: number });

    const [filters, setFilters] = useState<Filters>({
        name: searchParams.get('name') || '',
        categoryIds: searchParams.get('categoryIds') ? searchParams.get('categoryIds')!.split(',').map(Number) : [],
        startPrice: searchParams.has('startPrice') ? parseInt(searchParams.get('startPrice')!) : DEFAULT_MIN_PRICE,
        endPrice: searchParams.has('endPrice') ? parseInt(searchParams.get('endPrice')!) : DEFAULT_MAX_PRICE,
        rating: searchParams.get('rating') ? parseInt(searchParams.get('rating')!) : null
    });

    const [selectedCategories, setSelectedCategories] = useState<string[]>(filters.categoryIds.map((id) => Object.entries(categoryMap).find(([_, value]) => value === id)?.[0] || '').filter((name) => name !== ''));

    const [tempStartPrice, setTempStartPrice] = useState(filters.startPrice);
    const [tempEndPrice, setTempEndPrice] = useState(filters.endPrice);
    const [priceError, setPriceError] = useState(false);

    const updateUrlParams = (newFilters: Filters) => {
        const params = new URLSearchParams();

        if (newFilters.name) params.set('name', newFilters.name);
        if (newFilters.categoryIds.length > 0) params.set('categoryIds', newFilters.categoryIds.join(','));
        if (newFilters.startPrice !== DEFAULT_MIN_PRICE) params.set('startPrice', newFilters.startPrice.toString());
        if (newFilters.endPrice !== DEFAULT_MAX_PRICE) params.set('endPrice', newFilters.endPrice.toString());
        if (newFilters.rating !== null) params.set('rating', newFilters.rating.toString());

        router.push(`${window.location.pathname}?${params.toString()}`, { scroll: false });
    };

    const handleCategoryChange = (e: { checked: boolean }, categoryName: string) => {
        const categoryId = categoryMap[categoryName];
        let newSelectedCategories: string[];
        let newCategoryIds: number[];

        if (e.checked) {
            newSelectedCategories = [...selectedCategories, categoryName];
            newCategoryIds = [...filters.categoryIds, categoryId];
        } else {
            newSelectedCategories = selectedCategories.filter((c) => c !== categoryName);
            newCategoryIds = filters.categoryIds.filter((id) => id !== categoryId);
        }

        setSelectedCategories(newSelectedCategories);
        const newFilters = { ...filters, categoryIds: newCategoryIds };
        setFilters(newFilters);
        updateUrlParams(newFilters);
    };

    const handleApplyPriceFilter = () => {
        if (tempStartPrice > tempEndPrice) {
            setPriceError(true);
            return;
        }
        setPriceError(false);
        const newFilters = {
            ...filters,
            startPrice: tempStartPrice,
            endPrice: tempEndPrice
        };
        setFilters(newFilters);
        updateUrlParams(newFilters);
    };

    const handleClearFilters = () => {
        const defaultFilters: Filters = {
            name: '',
            categoryIds: [],
            startPrice: DEFAULT_MIN_PRICE,
            endPrice: DEFAULT_MAX_PRICE,
            rating: null
        };
        setFilters(defaultFilters);
        setSelectedCategories([]);
        setTempStartPrice(DEFAULT_MIN_PRICE);
        setTempEndPrice(DEFAULT_MAX_PRICE);
        setPriceError(false);
        updateUrlParams(defaultFilters);
    };

    const parseMoney = (value: string): number => {
        return parseInt(value.replace(/[^\d]/g, '')) || 0;
    };

    return (
        <div className="w-full sm:max-w-[300px] space-y-4">
            <Panel header={t('shopDetail.search')} className="mb-3">
                <InputText
                    value={filters.name}
                    onChange={(e) => {
                        const newFilters = { ...filters, name: e.target.value };
                        setFilters(newFilters);
                        updateUrlParams(newFilters);
                    }}
                    placeholder={t('shopDetail.search')}
                    className="w-full"
                />
            </Panel>

            <Panel header={t('shopDetail.categories')} className="mb-3">
                <ul className="list-none p-0 m-0 space-y-2">
                    {categories.map((category) => (
                        <li key={category} className="flex items-center">
                            <Checkbox inputId={category} checked={selectedCategories.includes(category)} onChange={(e: any) => handleCategoryChange(e, category)} />
                            <label htmlFor={category} className="ml-2 text-gray-700 cursor-pointer">
                                {category}
                            </label>
                        </li>
                    ))}
                </ul>
            </Panel>

            <Panel header={t('shopDetail.priceRange')} className="mb-3">
                <div className="flex flex-col gap-2">
                    <div className="flex mt-3 justify-content-between items-center gap-2">
                        <span className="p-float-label">
                            <InputText
                                id="startPrice"
                                className="w-[120px]"
                                placeholder={tempStartPrice === DEFAULT_MIN_PRICE ? 'MIN' : ''}
                                value={tempStartPrice === DEFAULT_MIN_PRICE ? '' : formatMoney(tempStartPrice)}
                                onChange={(e) => setTempStartPrice(parseMoney(e.target.value))}
                                onBlur={(e) => setTempStartPrice(Math.max(parseMoney(e.target.value), DEFAULT_MIN_PRICE))}
                            />
                            <label htmlFor="startPrice">{t('shopDetail.minPrice')}</label>
                        </span>
                        <span className="text-gray-500">-</span>
                        <span className="p-float-label">
                            <InputText
                                id="endPrice"
                                className="w-[120px]"
                                placeholder={tempEndPrice === DEFAULT_MAX_PRICE ? 'MAX' : ''}
                                value={tempEndPrice === DEFAULT_MAX_PRICE ? '' : formatMoney(tempEndPrice)}
                                onChange={(e) => setTempEndPrice(parseMoney(e.target.value))}
                                onBlur={(e) => setTempEndPrice(Math.min(parseMoney(e.target.value), DEFAULT_MAX_PRICE))}
                            />
                            <label htmlFor="endPrice">{t('shopDetail.maxPrice')}</label>
                        </span>
                    </div>
                    <div className="flex justify-center">
                        <Button onClick={handleApplyPriceFilter} label={t('shopDetail.applyFilters')} outlined className=" text-sm bg-black text-white hover:bg-white hover:text-black mt-2" />
                    </div>
                    {priceError && <small className="text-red-500">{t('shopDetail.priceError')}</small>}
                </div>
            </Panel>

            <Panel header={t('shopDetail.ratings')} className="mb-3">
                <div className="flex flex-col gap-2">
                    {[5, 4, 3, 2, 1].map((rating) => (
                        <div key={rating} className="flex items-center">
                            <Checkbox
                                inputId={`rating-${rating}`}
                                checked={filters.rating === rating}
                                onChange={(e) => {
                                    const newFilters = { ...filters, rating: e.checked ? rating : null };
                                    setFilters(newFilters);
                                    updateUrlParams(newFilters);
                                }}
                            />
                            <label htmlFor={`rating-${rating}`} className="ml-2">
                                {rating} {t('shopDetail.ratingStars')}
                            </label>
                        </div>
                    ))}
                </div>
            </Panel>
            <div className="flex justify-center mt-4">
                <Button label={t('shopDetail.clearFilters')} outlined className=" text-sm bg-black text-white hover:bg-white hover:text-black mt-2" onClick={handleClearFilters} />
            </div>
        </div>
    );
};

export default CategoryFilter;
