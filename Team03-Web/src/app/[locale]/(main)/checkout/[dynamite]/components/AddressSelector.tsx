import React from 'react';
import { Dialog } from 'primereact/dialog';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';

interface AddressSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  addresses: any[];
  selectedAddressIndex: number;
  handleChangeAddress: (index: number) => void;
  t: (key: string) => string;
  setIsAddAddressModalOpen: () => void;
  onEditAddress: (address: any) => void;
}

const AddressSelector: React.FC<AddressSelectorProps> = ({
  isOpen,
  onClose,
  addresses,
  selectedAddressIndex,
  handleChangeAddress,
  t,
  setIsAddAddressModalOpen,
  onEditAddress,
}) => {
  return (
    <Dialog
      visible={isOpen}
      onHide={onClose}
      className="w-full max-w-2xl"
      header={t('selectAddress')}
    >
      <div className="space-y-4">
        {addresses.map((address: any, index: number) => (
          <Card
            key={index}
            className={`cursor-pointer transition-all ${
              selectedAddressIndex === index
                ? 'border-primary'
                : 'border-gray-200 hover:border-primary'
            }`}
          >
            <div className="flex items-center">
              <div className="flex-1" onClick={() => handleChangeAddress(index)}>
                <div className="mb-2">
                  <span className="font-semibold">{address.name}</span>
                  <span className="mx-2 text-gray-400">|</span>
                  <span className="text-gray-600">{address.phone}</span>
                </div>
                <p className="text-lg text-gray-900 whitespace-pre-line">
                  {[address.addressLine1, address.addressLine2].filter(Boolean).join('\n')}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  icon="pi pi-pencil"
                  rounded
                  text
                  severity="secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditAddress(address);
                  }}
                  tooltip={t('edit')}
                />
                {selectedAddressIndex === index && (
                  <i className="pi pi-check-circle text-primary" />
                )}
              </div>
            </div>
          </Card>
        ))}
        <Button
          onClick={setIsAddAddressModalOpen}
          className="w-full p-4 bg-btn-dart text-white"
          severity="secondary"
          outlined
        >
          <i className="pi pi-plus mr-2" />
          {t('addNewAddress')}
        </Button>
      </div>
    </Dialog>
  );
};

export default AddressSelector;
