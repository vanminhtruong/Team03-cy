'use client'
import React from 'react'
import { Tag } from 'primereact/tag'
import { useTranslations } from 'next-intl'

export const statusMap = {
  "": { label: "all", count: 0 },
  "0": { label: "created", count: 0 },
  "1": { label: "pending", count: 0 },
  "2": { label: "confirmed", count: 0 },
  "3": { label: "shipping", count: 0 },
  "4": { label: "shippingConfirmed", count: 0 },
  "5": { label: "delivering", count: 0 },
  "6": { label: "delivered", count: 0 },
  "7": { label: "paid", count: 0 },
  "8": { label: "completed", count: 0 },
  "9": { label: "cancelled", count: 0 }
} as const;

export interface OrderStatusTagProps {
  status: string;
}

const OrderStatusTag = ({ status }: OrderStatusTagProps) => {
  const t = useTranslations('admin.orders')

  const getStatusSeverity = (status: string) => {
    switch (status) {
      case "0": return "warning"; 
      case "1": return "info"; 
      case "2": return "info"; 
      case "3": return "warning"; 
      case "4": return "info"; 
      case "5": return "warning"; 
      case "6": return "success"; 
      case "7": return "success"; 
      case "8": return "success"; 
      case "9": return "danger"; 
      default: return "info";
    }
  };

  return (
    <Tag 
      severity={getStatusSeverity(status)} 
      value={t(`status.${statusMap[status as keyof typeof statusMap]?.label}`)}
      className="px-3 py-1.5 text-sm font-medium rounded-full"
    />
  )
}

export default OrderStatusTag 