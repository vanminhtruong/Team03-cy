import React, { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface DataProps {
    data: any;
    year: number;
    t: (key: string) => string;
}

const PieChart = ({ data, year, t }: DataProps) => {
    const [chartData, setChartData] = useState<any>(null);

    useEffect(() => {
        if (data && data.orderStatistic?.orderByStatus) {
            const orderStatusData = data.orderStatistic.orderByStatus.map((status: any) => ({
                label: t(status.status),
                value: status.order
            }));

            const labels = orderStatusData.map((status: any) => status.label);
            const values = orderStatusData.map((status: any) => status.value);

            const pieChartData = {
                labels: labels,
                datasets: [
                    {
                        label: `${t('orderStatus')} ${year}`,
                        data: values,
                        backgroundColor: [
                            '#FF6384', '#36A2EB', '#FFCE56', '#FF5733', '#4CAF50',
                            '#FFC300', '#8E44AD', '#3498DB', '#2ECC71', '#E74C3C'
                        ],
                        borderColor: '#fff',
                        borderWidth: 1
                    }
                ]
            };

            setChartData(pieChartData);
        }
    }, [data, year, t]);

    return (
        <div className="pie-chart-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <h3 className="text-center">{t('orderStatusDistribution')}</h3>
            <div style={{ width: '500px', height: '500px' }}>
                {chartData ? <Pie data={chartData} /> : <p>Loading chart data...</p>}
            </div>
        </div>
    );
};

export default PieChart;
