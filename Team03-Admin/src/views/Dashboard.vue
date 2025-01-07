<script setup>
import {ref, onMounted} from 'vue';
import axios from 'axios';
import imageDefault from '/dashboard/default-image.avif';
import {fetchRevenueDataFromApi, fetchStatistics} from "@/views/service/statistic.js";

const stats = ref({});
const topSellerShops = ref([]);
const chartData = ref(null);
const chartOptions = ref(null);
const revenueChartData = ref(null);
const revenueChartOptions = ref(null);
const year = ref(2024);
const chartDataRes = ref();
const chartOptionsRes = ref();
onMounted(() => {
    fetchRevenueData(year.value);
    fetchShopPerformanceData();
    chartOptions.value = setChartOptions();
});
onMounted(() => {
    chartDataRes.value = setChartDataRes();
    chartOptionsRes.value = setChartOptionsRes();
});

const setChartDataRes = () => {
    const documentStyle = getComputedStyle(document.documentElement);

    return {
        labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
        datasets: [
            {
                type: 'line',
                label: 'Dataset 1',
                borderColor: documentStyle.getPropertyValue('--p-orange-500'),
                borderWidth: 2,
                fill: false,
                tension: 0.4,
                data: [50, 25, 12, 48, 56, 76, 42]
            },
            {
                type: 'bar',
                label: 'Dataset 2',
                backgroundColor: documentStyle.getPropertyValue('--p-gray-500'),
                data: [21, 84, 24, 75, 37, 65, 34],
                borderColor: 'white',
                borderWidth: 2
            },
            {
                type: 'bar',
                label: 'Dataset 3',
                backgroundColor: documentStyle.getPropertyValue('--p-cyan-500'),
                data: [41, 52, 24, 74, 23, 21, 32]
            }
        ]
    };
};
const fetchApi = async (year) => {
    try {
        const response = await axios.get(`https://team03-api.cyvietnam.id.vn/v1/api/test/revenue-statistic?year=${year}`);

        if (response.status === 200) {
            const data = response.data.data;
            const months = data.month;
            const revenueData = data.dataSet.revenueData;
            const growthRateData = data.dataSet.growthRateData;

            chartDataRes.value = {
                labels: months.map(month => getMonthName(month)),
                datasets: [
                    {
                        type: 'line',
                        label: 'Revenue',
                        borderColor: '#00C4D3',
                        borderWidth: 2,
                        fill: false,
                        tension: 0.4,
                        data: revenueData
                    },
                    {
                        type: 'bar',
                        label: 'Growth Rate (%)',
                        backgroundColor: '#6E6E6E',
                        data: growthRateData,
                        borderColor: 'white',
                        borderWidth: 2,
                        yAxisID: 'y1'
                    }
                ]
            };

            chartOptionsRes.value = setChartOptionsRes();
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
};

const setChartOptionsRes = () => {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--p-text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--p-text-muted-color');
    const surfaceBorder = documentStyle.getPropertyValue('--p-content-border-color');

    return {
        maintainAspectRatio: false,
        aspectRatio: 0.6,
        plugins: {
            legend: {
                labels: {
                    color: textColor
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    color: textColorSecondary
                },
                grid: {
                    color: surfaceBorder
                }
            },
            y: {
                ticks: {
                    color: textColorSecondary
                },
                grid: {
                    color: surfaceBorder
                }
            },
            y1: {
                type: 'linear',
                display: true,
                position: 'right',
                ticks: {
                    color: textColorSecondary
                },
                grid: {
                    drawOnChartArea: false,
                    color: surfaceBorder
                }
            }
        }
    };
};
const getMonthName = (monthNumber) => {
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    return months[monthNumber - 1];
};


const fetchRevenueData = async (year) => {
    try {
        const response = await fetchRevenueDataFromApi(year);

        const data = response.data;
        const dataWithGrowthRate = calculateGrowthRate(data);

        revenueChartData.value = setRevenueChartData(dataWithGrowthRate);
        revenueChartOptions.value = setRevenueChartOptions();
    } catch (error) {
        console.error("Error fetching revenue data:", error);
    }
};

const calculateGrowthRate = (data) => {
    return data.map((item, index) => {
        if (index === 0) {
            return {...item, growthRate: 0};
        }

        const prevMonthRevenue = data[index - 1].revenue;
        const growthRate = ((item.revenue - prevMonthRevenue) / prevMonthRevenue) * 100;
        return {...item, growthRate: growthRate.toFixed(0)};
    });
};

const setRevenueChartData = (data) => {
    const documentStyle = getComputedStyle(document.documentElement);

    return {
        labels: data.map((item) => getMonthName(item.month)),
        datasets: [
            {
                label: "Revenue",
                fill: false,
                borderColor: documentStyle.getPropertyValue('--p-cyan-500'),
                tension: 0.4,
                data: data.map((item) => item.revenue),
            },
            {
                label: "Growth Rate (%)",
                fill: false,
                borderColor: documentStyle.getPropertyValue('--p-gray-500'),
                tension: 0.4,
                data: data.map((item) => item.growthRate),
                yAxisID: "y1",
            }
        ]
    };
};

const setRevenueChartOptions = () => {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--p-text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--p-text-muted-color');
    const surfaceBorder = documentStyle.getPropertyValue('--p-content-border-color');

    return {
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: {
                    color: textColor
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    color: textColorSecondary
                },
                grid: {
                    color: surfaceBorder
                }
            },
            y: {
                type: 'linear',
                display: true,
                position: 'left',
                ticks: {
                    color: textColorSecondary
                },
                grid: {
                    color: surfaceBorder
                }
            },
            y1: {
                type: 'linear',
                display: true,
                position: 'right',
                ticks: {
                    color: textColorSecondary
                },
                grid: {
                    drawOnChartArea: false,
                    color: surfaceBorder
                }
            }
        }
    };
};


