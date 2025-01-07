'use client'
import React, { useEffect } from 'react'
import { Button } from 'primereact/button'
import { InputText } from 'primereact/inputtext'
import { useTranslations } from 'next-intl'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'

export interface OrderHeaderProps {
  globalFilter: string;
  setGlobalFilter: (filter: string) => void;
  ordersCount: number;
  onRefresh: () => void;
  onExport?: () => void;
}

const OrderHeader = ({
  globalFilter,
  setGlobalFilter,
  ordersCount,
  onRefresh,
  onExport
}: OrderHeaderProps) => {
  const t = useTranslations('admin.orders')
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    const searchValue = searchParams.get('search') || ''
    setGlobalFilter(searchValue)
  }, [searchParams, setGlobalFilter])

  const handleSearch = (value: string) => {
    setGlobalFilter(value)
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set('search', value)
    } else {
      params.delete('search')
    }
    router.replace(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap gap-4 items-center justify-between p-4 border-b border-gray-200">
      <div className="flex items-center max-lg:flex-col max-lg:items-start max-lg:gap-4 max-lg:w-full">
        <span className="w-[280px] max-lg:w-full">
          <InputText
            type="search"
            placeholder={t('table.search')}
            className="w-[400px] py-3 px-3 text-[14px] bg-gray-50 border border-gray-200 rounded-lg
                     hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200
                     transition-colors duration-200 ml-[-20px] max-lg:w-full max-lg:ml-0"
            value={globalFilter}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </span>
        <div className="ml-[120px] text-sm text-gray-500 max-lg:ml-0">
          {ordersCount > 0 && (
            <span>{t('table.foundOrders', { count: ordersCount })}</span>
          )}
        </div>
      </div>
      <div className="flex gap-2 max-lg:w-full max-lg:justify-end">
        <Button 
          icon="pi pi-refresh" 
          rounded 
          outlined
          severity="secondary"
          onClick={onRefresh}
          tooltip={t('refresh')}
          tooltipOptions={{ position: 'top' }}
          className="border-gray-300 hover:border-black hover:bg-black-50/50 transition-all duration-200 text-btn-dart"
        />
      </div>
    </div>
  )
}

export default OrderHeader 