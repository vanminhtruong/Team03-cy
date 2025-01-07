import React from 'react';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { useTranslations } from 'next-intl';

interface ShippingInfo {
    name: string;
    phone: string;
    address: string;
}

interface ShippingInformationProps {
    shipping: ShippingInfo;
}

export function ShippingInformation({ shipping }: ShippingInformationProps) {
    const t = useTranslations('checkout');

    return (
        <Card className="bg-gray-50 mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <i className="pi pi-map-marker mr-3 text-green-500"></i>
                {t('checkoutSuccess.shippingInformation')}
            </h3>
            <DataTable
                value={[
                    { label: t('checkoutSuccess.name'), value: shipping.name },
                    { label: t('checkoutSuccess.phone'), value: shipping.phone || t('checkoutSuccess.notProvided') },
                    { label: t('checkoutSuccess.address'), value: shipping.address }
                ]}
                showGridlines={false}
                className="border-none"
            >
                <Column
                    field="label"
                    className="py-2 text-gray-600 text-lg w-1/4 border-none"
                    headerClassName="hidden"
                    bodyClassName="border-none"
                />
                <Column
                    field="value"
                    className="py-2 text-left font-medium text-gray-800 border-none"
                    headerClassName="hidden"
                    bodyClassName="border-none"
                />
            </DataTable>
        </Card>
    );
} 