import React from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { StatisticData } from '@/src/app/[locale]/admin/interface/statistic.interface';
interface StatisticsTableProps {
    statisticsData: StatisticData[];
    formatCurrency: (value: number) => string;
    t: (key: string) => string;
}

const StatisticsTable = ({ statisticsData, formatCurrency,t }: StatisticsTableProps) => {
    const revenueBodyTemplate = (rowData: StatisticData) => (
        <Tag value={formatCurrency(rowData?.statistics?.revenue)} severity="success" className="p-tag-rounded" />
    );

    const feedbackBodyTemplate = (rowData: StatisticData) => {
        const feedbacks = rowData?.statistics?.totalOfFeedbacks ?? 0;
        const severity = feedbacks > 5 ? 'success' : feedbacks > 0 ? 'warning' : 'danger';
        return <Tag value={feedbacks} severity={severity} className="p-tag-rounded" />;
    };

    return (
        <div className="card mt-6 shadow-md">
            <DataTable value={statisticsData} responsiveLayout="scroll" stripedRows>
                <Column field="period" header={t('period')}></Column>
                <Column field="statistics.totalOfProducts" header={t('totalProducts')}></Column>
                <Column field="statistics.soldProducts" header={t('soldProducts')}></Column>
                <Column header={t('feedback')} body={feedbackBodyTemplate}></Column>
                <Column field="statistics.averageRating" header={t('avgRating')}></Column>
                <Column field="statistics.lockedProducts" header={t('lockedProducts')}></Column>
                <Column field="statistics.totalOfCustomers" header={t('customers')}></Column>
                <Column field="statistics.totalOfOrders" header={t('orders')}></Column>
                <Column header={t('revenue')} body={revenueBodyTemplate}></Column>
            </DataTable>
        </div>
    );
};

export default StatisticsTable;
