import React from 'react';
import { Steps } from 'antd';
import type { StepProps } from 'antd';
import { 
    FileTextOutlined, 
    CheckCircleOutlined,
    CarOutlined,
    StarOutlined,
    ShoppingCartOutlined,
} from '@ant-design/icons';
import { useTranslations } from 'next-intl';

interface OrderStatusProps {
    current: number;
    statusTimestamps: { [key: string]: string };
    validSteps: number[];
}

const OrderStatus: React.FC<OrderStatusProps> = ({ current, statusTimestamps, validSteps }) => {
    const t = useTranslations('purchaseDetail');

    const steps = [
        {
            title: t('steps.created'),   // status 0
            icon: <FileTextOutlined />,
            description: t('steps.createdDesc')
        },
        {
            title: t('steps.pending'),   // status 1
            icon: <CheckCircleOutlined />,
            description: t('steps.pendingDesc')
        },
        {
            title: t('steps.confirmed'),  // status 2
            icon: <CheckCircleOutlined />,
            description: t('steps.confirmedDesc')
        },
        {
            title: t('steps.ship_pending'),  // status 3
            icon: <ShoppingCartOutlined />,
            description: t('steps.ship_pendingDesc')
        },
        {
            title: t('steps.ship_confirmed'),  // status 4
            icon: <CheckCircleOutlined />,
            description: t('steps.ship_confirmedDesc')
        },
        {
            title: t('steps.delivering'), // status 5
            icon: <CarOutlined />,
            description: t('steps.deliveringDesc')
        },
        {
            title: t('steps.delivered'), // status 6
            icon: <CarOutlined />,
            description: t('steps.deliveredDesc')
        },
        {
            title: t('steps.paid'), // status 7
            icon: <StarOutlined />,
            description: t('steps.paidDesc')
        },
        {
            title: t('steps.completed'), // status 8
            icon: <CheckCircleOutlined />,
            description: t('steps.completedDesc')
        }
    ];

    // Map status numbers to step indices
    const statusToStepIndex: { [key: string]: number } = {
        '0': 0,  // created
        '1': 1,  // pending
        '2': 2,  // confirmed
        '3': 3,  // shipping_pending
        '4': 4,  // shipping_confirmed
        '5': 5,  // delivering
        '6': 6,  // delivered
        '7': 7,  // paid
        '8': 8,  // completed
    };

    const formatTimestamp = (timestamp: string) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        
        // Format date
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        return `${day}/${month}/${year} ${hours}:${minutes}`;
    };

    return (
        <div style={{ overflowX: 'auto', padding: '20px 0' }}>
            <div style={{ minWidth: 'max-content' }}>
                <Steps
                    current={current}
                    items={steps.map((step, index) => {
                        const statusNumber = Object.entries(statusToStepIndex).find(([_, stepIndex]) => stepIndex === index)?.[0];
                        
                        let timeDescription = '';
                        if (statusNumber && statusTimestamps[statusNumber]) {
                            timeDescription = formatTimestamp(statusTimestamps[statusNumber]);
                        }

                        const isCurrentStep = index === current;
                        const isPreviousStep = index < current;

                        let stepStatus: StepProps['status'] = 'wait';
                        if (isCurrentStep) {
                            stepStatus = 'process';
                        } else if (isPreviousStep) {
                            stepStatus = 'finish';
                        }

                        // Add custom class names for specific steps
                        let customClassName = '';
                        if (index === 4) { // shipping confirmed step
                            customClassName = 'shipping-confirmed-step';
                        } else if (index === 5) { // delivering step
                            customClassName = 'delivering-step';
                        } else if (index === 3) { // shipping pending step
                            customClassName = 'shipping-pending-step';
                        }

                        return {
                            ...step,
                            status: stepStatus,
                            style: { margin: '0 32px' },
                            className: customClassName,
                            description: (
                                <div className='w-[200px]'>
                                    <div className="mb-1 text-[13.5px]">{step.description}</div>
                                    <div className="whitespace-pre-line text-[12px]">{timeDescription}</div>
                                </div>
                            )
                        };
                    })}
                    className="custom-steps"
                />
                <style jsx global>{`
                    .custom-steps .shipping-confirmed-step,
                    .custom-steps .delivering-step,
                    .custom-steps .shipping-pending-step {
                        width: 350px !important;
                    }
                    
                    .custom-steps .shipping-confirmed-step .ant-steps-item-description,
                    .custom-steps .delivering-step .ant-steps-item-description,
                    .custom-steps .shipping-pending-step .ant-steps-item-description {
                        width: 280px !important;
                        max-width: 280px !important;
                    }

                    .custom-steps .ant-steps-item-description {
                        white-space: normal !important;
                    }
                `}</style>
            </div>
        </div>
    );
};

export default OrderStatus; 