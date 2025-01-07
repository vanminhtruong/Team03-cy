'use client';

import React, { useEffect, useState } from 'react';
import { StatisticData } from '@/src/app/[locale]/admin/interface/statistic.interface';
import StatisticsOverview from '@/src/app/[locale]/admin/component/StatisticsOverview';
import StatisticsTable from '@/src/app/[locale]/admin/component/StatisticsTable';
import PeriodSelection from '@/src/app/[locale]/admin/component/PeriodSelection';
import SummaryTable from '@/src/app/[locale]/admin/component/SummaryTable';
import TopPurchasedProductsTable from '@/src/app/[locale]/admin/component/TopPurchasedProductsTable';
import TopPurchasedUsersTable from '@/src/app/[locale]/admin/component/TopPurchasedUsersTable';
import { getPeriodicStatistics, getStatistics } from '@/src/app/[locale]/admin/service/statistic.service';
import useUserStore from '@/src/app/[locale]/(auth)/stores/useStore';
import Spinner from '@/src/components/spinner/spinner';
import LineChartData from '@/src/app/[locale]/admin/component/LineChartData';
import PieChart from './component/PieChart';
import { useTranslations } from 'next-intl';

const Statistics = () => {
    const [statisticsData, setStatisticsData] = useState<StatisticData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const { id } = useUserStore();
    const t = useTranslations('statistic')
    const [data, setData] = useState({
        revenue: 0,
        orderStatistic: {
            totalOfOrders: 0,
        },
        totalOfProducts: 0,
        topPurchasedProducts: [],
        totalOfCustomers: 0,
        topPurchasedUsers: [],
    });
    const [period, setPeriod] = useState('week');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [year, setYear] = useState<number>(2024);

    const fetchData = async (id: number, period: string, startDate: any, endDate: any) => {
        if (!id) {
            console.log('User ID is not yet available');
            return;
        }

        try {
            const result = await getStatistics(id, period, startDate, endDate);
            setData({
                ...result,
                orderStatistic: result?.orderStatistic || { totalOfOrders: 0 },
            });
        } catch (error) {
            console.error('Error fetching statistics:', error);
        }
    };

    useEffect(() => {
        if (id) {
            fetchData(id, period, startDate, endDate);
        }
    }, [id, period, startDate, endDate]);

    useEffect(() => {
        if (!id) {
            console.log('User ID is not yet available');
            return;
        }
        const fetchStatistics = async (id: number) => {
            try {
                const result = await getPeriodicStatistics(id);
                setStatisticsData(result);
            } catch (error) {
                console.error('Error fetching periodic statistics:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStatistics(id);
    }, [id]);

    const formatCurrency = (value: number) =>
        value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

    const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newYear = parseInt(event.target.value);
        setYear(newYear);
    };

    const years = Array.from({ length: 15 }, (_, i) => 2010 + i);

    return (
        <div className="p-4">
            <h2 className="text-center text-black text-2xl font-bold mb-6">{t('statisticOverview')}</h2>
            {loading ? (
                <Spinner isLoading={loading} />
            ) : (
                <>
                    <StatisticsOverview statisticsData={statisticsData} formatCurrency={formatCurrency} t={t} />
                    <div className="mb-4">
                        <label htmlFor="year" className="block text-lg font-semibold">
                            {t('selectYear')}
                        </label>
                        <select
                            id="year"
                            value={year}
                            onChange={handleYearChange}
                            className="p-2 border rounded-md w-full"
                        >
                            {years.map((year) => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ))}
                        </select>
                    </div>
                    <LineChartData year={year} t={t} />
                    <PeriodSelection
                        t={t}
                        period={period}
                        startDate={startDate}
                        endDate={endDate}
                        setPeriod={setPeriod}
                        setStartDate={setStartDate}
                        setEndDate={setEndDate}
                    />
                    <PieChart data={data} year={year} t={t} />
                    <StatisticsTable statisticsData={statisticsData} formatCurrency={formatCurrency} t={t} />
                    <SummaryTable data={data} formatCurrency={formatCurrency} t={t} />
                    <div className="flex gap-4">
                        <div className="w-3/5">
                            <TopPurchasedProductsTable
                                t={t}
                                products={data.topPurchasedProducts}
                                formatCurrency={formatCurrency}
                            />
                        </div>
                        <div className="w-2/5">
                            <TopPurchasedUsersTable users={data.topPurchasedUsers} t={t} />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Statistics;
