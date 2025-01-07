import React from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

interface Product {
    productName: string;
    sold: number;
    price: number;
    rating: number;
    image: string;
}

interface TopPurchasedProductsTableProps {
    products: Product[];
    formatCurrency: (value: number) => string;
    t: (key: string) => string;
}

const TopPurchasedProductsTable = ({ products, formatCurrency, t }: TopPurchasedProductsTableProps) => (
    <div className="mt-8">
        <h3 className="text-center font-semibold text-2xl mb-6 text-gray-800">{t('topPurchasedProducts')}</h3>
        <DataTable value={products}>
            <Column field="productName" header={t('productNames')} />
            <Column field="sold" header={t('sold')} />
            <Column field="price" header={t('price')} body={(rowData) => formatCurrency(rowData.price)} />
            <Column field="rating" header={t('rating')} />
            <Column header={t('image')} body={(rowData) => <img src={rowData.image} alt={rowData.productName} width={75} />} />
        </DataTable>
    </div>
);

export default TopPurchasedProductsTable;
