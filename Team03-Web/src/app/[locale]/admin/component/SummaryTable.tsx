import React from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Card } from 'primereact/card';

interface SummaryTableProps {
    data: {
        revenue: number;
        orderStatistic: {
            totalOfOrders: number;
        };
        totalOfProducts: number;
        totalOfCustomers: number;
    };
    formatCurrency: (value: number) => string;
    t: (key: string) => string;
}

const SummaryTable = ({ data, formatCurrency,t }: SummaryTableProps) => (
    <div>
        <Card
            title={t('statisticsSummary')}
            subTitle={t('keyMetrics')}
            className="shadow-lg"
            style={{ width: '100%', margin: 'auto' }}
        >
            <DataTable
                value={[
                    {
                        label: t('totalRevenue'),
                        value: formatCurrency(data?.revenue || 0),
                    },
                    {
                        label: t('totalOrders'),
                        value: data?.orderStatistic?.totalOfOrders || 0,
                    },
                    {
                        label: t('totalProducts'),
                        value: data?.totalOfProducts || 0,
                    },
                    {
                        label: t('totalCustomers'),
                        value: data?.totalOfCustomers || 0,
                    },
                ]}
                stripedRows
                responsiveLayout="scroll"
            >
                <Column field="label" header={t('metric')} />
                <Column field="value" header={t('value')} />
            </DataTable>
        </Card>
    </div>
);

export default SummaryTable;
