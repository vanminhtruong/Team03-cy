import React from 'react';

interface PaymentMethodSelectorProps {
  selectedPaymentMethod: string;
  setSelectedPaymentMethod: (method: string) => void;
  t: (key: string) => string;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({ selectedPaymentMethod, setSelectedPaymentMethod, t }) => {
  return (
    <div className="bg-white rounded p-4 mb-3">
      <div className="flex items-center text-[#333333] text-xl">
        <i className="pi pi-credit-card mr-2" />
        <span className="font-bold">{t('paymentMethod')}</span>
      </div>
      <div className="mt-4 flex flex-col space-y-2">
        <label className="flex items-center">
          <input
            type="radio"
            name="paymentMethod"
            value="cod"
            checked={selectedPaymentMethod === 'COD'}
            onChange={() => setSelectedPaymentMethod('COD')}
            className="mr-2"
          />
          <span className="text-lg">{t('cashOnDelivery')}</span>
        </label>
        <label className="flex items-center">
          <input
            type="radio"
            name="paymentMethod"
            value="vnPay"
            checked={selectedPaymentMethod === 'VNPAY'}
            onChange={() => setSelectedPaymentMethod('VNPAY')}
            className="mr-2"
          />
          <span className="text-lg">{t('vnPay')}</span>
        </label>
      </div>
    </div>
  );
};

export default PaymentMethodSelector;
