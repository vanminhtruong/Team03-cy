'use client'
import React, { useEffect, useState } from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import OrderStatusTag from './OrderStatusTag'
import OrderActions from './OrderActions'
import OrderHeader from './OrderHeader'
import { useTranslations } from 'next-intl'

export interface Order {
    id: number;
    orderCode: string;
    status: string;
    totalPrice: number;
    createdAt: string;
    shippingAddress: string;
    phoneReception: string | null;
    customerName?: string;
    user: {
        name: string;
        email: string;
        phone: string;
    };
}

export interface OrderTableProps {
    orders: Order[];
    loading: boolean;
    globalFilter: string;
    setGlobalFilter: (filter: string) => void;
    onRefresh: () => void;
    onExport?: () => void;
}

const OrderTable = ({
    orders,
    loading,
    globalFilter,
    setGlobalFilter,
    onRefresh,
    onExport,
}: OrderTableProps) => {
    const t = useTranslations()
    const [shopId, setShopId] = useState<string>('');

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const userData = JSON.parse(userStr);
                setShopId(userData.state.id);
            } catch (error) {
                console.error('Error parsing user data from localStorage:', error);
            }
        }
    }, []);

    const priceBodyTemplate = (rowData: Order) => {
        return <span className="font-medium">{rowData.totalPrice.toLocaleString()}đ</span>
    }

    const dateBodyTemplate = (rowData: Order) => {
        return <span className="text-gray-600">{new Date(rowData.createdAt).toLocaleString()}</span>
    }

    const customerNameTemplate = (rowData: Order) => {
        return <span className="font-medium">{rowData.customerName || rowData.user.name}</span>;
    };

    const customerPhoneTemplate = (rowData: Order) => {
        return <span className="text-gray-600">{rowData.phoneReception || rowData.user.phone || t('admin.orders.table.noPhone')}</span>;
    };

    const addressTemplate = (rowData: Order) => {
        return <span className="text-gray-600">{rowData.shippingAddress}</span>;
    };

    return (
        <div className="p-4">
            <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                <DataTable
                    value={orders}
                    loading={loading}
                    paginator
                    rows={10}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    className="[&_.p-datatable-wrapper]:bg-white [&_.p-datatable-thead_th]:bg-gray-50
                                [&_.p-datatable-thead_th]:text-gray-600 [&_.p-datatable-thead_th]:font-semibold
                                [&_.p-datatable-tbody_td]:py-4 [&_.p-datatable-tbody_tr:hover]:bg-gray-50
                                [&_.p-paginator]:bg-white [&_.p-paginator]:border-t [&_.p-paginator]:border-gray-200"
                    emptyMessage={<div className="text-center py-6 text-gray-500">{t('admin.orders.table.noOrders')}</div>}
                    header={
                        <OrderHeader
                            globalFilter={globalFilter}
                            setGlobalFilter={setGlobalFilter}
                            ordersCount={orders.length}
                            onRefresh={onRefresh}
                            onExport={onExport}
                        />
                    }
                    globalFilter={globalFilter}
                    dataKey="id"
                >
                    <Column
                        body={(rowData, options) => options.rowIndex + 1}
                        header={t('admin.orders.table.no')}
                        style={{width: '4rem', textAlign: 'left', paddingLeft: '30px'}}
                    />
                    <Column field="orderCode" header={t('admin.orders.table.orderCode')} className='w-[12rem]' style={{paddingLeft: '40px'}} sortable />
                    <Column body={customerNameTemplate} header={t('admin.orders.table.customer')} style={{ width: '15rem' }} sortable sortField="user.name" />
                    <Column body={customerPhoneTemplate} header={t('admin.orders.table.phone')} style={{ width: '10rem' }} sortable sortField="user.phone" />
                    <Column body={priceBodyTemplate} header={t('admin.orders.table.total')} style={{ width: '10rem' }} sortable />
                    <Column body={dateBodyTemplate} header={t('admin.orders.table.orderDate')} style={{ width: '12rem' }} sortable />
                    <Column
                        body={(rowData) => (
                            <OrderActions
                                orderId={rowData.id}
                                shopId={shopId}
                            />
                        )}
                        header={t('admin.orders.table.actions')}
                        className='text-center w-[1px]'
                        style={ {width: '1px'} }
                    />
                </DataTable>
            </div>
        </div>
    )
}

export default OrderTable
