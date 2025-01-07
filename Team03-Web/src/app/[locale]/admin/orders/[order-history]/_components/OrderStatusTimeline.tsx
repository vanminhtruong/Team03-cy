'use client';
import React, { useState } from 'react';
import { Steps, type StepProps, Alert } from 'antd';
import { 
    CheckCircleOutlined, 
    FileTextOutlined,
    CarOutlined,
    DollarCircleOutlined,
    ShoppingCartOutlined
} from '@ant-design/icons';
import { OrderStatusType, OrderDetailData } from '../interface/types';
import { transferableAbortSignal } from 'util';

interface OrderStatusTimelineProps {
    currentStatus: OrderStatusType;
    orderData: OrderDetailData;
    handleStepChange: (step: number) => void;
    formatDate: (date: string) => string;
    t: any; 
}

export const OrderStatusTimeline: React.FC<OrderStatusTimelineProps> = ({
    currentStatus,
    orderData,
    handleStepChange,
    formatDate,
    t
}) => {
    const statusHistory = orderData.orderTracking.historyStatusShippingDtoList || [];
    const getTimestampForStatus = (status: OrderStatusType) => {
        const latestStatus = statusHistory
            .filter(history => Number(history.status) === 0 || Number(history.status) === 1)
            .sort((a, b) => new Date(b.createdChangeStatus).getTime() - new Date(a.createdChangeStatus).getTime())[0];
        return latestStatus?.createdChangeStatus || '';
    };

    const getCancellationReason = () => {
        return orderData.orderTracking.note || t('status.defaultCancelReason');
    };

    if (currentStatus === OrderStatusType.CANCELLED) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <Alert
                    message={<div className="text-lg font-semibold text-red-500">{t('status.cancelled')}</div>}
                    description={
                        <div className="mt-2">
                            <p className="text-gray-600">{t('status.cancellationReason')}: {orderData.orderTracking.note || t('status.defaultCancelReason')}</p>
                            <p className="text-gray-500 text-sm mt-1">
                                {t('status.cancelledAt')}: {formatDate(getTimestampForStatus(OrderStatusType.CANCELLED))}
                            </p>
                        </div>
                    }
                    type="error"
                />
            </div>
        );
    }

    const handleInternalStepChange = (step: number) => {
        if (step > OrderStatusType.DELIVERED) {
            return;
        }

        if (Math.abs(step - currentStatus) > 1) {
            return;
        }

        if (step < currentStatus) {
            return;
        }

        handleStepChange(step);
    };

    const getStepIcon = (status: OrderStatusType, index: number) => {
        if (currentStatus > index) {
            return <CheckCircleOutlined />;
        }

        if (currentStatus === index) {
            switch (status) {
                case OrderStatusType.PENDING:
                case OrderStatusType.SHIPPING_PENDING:
                    return <CheckCircleOutlined />;
                default:
                    return <CheckCircleOutlined />;
            }
        }

        switch (status) {
            case OrderStatusType.CREATED:
                return <FileTextOutlined />;
            case OrderStatusType.PENDING:
                return <CheckCircleOutlined />;
            case OrderStatusType.CONFIRMED:
                return <CheckCircleOutlined />;
            case OrderStatusType.SHIPPING_PENDING:
                return <ShoppingCartOutlined />;
            case OrderStatusType.SHIPPING_CONFIRMED:
                return <CheckCircleOutlined />;
            case OrderStatusType.DELIVERING:
                return <CarOutlined />;
            case OrderStatusType.DELIVERED:
                return <CheckCircleOutlined />;
            case OrderStatusType.PAID:
                return <DollarCircleOutlined />;
            case OrderStatusType.COMPLETED:
                return <CheckCircleOutlined />;
            default:
                return <CheckCircleOutlined />;
        }
    };

    const getSteps = (): StepProps[] => {
        const steps: StepProps[] = [
            {
                title: t('status.created'),
                description: formatDate(getTimestampForStatus(OrderStatusType.CREATED)),
                icon: getStepIcon(OrderStatusType.CREATED, 0),
                disabled: true
            },
            {
                title: t('status.pending'),
                description: currentStatus >= OrderStatusType.PENDING ? formatDate(getTimestampForStatus(OrderStatusType.PENDING)) : '',
                icon: getStepIcon(OrderStatusType.PENDING, 1),
                disabled: Math.abs(1 - currentStatus) > 1
            },
            {
                title: t('status.confirmed'),
                description: currentStatus >= OrderStatusType.CONFIRMED ? formatDate(getTimestampForStatus(OrderStatusType.CONFIRMED)) : '',
                icon: getStepIcon(OrderStatusType.CONFIRMED, 2),
                disabled: Math.abs(2 - currentStatus) > 1
            },
            {
                title: t('status.shippingPending'),
                description: currentStatus >= OrderStatusType.SHIPPING_PENDING ? formatDate(getTimestampForStatus(OrderStatusType.SHIPPING_PENDING)) : '',
                icon: getStepIcon(OrderStatusType.SHIPPING_PENDING, 3),
                disabled: Math.abs(3 - currentStatus) > 1
            },
            {
                title: t('status.shippingConfirmed'),
                description: currentStatus >= OrderStatusType.SHIPPING_CONFIRMED ? formatDate(getTimestampForStatus(OrderStatusType.SHIPPING_CONFIRMED)) : '',
                icon: getStepIcon(OrderStatusType.SHIPPING_CONFIRMED, 4),
                disabled: Math.abs(4 - currentStatus) > 1
            },
            {
                title: t('status.delivering'),
                description: currentStatus >= OrderStatusType.DELIVERING ? formatDate(getTimestampForStatus(OrderStatusType.DELIVERING)) : '',
                icon: getStepIcon(OrderStatusType.DELIVERING, 5),
                disabled: Math.abs(5 - currentStatus) > 1
            },
            {
                title: t('status.delivered'),
                description: currentStatus >= OrderStatusType.DELIVERED ? formatDate(getTimestampForStatus(OrderStatusType.DELIVERED)) : '',
                icon: getStepIcon(OrderStatusType.DELIVERED, 6),
                disabled: Math.abs(6 - currentStatus) > 1
            },
            {
                title: t('status.paid'),
                description: currentStatus >= OrderStatusType.PAID ? formatDate(getTimestampForStatus(OrderStatusType.PAID)) : '',
                icon: getStepIcon(OrderStatusType.PAID, 7),
                disabled: true
            },
            {
                title: t('status.completed'),
                description: currentStatus >= OrderStatusType.COMPLETED ? formatDate(getTimestampForStatus(OrderStatusType.COMPLETED)) : '',
                icon: getStepIcon(OrderStatusType.COMPLETED, 8),
                disabled: true
            }
        ];

        return steps;
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 overflow-x-auto w-full max-md:p-4">
            <div className="min-w-max max-xl:overflow-x-scroll max-md:w-[800px]">
                <Steps
                    current={currentStatus}
                    items={getSteps()}
                    onChange={handleInternalStepChange}
                    status={'process' as const}
                    className="custom-steps"
                    style={{
                        '--step-width': '200px',
                        '--icon-size': '24px',
                        '--title-font-size': '14px',
                        '--description-font-size': '12px',
                        '--connector-width': '2px',
                    } as React.CSSProperties}
                />
            </div>
            <style jsx global>{`
                .custom-steps .ant-steps-item {
                    min-width: var(--step-width);
                    padding: 0 16px;
                }
                
                .custom-steps .ant-steps-item-icon {
                    width: var(--icon-size);
                    height: var(--icon-size);
                    line-height: var(--icon-size);
                    font-size: calc(var(--icon-size) * 0.7);
                }

                .custom-steps .ant-steps-item-title {
                    font-size: var(--title-font-size);
                    font-weight: 600;
                    padding-right: 12px;
                }

                .custom-steps .ant-steps-item-description {
                    font-size: var(--description-font-size);
                    max-width: calc(var(--step-width) - 32px);
                }

                .custom-steps .ant-steps-item-tail {
                    padding: 0 12px;
                }

                .custom-steps .ant-steps-item-tail::after {
                    height: var(--connector-width);
                }

                .custom-steps .ant-steps-item-content {
                    min-height: 70px;
                }

                @media (max-width: 768px) {
                    .custom-steps .ant-steps-item {
                        min-width: 150px;
                    }
                }
            `}</style>
        </div>
    );
}; 