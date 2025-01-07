'use client'
import React, { useEffect, useState } from 'react'
import { TabView, TabPanel } from 'primereact/tabview'
import OrderTable, { Order } from './_components/OrderTable'
import { statusMap } from './_components/OrderStatusTag'
import fetchOrders from './services/orders'
import { useTranslations } from 'next-intl'

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [globalFilter, setGlobalFilter] = useState('')
  const [activeTab, setActiveTab] = useState(0)
  const t = useTranslations('admin.orders')

  useEffect(() => {
    handleRefresh()
  }, [activeTab])

  const handleRefresh = async () => {
    try {
      setLoading(true)
      const data = await fetchOrders(activeTab === 0 ? '' : (activeTab - 1).toString())
      setOrders(data)
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = () => {

  }

  return (
    <div className="min-h-screen card h-full">
      <div className="p-2">
        <div className="container mx-auto ">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
          </div>

          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <TabView
              activeIndex={activeTab}
              onTabChange={(e) => setActiveTab(e.index)}
              className="border-none [&_.p-tabview-nav]:bg-gray-50 [&_.p-tabview-nav]:border-b-2 [&_.p-tabview-nav]:border-gray-200
                [&_.p-tabview-nav-link]:px-6 [&_.p-tabview-nav-link]:py-4 [&_.p-tabview-nav-link]:text-gray-600
                [&_.p-tabview-nav-link]:font-semibold [&_.p-tabview-nav-link]:transition-all
                [&_.p-tabview-nav-link:hover]:bg-white [&_.p-tabview-nav-link:hover]:text-gray-900
                [&_.p-highlight_.p-tabview-nav-link]:border-b-2 [&_.p-highlight_.p-tabview-nav-link]:border-blue-500
                [&_.p-tabview-panels]:p-0
                [&_.p-tabview-nav-next]:!bg-gray-50 [&_.p-tabview-nav-next]:!border-none [&_.p-tabview-nav-next]:!text-gray-600
                [&_.p-tabview-nav-prev]:!bg-gray-50 [&_.p-tabview-nav-prev]:!border-none [&_.p-tabview-nav-prev]:!text-gray-600
                [&_.p-tabview-nav-next.p-disabled]:!hidden [&_.p-tabview-nav-prev.p-disabled]:!hidden
                [&_.p-tabview-nav-next:hover]:!bg-gray-100 [&_.p-tabview-nav-prev:hover]:!bg-gray-100
                [&_.p-tabview-nav-next]:!w-10 [&_.p-tabview-nav-prev]:!w-10
                [&_.p-tabview-nav-next]:!h-full [&_.p-tabview-nav-prev]:!h-full
                [&_.p-tabview-nav-next]:!flex [&_.p-tabview-nav-prev]:!flex
                [&_.p-tabview-nav-next]:!items-center [&_.p-tabview-nav-prev]:!items-center
                [&_.p-tabview-nav-next]:!justify-center [&_.p-tabview-nav-prev]:!justify-center
                "
              scrollable
            >
              <TabPanel header={`${t('status.all')}`}>
                <OrderTable
                  orders={orders}
                  loading={loading}
                  globalFilter={globalFilter}
                  setGlobalFilter={setGlobalFilter}
                  onRefresh={handleRefresh}
                  onExport={handleExport}
                />
              </TabPanel>
              {Object.entries(statusMap).filter(([key]) => key !== "").map(([key, { label, count }]) => (
                <TabPanel key={key} header={`${t(`status.${label}`)}`}>
                  <OrderTable
                    orders={orders}
                    loading={loading}
                    globalFilter={globalFilter}
                    setGlobalFilter={setGlobalFilter}
                    onRefresh={handleRefresh}
                    onExport={handleExport}
                  />
                </TabPanel>
              ))}
            </TabView>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Orders
