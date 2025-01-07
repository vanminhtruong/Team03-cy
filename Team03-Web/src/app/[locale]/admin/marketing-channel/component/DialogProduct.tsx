import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { TabView, TabPanel } from 'primereact/tabview';
import { useTranslations } from 'next-intl';
import formatDateTime from '@/src/utils/formatDateTime';
import formatMoney from '@/src/utils/formatMoney';
import { getProductByShop } from '@/src/app/[locale]/admin/marketing-channel/service/getProductPromotionByShop';
import '@/public/css/customCSS.css';

interface Product {
    productId: string;
    productName: string;
    image: string;
    category: {
        categoryName: string;
    };
    modifiedAt: string;
    oldPrice: number;
    isRegistered?: boolean;
}

interface Promotion {
    id: string;
    name: string;
    discountPercentage: number;
    startDate: string;
    endDate: string;
    status: string;
}

interface PromotionDialogProps {
    visible: boolean;
    onHide: () => void;
    selectedPromotion: Promotion | null;
    products: Product[];
    selectedProducts: Product[];
    onSelectionChange: (products: Product[]) => void;
    onRegister: () => void;
    onUnregister: () => void;
    loading: boolean;
}

const PromotionDialog: React.FC<PromotionDialogProps> = ({ visible, onHide, selectedPromotion, products, selectedProducts, onSelectionChange, onRegister, onUnregister, loading }) => {
    const t = useTranslations('promotion');
    const [registeredProducts, setRegisteredProducts] = useState<Product[]>([]);
    const [unregisteredProducts, setUnregisteredProducts] = useState<Product[]>([]);
    const [activeIndex, setActiveIndex] = useState<number>(0);

    const getSeverity = (status: string) => {
        switch (status) {
            case t('status.upcoming'):
                return 'info';
            case t('status.ongoing'):
                return 'success';
            case t('status.ended'):
                return 'danger';
            default:
                return 'info';
        }
    };

    const dialogHeader = () => (
        <div className="flex flex-col gap-2">
            <h2 className="text-xl font-bold">{selectedPromotion?.name || t('dialog.defaultTitle')}</h2>
            {selectedPromotion && (
                <div className="text-sm text-gray-600 flex gap-4">
                    <span className="text-[12px]">
                        <div className="text-red-500 font-bold text-[12px] py-1 px-3 bg-red-600">
                            <span className="text-white rounded-lg">{selectedPromotion.discountPercentage}%</span>
                        </div>
                    </span>
                    <div className="flex items-center justify-center">
                        <span className="text-[14px]">
                            {t('dialog.time')}: <span className="text-[14px]">{formatDateTime(selectedPromotion.startDate)}</span> - <span className="text-[14px]">{formatDateTime(selectedPromotion.endDate)}</span>
                        </span>
                    </div>
                    <Tag value={selectedPromotion.status} severity={getSeverity(selectedPromotion.status)} />
                </div>
            )}
        </div>
    );

    const dialogFooter = (
        <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">{t('dialog.selectedCount', { count: selectedProducts.length })}</div>
            <div className="flex gap-2">
                <Button
                    label={activeIndex === 0 ? t('buttons.registerProducts') : t('buttons.unregisterProducts')}
                    icon={activeIndex === 0 ? 'pi pi-check' : 'pi pi-times'}
                    className={`${activeIndex === 0 ? 'bg-black' : 'bg-red-500'}`}
                    onClick={activeIndex === 0 ? onRegister : onUnregister}
                    disabled={selectedProducts.length === 0}
                />
                <Button label={t('buttons.close')} icon="pi pi-times" severity="secondary" onClick={onHide} />
            </div>
        </div>
    );

    const fetchProductPromotion = async () => {
        try {
            const userData = localStorage.getItem('user');
            const user = userData ? JSON.parse(userData) : null;
            const shopId = user?.state?.id;
            const idPromotion = selectedPromotion?.id;

            if (!idPromotion || !shopId) {
                return;
            }

            const res = await getProductByShop(idPromotion, shopId);
            const registeredProductIds = res.map((product: Product) => product.productId);

            const updatedProducts = products.map((product) => ({
                ...product,
                isRegistered: registeredProductIds.includes(product.productId)
            }));

            setRegisteredProducts(updatedProducts.filter((product) => registeredProductIds.includes(product.productId)));
            setUnregisteredProducts(updatedProducts.filter((product) => !registeredProductIds.includes(product.productId)));
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchProductPromotion();
    }, [selectedPromotion, products, onRegister, onUnregister]);

    const renderProductTable = (productList: Product[]) => (
        <DataTable
            value={productList}
            selection={selectedProducts}
            onSelectionChange={(e) => onSelectionChange(e.value)}
            dataKey="productId"
            rows={8}
            paginator
            scrollable
            scrollHeight="400px"
            showGridlines
            stripedRows
            loading={loading}
            emptyMessage={t('dialog.table.noProducts')}
            className="mt-4"
            selectionMode="multiple"
        >
            <Column selectionMode="multiple" headerStyle={{ width: '5%' }} />
            <Column header={t('dialog.table.columns.number')} body={(_, { rowIndex }) => rowIndex + 1} style={{ width: '3%' }} />
            <Column header={t('dialog.table.columns.image')} style={{ width: '10%' }} body={(data: Product) => <img src={data.image || 'https://via.placeholder.com/50'} alt={data.productName} className="w-20 h-20 object-cover shadow rounded" />} />
            <Column field="productName" header={t('dialog.table.columns.productName')} sortable filter style={{ width: '15%' }} />
            <Column field="category.categoryName" header={t('dialog.table.columns.category')} sortable filter style={{ width: '20%' }} />
            <Column field="oldPrice" header={t('dialog.table.columns.originalPrice')} sortable style={{ width: '10%' }} body={(data: Product) => <span className="font-semibold">{formatMoney(data.oldPrice)}</span>} />
            <Column
                header={t('dialog.table.columns.discountedPrice')}
                style={{ width: '10%' }}
                body={(data: Product) => <span className="text-green-600 font-semibold">{selectedPromotion ? formatMoney(data.oldPrice * (1 - selectedPromotion.discountPercentage / 100)) : 'N/A'}</span>}
            />
            <Column field="modifiedAt" header={t('dialog.table.columns.lastUpdated')} body={(rowData: Product) => formatDateTime(rowData.modifiedAt)} style={{ width: '10%' }} />
        </DataTable>
    );

    return (
        <Dialog header={dialogHeader} visible={visible} style={{ width: '80vw' }} maximizable modal contentStyle={{ height: '600px' }} onHide={onHide} footer={dialogFooter}>
            <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                <TabPanel header={t('dialog.tabs.unregisteredProducts')}>{renderProductTable(unregisteredProducts)}</TabPanel>
                <TabPanel header={t('dialog.tabs.registeredProducts')}>{renderProductTable(registeredProducts)}</TabPanel>
            </TabView>
        </Dialog>
    );
};

export default PromotionDialog;
