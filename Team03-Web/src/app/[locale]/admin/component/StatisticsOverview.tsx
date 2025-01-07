import React from 'react';
import { Card } from 'primereact/card';

interface Statistic {
    period: string;
    statistics: {
        revenue: number;
        totalOfOrders: number;
        soldProducts: number;
    };
}

interface StatisticsOverviewProps {
    statisticsData: Statistic[];
    formatCurrency: (value: number) => string;
    t: (key: string) => string;
}

const StatisticsOverview = ({ statisticsData, formatCurrency,t }: StatisticsOverviewProps) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {statisticsData.map((stat, index) => (
            <div className="col-12 md:col-3" key={stat.period}>
                <Card className='text-black' title={stat.period}>
                    <p className="font-semibold text-green-600 text-[16px]">💰 {t('revenue')}: {formatCurrency(stat.statistics.revenue)}</p>
                    <p>🛒 {t('totalOrders')}: {stat.statistics.totalOfOrders}</p>
                    <p>📦 {t('soldProducts')}: {stat.statistics.soldProducts}</p>
                </Card>
            </div>
        ))}
    </div>
);

export default StatisticsOverview;