const fetchShopPerformanceData = async () => {
    try {
        const response = await fetchStatistics();
        const topSellerShops = response.data.data.topSellerShops;

        chartData.value = {
            labels: topSellerShops.map(shop => shop.shopName),
            datasets: [
                {
                    label: 'Products',
                    backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--p-cyan-500'),
                    data: topSellerShops.map(shop => shop.productCount),
                },
                {
                    label: 'Sold',
                    backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--p-gray-500'),
                    data: topSellerShops.map(shop => shop.sold),
                },
            ],
        };

        chartOptions.value = setChartOptions();
    } catch (error) {
        console.error("Error fetching shop performance data:", error);
    }
};

const setChartOptions = () => {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--p-text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--p-text-muted-color');
    const surfaceBorder = documentStyle.getPropertyValue('--p-content-border-color');

    return {
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: {
                    color: textColor,
                },
            },
        },
        scales: {
            x: {
                ticks: {
                    color: textColorSecondary,
                    font: {
                        weight: 500,
                    },
                },
                grid: {
                    display: false,
                    drawBorder: false,
                },
            },
            y: {
                ticks: {
                    color: textColorSecondary,
                },
                grid: {
                    color: surfaceBorder,
                    drawBorder: false,
                },
            },
        },
    };
};
const updateYear = () => {
    fetchRevenueData(year.value);
    fetchApi(year.value)
};
const statLabels = {
    totalUsers: {label: 'Total Users', icon: 'pi pi-users'},
    totalNewUsers: {label: 'Total New Users', icon: 'pi pi-user-plus'},
    totalShops: {label: 'Total Shops', icon: 'pi pi-store'},
    totalLockedShops: {label: 'Total Locked Shops', icon: 'pi pi-lock'},
    totalPendingShop: {label: 'Total Pending Shops', icon: 'pi pi-clock'},
    totalRejectedShops: {label: 'Total Rejected Shops', icon: 'pi pi-times'},
    totalLockedProducts: {label: 'Total Locked Products', icon: 'pi pi-lock'},
    totalRejectedProducts: {label: 'Total Rejected Products', icon: 'pi pi-times'}
};

