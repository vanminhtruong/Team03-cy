'use client';
import React, { useEffect, useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { TabMenu } from 'primereact/tabmenu';
import { Button } from 'primereact/button';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

interface Category {
    categoryId: number;
    categoryName: string;
}

interface ProductFilterProps {
    categories: Category[];
}

const useDebounce = <T,>(value: T, delay: number): T => {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);

    return debouncedValue;
};

export default function FilterComponent({ categories }: ProductFilterProps) {
    const t = useTranslations('product.filter');
    const router = useRouter();
    const searchParams = useSearchParams();

    const statusItems = [
        { label: t('status.all'), value: -1 },
        { label: t('status.pending'), value: 0 },
        { label: t('status.approved'), value: 1 },
        { label: t('status.locked'), value: 2 }
    ];

    const [searchInput, setSearchInput] = useState(searchParams.get('search') ?? '');
    const debouncedSearchTerm = useDebounce(searchInput, 100);

    const currentStatus = Number(searchParams.get('status') ?? -1);
    const currentCategoryId = searchParams.get('categoryId');

    const updateFilters = (newParams: { search?: string; categoryId?: string | null; status?: number }) => {
        const params = new URLSearchParams(searchParams.toString());

        if (newParams.search !== undefined) {
            if (newParams.search) {
                params.set('search', newParams.search);
            } else {
                params.delete('search');
            }
        }

        if (newParams.categoryId !== undefined) {
            if (newParams.categoryId) {
                params.set('categoryId', newParams.categoryId);
            } else {
                params.delete('categoryId');
            }
        }

        if (newParams.status !== undefined) {
            if (newParams.status !== -1) {
                params.set('status', newParams.status.toString());
            } else {
                params.delete('status');
            }
        }

        router.push(`?${params.toString()}`);
    };

    useEffect(() => {
        updateFilters({ search: debouncedSearchTerm });
    }, [debouncedSearchTerm]);

    const handleSearchChange = (value: string) => {
        setSearchInput(value);
    };

    const handleCategoryChange = (category: Category | null) => {
        updateFilters({ categoryId: category?.categoryId.toString() ?? null });
    };

    const handleStatusChange = (index: number) => {
        updateFilters({ status: statusItems[index].value });
    };

    const handleResetFilters = () => {
        setSearchInput('');
        router.push('?');
    };

    const selectedCategory = categories.find((cat) => cat.categoryId.toString() === currentCategoryId) ?? null;

    return (
        <div className="w-full">
            <div className="flex flex-wrap gap-4 mb-4 items-start">
                <div className="flex flex-col w-full">
                    <TabMenu
                        model={statusItems.map((item) => ({ label: item.label }))}
                        activeIndex={statusItems.findIndex((item) => item.value === currentStatus)}
                        onTabChange={(e) => handleStatusChange(e.index)}
                    />
                    <div className="flex gap-5 mt-4">
                        <div className="flex justify-between items-center flex-1 ">
                            <div className="p-input-icon-left flex justify-center items-center w-full">
                                <i className="pi pi-search" />
                                <InputText
                                    placeholder={t('search.placeholder')}
                                    value={searchInput}
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                    className="w-full"
                                />
                            </div>
                        </div>
                        <div className="p-inputgroup flex-1">
                            <Dropdown
                                options={categories}
                                optionLabel="categoryName"
                                value={selectedCategory}
                                onChange={(e) => handleCategoryChange(e.value)}
                                placeholder={t('category.placeholder')}
                                className="w-full"
                            />
                        </div>
                        <Button
                            label={t('resetButton')}
                            onClick={handleResetFilters}
                            className="bg-black text-white p-3 rounded hover:bg-gray-800 w-max-[200px] transition-colors"
                        />
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .p-input-icon-left i {
                    position: absolute;
                    left: 0.75rem;
                    top: 65%;
                    transform: translateY(-50%);
                    color: #6c757d;
                }

                .p-input-icon-left input {
                    padding-left: 2.5rem;
                }

                @media (max-width: 768px) {
                    .flex-wrap {
                        gap: 1rem;
                    }
                }
            `}</style>
        </div>
    );
}
