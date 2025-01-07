import React, { useEffect, useState } from 'react';
import { Chart } from 'primereact/chart';
import { getRevenueStatistic } from '@/src/app/[locale]/admin/service/statistic.service';
import { useUserStore } from '../stores/user';

interface LineChartProps {
    year: number;
    t: (key: string) => string;
}

interface RevenueData {
    month: number;
    revenue: number;
    growthRate: number;
}

const LineChartData: React.FC<LineChartProps> = ({ year,t }) => {
    const [chartData, setChartData] = useState<any>(null);
    const {id} = useUserStore();

    const fetchRevenueData = async (year: number) => {
        try {
            const result = await getRevenueStatistic(id,year);
            const months = result.data.map((item: RevenueData) => item.month);
            const revenues = result.data.map((item: RevenueData) => item.revenue);

            setChartData({
                labels: months,
                datasets: [
                    {
                        label: t('revenue'),
                        data: revenues,
                        fill: false,
                        borderColor: '#42A5F5',
                        tension: 0.4,
                    }
                ]
            });
        } catch (error) {
            console.error('Error fetching revenue statistic:', error);
        }
    };

    useEffect(() => {
        fetchRevenueData(year);
    }, [year]);

    return (
        <div className="card">
            <h2 className="text-center text-black text-xl font-bold mb-4">{t('revenueTrendFor')} {year}</h2>
            {chartData ? <Chart type="line" data={chartData} /> : <p>{t('loading')}</p>}
        </div>
    );
};

export default LineChartData;
