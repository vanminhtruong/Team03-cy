'use client'
import React from 'react'
import { Button } from 'primereact/button'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'

export interface OrderActionsProps {
  orderId?: number;
  shopId?: string;
}

const OrderActions = ({ orderId, shopId }: OrderActionsProps) => {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale;

  const handleViewOrder = (id: number) => {
    if (!shopId) return;
    router.push(`/${locale}/admin/orders/order-history?shopId=${shopId}&orderId=${id}`);
  };

  return (
    <div className="flex gap-2 justify-center">
      <Button 
        icon="pi pi-eye" 
        rounded 
        text
        severity="secondary"
        className="w-10 h-10 !p-0 hover:bg-gray-100 transition-colors duration-200"
        style={{ fontSize: '1rem' }}
        tooltip="Xem chi tiết"
        tooltipOptions={{ position: 'top' }}
        onClick={() => orderId && handleViewOrder(orderId)}
      />
    </div>
  )
}

export default OrderActions 