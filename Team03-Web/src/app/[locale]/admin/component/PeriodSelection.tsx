import React, { useEffect } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';

interface PeriodSelectionProps {
    period: string;
    startDate: string;
    endDate: string;
    setPeriod: (period: string) => void;
    setStartDate: (date: string) => void;
    setEndDate: (date: string) => void;
    t: (key: string) => string;
}

const periodOptions = [
    { label: 'Today', value: 'today' },
    { label: 'Week', value: 'week' },
    { label: 'Month', value: 'month' },
    { label: 'Year', value: 'year' },
    { label: 'Custom', value: 'custom' }
];

const PeriodSelection = ({ period, startDate, endDate, setPeriod, setStartDate, setEndDate, t }: PeriodSelectionProps) => {
    useEffect(() => {
        if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
            setEndDate(startDate);
        }
    }, [startDate, endDate, setEndDate]);

    const translatedPeriodOptions = periodOptions.map((option) => ({
        ...option,
        label: t(option.value),
    }));

    return (
        <div className="mb-6 flex justify-center items-center">
            <label htmlFor="period" className="mr-4 text-lg font-medium text-gray-700">
                {t('selectPeriod')}{' '}
            </label>

            <Dropdown
                id="period"
                value={period}
                options={translatedPeriodOptions}
                onChange={(e) => setPeriod(e.value)}
                className="w-60"
                placeholder="Select Period"
            />

            {period === 'custom' && (
                <div className="mb-6 flex justify-center gap-6 mx-4 mt-4">
                    <div>
                        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                            {t('startDate')}:
                        </label>
                        <Calendar
                            id="startDate"
                            value={startDate ? new Date(startDate) : null}
                            onChange={(e) => {
                                const newStartDate = e.value ? e.value.toISOString().split('T')[0] : '';
                                setStartDate(newStartDate);

                                if (newStartDate && new Date(newStartDate) > new Date(endDate)) {
                                    setEndDate(newStartDate);
                                }
                            }}
                            dateFormat="yy-mm-dd"
                            showIcon
                            className="w-48 mt-1"
                        />
                    </div>
                    <div>
                        <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                            {t('endDate')}:
                        </label>
                        <Calendar
                            id="endDate"
                            value={endDate ? new Date(endDate) : null}
                            onChange={(e) => {
                                const newEndDate = e.value ? e.value.toISOString().split('T')[0] : '';
                                setEndDate(newEndDate);
                                if (newEndDate && new Date(newEndDate) < new Date(startDate)) {
                                    setStartDate(newEndDate);
                                }
                            }}
                            dateFormat="yy-mm-dd"
                            showIcon
                            className="w-48 mt-1"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default PeriodSelection;
