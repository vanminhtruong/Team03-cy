'use client';
import React, { useEffect, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { deleteProduct, fetchProducts } from './service/allProductService';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/src/i18n/routing';
import '@/public/css/customCSS.css';
import FilterComponent from '@/src/app/[locale]/admin/products/component/FilterComponent';
import Spinner from '@/src/components/spinner/spinner';
import formatMoney from '@/src/utils/formatMoney';
import { useTranslations } from 'next-intl';

interface Category {
    categoryId: number;
    categoryName: string;
}

interface Product {
    productId: number;
    productName: string;
    category: Category;
    image: string;
    status: number;
    note?: string;
    modifiedAt: string;
    rating: number;
    oldPrice: number;
    newPrice: number;
}

export default function ProductPage() {
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const [confirmDialogVisible, setConfirmDialogVisible] = useState<boolean>(false);
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);
    const t = useTranslations('product');

    useEffect(() => {
        const userData = localStorage.getItem('user');
        const user = userData ? JSON.parse(userData) : null;
        const idShop = user?.state?.id;

        const loadData = async () => {
            try {
                setLoading(true);
                const response = await fetchProducts(idShop);
                const products: Product[] = response as unknown as Product[];
                setAllProducts(products);

                const fetchedCategories = products.map((product) => product.category).filter((category: Category, index: number, self: Category[]) => self.findIndex((c) => c.categoryId === category.categoryId) === index);
                setCategories(fetchedCategories);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    useEffect(() => {
        const status = Number(searchParams.get('status') ?? -1);
        const searchName = searchParams.get('search') ?? '';
        const categoryId = searchParams.get('categoryId');

        const filtered = allProducts.filter((product) => {
            const productName = product.productName || '';
            const normalizedSearchName = searchName.trim().toLowerCase().normalize('NFD');
            const matchesName = productName.toLowerCase().normalize('NFD').includes(normalizedSearchName);
            const matchesCategory = categoryId ? product.category.categoryId.toString() === categoryId : true;
            const matchesStatus = status === -1 ? true : product.status === status;

            return matchesName && matchesCategory && matchesStatus;
        });

        setFilteredProducts(filtered);
    }, [searchParams, allProducts]);

    const confirmDelete = (product: Product) => {
        setProductToDelete(product);
        setConfirmDialogVisible(true);
    };

    const handleDelete = async () => {
        if (productToDelete) {
            try {
                await deleteProduct(productToDelete.productId);
                const updatedProducts = allProducts.filter((p) => p.productId !== productToDelete.productId);
                setAllProducts(updatedProducts);
                setConfirmDialogVisible(false);
            } catch (error) {
                console.error('Error deleting product:', error);
                alert('An error occurred while deleting the product.');
            }
        }
    };

    const handleEdit = (product: Product) => {
        router.push(`/admin/product/update?id=${product.productId}`);
    };

    const renderStatus = (status: number) => {
        let statusText = '';
        let statusClass = '';

        switch (status) {
            case 0:
                statusText = t('status.pending');
                statusClass = 'bg-gray-300 text-gray-700';
                break;
            case 1:
                statusText = t('status.approved');
                statusClass = 'bg-green-500 text-white';
                break;
            case 2:
                statusText = t('status.locked');
                statusClass = 'bg-red-500 text-white';
                break;
            default:
                statusText = t('status.unknown');
                statusClass = 'bg-gray-200 text-gray-600';
        }

        return <span className={`px-4 py-2 rounded-full ${statusClass}`}>{statusText}</span>;
    };
    const renderRating = (rowData: Product) => {
        return (
            <div className="flex justify-center items-center">
                {rowData.rating}
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#B89230">
                    <path d="m354-287 126-76 126 77-33-144 111-96-146-13-58-136-58 135-146 13 111 97-33 143ZM233-120l65-281L80-590l288-25 112-265 112 265 288 25-218 189 65 281-247-149-247 149Zm247-350Z" />
                </svg>
            </div>
        );
    };
    return (
        <div>
            <div className="card min-h-screen">
                <h1 className="text-2xl font-bold text-black">{t('pageTitle')}</h1>

                <FilterComponent categories={categories} />

                <Spinner isLoading={loading} />

                <DataTable value={filteredProducts} rows={6} paginator responsiveLayout="scroll" resizableColumns showGridlines className="w-full items-center" emptyMessage={t('noProducts')} dataKey="productId">
                    <Column sortable header={t('table.index')} style={{ minWidth: '1rem' }} body={(data, { rowIndex }) => <div className="flex justify-center">{rowIndex + 1}</div>} />
                    <Column
                        header={t('table.image')}
                        style={{ minWidth: '10rem' }}
                        body={(data: Product) => <img src={data.image || 'https://via.placeholder.com/50'} alt={data.productName} className="w-[100px] h-[100px] object-cover shadow rounded" />}
                    />
                    <Column
                        field="productName"
                        sortable
                        header={t('table.productName')}
                        style={{ minWidth: '30rem', maxWidth: '30rem', whiteSpace: 'normal', wordWrap: 'break-word' }}
                        body={(data: Product) => <span className="text-gray-700 font-medium line-clamp-2">{data.productName || 'N/A'}</span>}
                    />
                    <Column field="category" header={t('table.category')} style={{ minWidth: '8rem' }} body={(data: Product) => data.category?.categoryName || 'N/A'} />
                    <Column
                        field="price"
                        sortable
                        header={t('table.price')}
                        style={{ minWidth: '10rem' }}
                        body={(rowData: Product) =>
                            rowData.oldPrice === rowData.newPrice ? (
                                <span className="font-bold text-black">{formatMoney(rowData.newPrice)}</span>
                            ) : (
                                <div>
                                    <span className="line-through text-gray-500 mr-2">{formatMoney(rowData.oldPrice)}</span>
                                    <span className="font-bold text-black">{formatMoney(rowData.newPrice)}</span>
                                </div>
                            )
                        }
                    />
                    <Column field="rating" header={t('table.rating')} style={{ minWidth: '5rem' }} sortable body={renderRating} />
                    <Column field="status" header={t('table.status')} style={{ minWidth: '10rem' }} sortable body={(rowData: Product) => renderStatus(rowData.status)} />
                    <Column
                        field="note"
                        header={t('table.reason')}
                        style={{ minWidth: '10rem' }}
                        body={(rowData: Product) => {
                            if (rowData.status === 2 && rowData.note) {
                                return <span>{rowData.note}</span>;
                            }
                            return null;
                        }}
                    />
                    <Column
                        header={t('table.actions')}
                        style={{ minWidth: '8rem' }}
                        body={(rowData: Product) => (
                            <div className="flex justify-left w-full gap-4">
                                <svg className="cursor-pointer" onClick={() => handleEdit(rowData)} xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000">
                                    <path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z" />
                                </svg>
                                <svg className="cursor-pointer" onClick={() => confirmDelete(rowData)} xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#EA3323">
                                    <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z" />
                                </svg>
                            </div>
                        )}
                    />
                </DataTable>

                <Dialog
                    header={t('deleteDialog.title')}
                    visible={confirmDialogVisible}
                    onHide={() => setConfirmDialogVisible(false)}
                    footer={
                        <div>
                            <Button label={t('deleteDialog.cancel')} icon="pi pi-times" onClick={() => setConfirmDialogVisible(false)} className="p-button-text py-1" />
                            <Button label={t('deleteDialog.confirm')} icon="pi pi-check" onClick={handleDelete} className="p-button-danger py-1" />
                        </div>
                    }
                    className="p-fluid"
                >
                    <p>{t('deleteDialog.message')}</p>
                </Dialog>
            </div>
        </div>
    );
}