const fetchData = async () => {
    try {
        const response = await axios.get('https://team03-api.cyvietnam.id.vn/v1/api/admin/statistics');
        const data = response.data.data;
        stats.value = {
            totalUsers: data.totalUsers,
            totalNewUsers: data.totalNewUsers,
            totalShops: data.totalShops,
            totalLockedShops: data.totalLockedShops,
            totalPendingShop: data.totalPendingShop,
            totalRejectedShops: data.totalRejectedShops,
            totalLockedProducts: data.totalLockedProducts,
            totalRejectedProducts: data.totalRejectedProducts
        };
        topSellerShops.value = data.topSellerShops;
        chartData.value = setChartData(data);
        chartOptions.value = setChartOptions();
    } catch (error) {
        console.error('Error fetching data:', error);
    }
};

function setChartData(data) {
    const documentStyle = getComputedStyle(document.documentElement);
    return {
        labels: topSellerShops.value.map((shop) => shop.shopName),
        datasets: [
            {
                label: 'Products',
                backgroundColor: documentStyle.getPropertyValue('--p-primary-400'),
                data: topSellerShops.value.map((shop) => shop.productCount),
                barThickness: 32
            },
            {
                label: 'Sold',
                backgroundColor: documentStyle.getPropertyValue('--p-primary-300'),
                data: topSellerShops.value.map((shop) => shop.sold),
                barThickness: 32
            }
        ]
    };
}

onMounted(() => {
    fetchRevenueData(year.value);
    fetchShopPerformanceData();
    fetchData()
    chartOptions.value = setChartOptions();
    fetchApi(year.value);
});

</script>

<template>
    <span class="flex text-[30px] my-4 items-center justify-center">Statistic Overview</span>
    <div class="grid grid-cols-12 gap-8">
        <div v-for="(value, key) in stats" :key="key" class="my-4 col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                            <span class="block text-muted-color font-medium mb-4">
                                <i :class="statLabels[key].icon" class="mr-2 text-xl"></i>{{ statLabels[key].label }}
                            </span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ value }}</div>
                    </div>
                    <div class="flex items-center justify-center bg-blue-100 dark:bg-blue-400/10 rounded-border"
                         style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-chart-line text-blue-500 !text-xl"></i>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="col-span-12 my-4">
        <div class="bg-white p-6 rounded-lg shadow-xl hover:shadow-2xl transition-shadow duration-300">
            <label for="yearInput" class="font-semibold text-2xl text-gray-800 mb-6">Select Year</label>
            <input
                v-model="year"
                id="yearInput"
                type="number"
                min="2020"
                max="2099"
                class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 placeholder-gray-400"
                @change="updateYear"
                placeholder="Enter Year"
            />
        </div>
    </div>
    <div class="card">
        <Chart type="bar" :data="chartDataRes" :options="chartOptionsRes" class="h-[30rem]"/>
    </div>
    <div class="grid grid-cols-12 gap-8">
        <div class="col-span-12">
            <div class="card p-4">
                <div class="font-semibold text-xl mb-4">Top Seller Shops</div>
                <DataTable :value="topSellerShops" :rows="5" :paginator="true" responsiveLayout="scroll"
                           class="datatable">
                    <Column field="shopName" header="Shop Name" style="width: 20%"></Column>
                    <Column field="rating" header="Rating" style="width: 10%"></Column>
                    <Column field="productCount" header="Products" style="width: 10%"></Column>
                    <Column field="sold" header="Sold" style="width: 10%"></Column>
                    <Column field="feedbackCount" header="Feedback" style="width: 10%"></Column>
                    <Column header="Profile Picture" style="width: 20%">
                        <template #body="slotProps">
                            <div class="w-12 h-12 flex items-center justify-center border border-gray-200 bg-gray-100">
                                <img :src="slotProps.data.profilePicture || imageDefault" alt="Shop Image"
                                     class="w-full h-full object-cover"/>
                            </div>
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>
        <div class="col-span-12">
            <div class="card">
                <div class="font-semibold text-xl mb-4">Shop Performance</div>
                <Chart type="bar" :data="chartData" :options="chartOptions" class="h-[30rem]"/>
            </div>
        </div>
        <div class="col-span-12">
            <div class="card">
                <Chart type="line" :data="revenueChartData" :options="revenueChartOptions" class="h-[30rem]"/>
            </div>
        </div>
    </div>
</template>
