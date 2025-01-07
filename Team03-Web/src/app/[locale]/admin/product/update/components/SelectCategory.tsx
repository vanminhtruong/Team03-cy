'use client';

import { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { getAllCategory } from '@/src/app/[locale]/admin/product/sevice/getAllCategoryService';
import { useTranslations } from 'next-intl';

interface Category {
    categoryId: number;
    categoryName: string;
    parentId: number;
}

interface SelectCategoryProps {
    idchild?: number | null;
    onCategorySelect: (categoryId: number) => void;
}

const SelectCategory: React.FC<SelectCategoryProps> = ({ idchild, onCategorySelect }) => {
    const t = useTranslations('updateProduct');
    const [isOpen, setIsOpen] = useState(false);
    const [categoriesParent, setCategoriesParent] = useState<Category[]>([]);
    const [categoriesChildren, setCategoriesChildren] = useState<Category[]>([]);
    const [filteredChildren, setFilteredChildren] = useState<Category[]>([]);

    const [selectedParentId, setSelectedParentId] = useState<number | null>(null);
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(idchild || null);

    const [selectedCategoryName, setSelectedCategoryName] = useState<string>('');

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const resp = await getAllCategory();
                const data: Category[] = resp.data.data;

                const parents = data.filter((item) => item.parentId === 0);
                const children = data.filter((item) => item.parentId !== 0);

                setCategoriesParent(parents);
                setCategoriesChildren(children);

                if (idchild) {
                    const allCategories = [...parents, ...children];
                    const selectedCategory = allCategories.find((category) => category.categoryId === idchild);

                    if (selectedCategory) {
                        const parentCategory = parents.find((parent) => parent.categoryId === selectedCategory.parentId);

                        setSelectedCategoryName(parentCategory ? `${parentCategory.categoryName} > ${selectedCategory.categoryName}` : selectedCategory.categoryName);

                        setSelectedParentId(selectedCategory.parentId);
                        fetchChildCategories(selectedCategory.parentId);
                    }
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };

        fetchCategories();
    }, [idchild]);

    const fetchChildCategories = (parentId: number) => {
        const filtered = categoriesChildren.filter((item) => item.parentId === parentId);
        setFilteredChildren(filtered);
        setSelectedParentId(parentId);
    };

    const handleConfirm = () => {
        if (selectedCategoryId) {
            const allCategories = [...categoriesParent, ...categoriesChildren];
            const selectedCategory = allCategories.find((category) => category.categoryId === selectedCategoryId);

            if (selectedCategory) {
                const parentCategory = categoriesParent.find((parent) => parent.categoryId === selectedCategory.parentId);

                setSelectedCategoryName(parentCategory ? `${parentCategory.categoryName} > ${selectedCategory.categoryName}` : selectedCategory.categoryName);
            }

            onCategorySelect(selectedCategoryId);
            setIsOpen(false);
        }
    };

    const handleParentSelect = (parentId: number) => {
        fetchChildCategories(parentId);
        setSelectedCategoryId(null);
        setSelectedCategoryName('');
    };

    const handleChildSelect = (childId: number) => {
        const selectedCategory = categoriesChildren.find((category) => category.categoryId === childId);
        const parentCategory = categoriesParent.find((parent) => parent.categoryId === selectedCategory?.parentId);

        setSelectedCategoryName(parentCategory ? `${parentCategory.categoryName} > ${selectedCategory?.categoryName}` : '');
        setSelectedCategoryId(childId);
    };

    return (
        <div className="relative w-full">
            <InputText
                onClick={() => setIsOpen(true)}
                value={selectedCategoryName || t('inputPlaceholder')}
                readOnly
                className="w-full p-3 cursor-pointer shadow transition duration-200"
                placeholder={t('inputPlaceholder')}
            />

            {isOpen && (
                <Dialog
                    header={t('dialogHeader')}
                    visible={isOpen}
                    onHide={() => setIsOpen(false)}
                    className="p-4 max-w-[1000px] w-full"
                >
                    <div className="flex flex-col bg-white shadow-lg rounded-lg p-6">
                        <div className="mb-4">
                            <p className="text-gray-500 text-sm mt-2">{t('selectAccurateCategory')}</p>
                        </div>

                        <div className="grid grid-cols-2">
                            <ul className="border-r p-4 border-gray-200 overflow-y-auto max-h-[400px] w-full max-w-[400px]">
                                {categoriesParent.map((item) => (
                                    <li
                                        key={item.categoryId}
                                        onClick={() => handleParentSelect(item.categoryId)}
                                        className={`py-2 px-4 cursor-pointer transition ${selectedParentId === item.categoryId ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
                                    >
                                        {item.categoryName}
                                    </li>
                                ))}
                            </ul>

                            <ul className="p-4 overflow-y-auto max-h-[400px] w-full max-w-[400px]">
                                {filteredChildren.length > 0 ? (
                                    filteredChildren.map((item) => (
                                        <li
                                            key={item.categoryId}
                                            onClick={() => handleChildSelect(item.categoryId)}
                                            className={`py-2 px-4 cursor-pointer transition ${selectedCategoryId === item.categoryId ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
                                        >
                                            {item.categoryName}
                                        </li>
                                    ))
                                ) : (
                                    <li className="text-gray-500 text-center py-4">{t('noParentCategorySelected')}</li>
                                )}
                            </ul>
                        </div>

                        <div className="mt-4 flex flex-col justify-between items-center">
                            <p className="text-sm text-gray-800 mb-4">
                                {t('notSelected')}: {selectedCategoryName || t('notSelected')}
                            </p>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="py-2.5 px-6 rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-100 transition"
                                >
                                    {t('cancel')}
                                </button>

                                <button
                                    onClick={handleConfirm}
                                    disabled={!selectedCategoryId}
                                    className={`py-2.5 px-6 rounded-lg text-white transition ${selectedCategoryId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
                                >
                                    {t('confirm')}
                                </button>
                            </div>
                        </div>
                    </div>
                </Dialog>
            )}
        </div>
    );
};

export default SelectCategory;
