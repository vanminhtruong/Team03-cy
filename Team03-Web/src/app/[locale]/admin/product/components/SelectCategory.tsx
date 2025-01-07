'use client';

import { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { getAllCategory } from '@/src/app/[locale]/admin/product/sevice/getAllCategoryService';
import { useTranslations } from 'next-intl';
import { ChevronRight, Search } from 'lucide-react';

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
    const [isOpen, setIsOpen] = useState(false);
    const [categoriesParent, setCategoriesParent] = useState<Category[]>([]);
    const [categoriesChildren, setCategoriesChildren] = useState<Category[]>([]);
    const [filteredChildren, setFilteredChildren] = useState<Category[]>([]);
    const [searchParent, setSearchParent] = useState('');
    const [searchChild, setSearchChild] = useState('');
    const t = useTranslations('createProduct');
    const [selectedParentId, setSelectedParentId] = useState<number | null>(null);
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(idchild || null);
    const [selectedCategoryName, setSelectedCategoryName] = useState<string>('');

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const resp = await getAllCategory();
                const data: Category[] = resp.data.data;

                const validCategories = data.filter(category =>
                    category &&
                    typeof category.categoryId === 'number' &&
                    typeof category.categoryName === 'string' &&
                    typeof category.parentId === 'number'
                );

                const parents = validCategories.filter((item) => item.parentId === 0);
                const children = validCategories.filter((item) => item.parentId !== 0);

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
                // You might want to add error state handling here
                setCategoriesParent([]);
                setCategoriesChildren([]);
            }
        };

        fetchCategories();
    }, [idchild]);

    const fetchChildCategories = (parentId: number) => {
        const filtered = categoriesChildren.filter((item) => item?.parentId === parentId);
        setFilteredChildren(filtered);
        setSelectedParentId(parentId);
    };

    const filteredParentCategories = categoriesParent.filter((category) => {
        if (!category?.categoryName) return false;
        const searchTerm = (searchParent || '').toLowerCase();
        return category.categoryName.toLowerCase().includes(searchTerm);
    });

    const filteredChildCategories = filteredChildren.filter((category) => {
        if (!category?.categoryName) return false;
        const searchTerm = (searchChild || '').toLowerCase();
        return category.categoryName.toLowerCase().includes(searchTerm);
    });

    const handleConfirm = () => {
        if (selectedCategoryId) {
            const allCategories = [...categoriesParent, ...categoriesChildren];
            const selectedCategory = allCategories.find((category) => category?.categoryId === selectedCategoryId);

            if (selectedCategory) {
                const parentCategory = categoriesParent.find((parent) => parent?.categoryId === selectedCategory.parentId);
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
        setSearchChild('');
    };

    const handleChildSelect = (childId: number) => {
        const selectedCategory = categoriesChildren.find((category) => category?.categoryId === childId);
        const parentCategory = categoriesParent.find((parent) => parent?.categoryId === selectedCategory?.parentId);

        if (selectedCategory) {
            setSelectedCategoryName(parentCategory ? `${parentCategory.categoryName} > ${selectedCategory.categoryName}` : selectedCategory.categoryName);
            setSelectedCategoryId(childId);
        }
    };

    return (
        <div className="relative w-full">
            <InputText
                onClick={() => setIsOpen(true)}
                value={selectedCategoryName || t('selectCategory')}
                readOnly
                className="w-full p-3 cursor-pointer shadow transition duration-200 hover:shadow-md focus:ring-2 focus:ring-blue-300"
                placeholder={t('selectCategory')}
            />

            <Dialog header={t('selectCategory')} visible={isOpen} onHide={() => setIsOpen(false)} className="w-11/12 md:w-4/5 lg:w-3/4 xl:max-w-4xl">
                <div className="flex flex-col bg-white rounded-lg p-4 md:p-6">
                    <div className="mb-4">
                        <p className="text-gray-500 text-sm md:text-base">{t('chooseCategory')}</p>
                    </div>

                    <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
                        <div className="w-full md:w-1/2">
                            <div className="rounded-lg shadow-sm">
                                <div className="p-2 border-b">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="text"
                                            placeholder="..."
                                            value={searchParent}
                                            onChange={(e) => setSearchParent(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border rounded-md text-sm"
                                        />
                                    </div>
                                </div>
                                <ul className="divide-y max-h-[300px] md:max-h-[400px] overflow-y-auto">
                                    {filteredParentCategories.map((item) => (
                                        <li
                                            key={item.categoryId}
                                            onClick={() => handleParentSelect(item.categoryId)}
                                            className={`p-3 md:p-4 cursor-pointer transition text-sm md:text-base flex justify-between items-center
                                                ${selectedParentId === item.categoryId ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'}`}
                                        >
                                            {item.categoryName}
                                            <ChevronRight className={`transition-transform ${selectedParentId === item.categoryId ? 'rotate-90' : ''}`} size={20} />
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="w-full md:w-1/2">
                            <div className="rounded-lg shadow-sm">
                                <div className="p-2 border-b">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="text"
                                            placeholder="..."
                                            value={searchChild}
                                            onChange={(e) => setSearchChild(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border rounded-md text-sm"
                                        />
                                    </div>
                                </div>
                                <ul className="divide-y max-h-[300px] md:max-h-[400px] overflow-y-auto">
                                    {filteredChildCategories.length > 0 ? (
                                        filteredChildCategories.map((item) => (
                                            <li
                                                key={item.categoryId}
                                                onClick={() => handleChildSelect(item.categoryId)}
                                                className={`p-3 md:p-4 cursor-pointer transition text-sm md:text-base
                                                    ${selectedCategoryId === item.categoryId ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'}`}
                                            >
                                                {item.categoryName}
                                            </li>
                                        ))
                                    ) : (
                                        <li className="p-4 text-gray-500 text-center">{t('notChosen')}</li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex flex-col space-y-4">
                        <p className="text-sm md:text-base text-gray-800 text-center">
                            {t('notChosen')}: {selectedCategoryName || t('notChosen')}
                        </p>

                        <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="px-4 py-2 md:px-6 md:py-2.5 rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition text-sm md:text-base w-full sm:w-auto"
                            >
                                {t('cancel')}
                            </button>

                            <button
                                onClick={handleConfirm}
                                disabled={!selectedCategoryId}
                                className={`px-4 py-2 md:px-6 md:py-2.5 rounded-lg text-white transition text-sm md:text-base w-full sm:w-auto
                                    ${selectedCategoryId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
                            >
                                {t('confirm')}
                            </button>
                        </div>
                    </div>
                </div>
            </Dialog>
        </div>
    );
};

export default SelectCategory;
