'use client'
import React, { useRef, useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { checkoutService } from '../service/checkoutService';

interface AddressFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void>;
  userId?: number;
  t: (key: string) => string;
  newAddress: {
    addressLine1: string;
    addressLine2: string;
    name: string;
    phone: string;
  };
  setNewAddress: React.Dispatch<React.SetStateAction<{
    addressLine1: string;
    addressLine2: string;
    name: string;
    phone: string;
  }>>;
  showAddressSelect: boolean;
  setShowAddressSelect: (show: boolean) => void;
  addressSelectRef: React.RefObject<HTMLDivElement>;
  provinces: any[];
  districts: any[];
  wards: any[];
  selectedProvince: any;
  selectedDistrict: any;
  selectedWard: any;
  setSelectedProvince: (province: any) => void;
  setSelectedDistrict: (district: any) => void;
  setSelectedWard: (ward: any) => void;
  fetchProvinces: () => Promise<void>;
  fetchDistricts: (provinceId: number) => Promise<void>;
  fetchWards: (districtId: number) => Promise<void>;
  editMode?: boolean;
  addressToEdit?: any;
}

const AddressForm: React.FC<AddressFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
  userId,
  t,
  newAddress,
  setNewAddress,
  showAddressSelect,
  setShowAddressSelect,
  addressSelectRef,
  provinces,
  districts,
  wards,
  selectedProvince,
  selectedDistrict,
  selectedWard,
  setSelectedProvince,
  setSelectedDistrict,
  setSelectedWard,
  fetchProvinces,
  fetchDistricts,
  fetchWards,
  editMode = false,
  addressToEdit,
}) => {
  const toast = useRef<Toast>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'province' | 'district' | 'ward'>('province');

  useEffect(() => {
    if (isOpen) {
      if (editMode && addressToEdit) {
        setNewAddress({
          addressLine1: addressToEdit.addressLine1 || '',
          addressLine2: addressToEdit.addressLine2 || '',
          name: addressToEdit.name || '',
          phone: addressToEdit.phone || ''
        });
      } else {
        setNewAddress({ 
          addressLine1: '', 
          addressLine2: '',
          name: '',
          phone: ''
        });
        setSelectedProvince(null);
        setSelectedDistrict(null);
        setSelectedWard(null);
      }
    }
  }, [editMode, addressToEdit, isOpen]);

  const validateForm = () => {
    if (editMode && addressToEdit) {
      if (!selectedWard && !addressToEdit.addressLine1) {
        toast.current?.show({
          severity: 'error',
          summary: t('error'),
          detail: t('pleaseSelectAddress'),
          life: 3000
        });
        return false;
      }

      if (!newAddress.addressLine2.trim() && !addressToEdit.addressLine2) {
        toast.current?.show({
          severity: 'error',
          summary: t('error'),
          detail: t('pleaseEnterAddressDetail'),
          life: 3000
        });
        return false;
      }

      if (!newAddress.name.trim() && !addressToEdit.name) {
        toast.current?.show({
          severity: 'error',
          summary: t('error'),
          detail: t('pleaseEnterName'),
          life: 3000
        });
        return false;
      }

      if (!newAddress.phone.trim() && !addressToEdit.phone) {
        toast.current?.show({
          severity: 'error',
          summary: t('error'),
          detail: t('pleaseEnterPhone'),
          life: 3000
        });
        return false;
      }

      return true;
    }

    if (!selectedWard) {
      toast.current?.show({
        severity: 'error',
        summary: t('error'),
        detail: t('pleaseSelectAddress'),
        life: 3000
      });
      return false;
    }

    if (!newAddress.addressLine2.trim()) {
      toast.current?.show({
        severity: 'error',
        summary: t('error'),
        detail: t('pleaseEnterAddressDetail'),
        life: 3000
      });
      return false;
    }

    if (!newAddress.name.trim()) {
      toast.current?.show({
        severity: 'error',
        summary: t('error'),
        detail: t('pleaseEnterName'),
        life: 3000
      });
      return false;
    }

    if (!newAddress.phone.trim()) {
      toast.current?.show({
        severity: 'error',
        summary: t('error'),
        detail: t('pleaseEnterPhone'),
        life: 3000
      });
      return false;
    }

    return true;
  };

  const handleClose = () => {
    setNewAddress({ 
      addressLine1: '', 
      addressLine2: '',
      name: '',
      phone: ''
    });
    setSelectedProvince(null);
    setSelectedDistrict(null);
    setSelectedWard(null);
    onClose();
  };

  const handleTabChange = (tab: 'province' | 'district' | 'ward') => {
    setActiveTab(tab);
  };

  return (
    <Dialog
      visible={isOpen}
      onHide={handleClose}
      header={editMode ? t('editAddress') : t('addNewAddress')}
      className="w-[585px] h-[700px]"
    >
      <Toast ref={toast} />
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          
          if (!validateForm()) {
            return;
          }

          try {
            setIsSubmitting(true);
            if (userId === undefined) {
              throw new Error('User ID is required');
            }

            let response;
            if (editMode && addressToEdit) {
              response = await checkoutService.updateAddress({
                userId,
                shippingAddressId: addressToEdit.id,
                addressId: selectedWard?.id || addressToEdit.id,
                addressDetail: newAddress.addressLine2,
                name: newAddress.name,
                phone: newAddress.phone
              });
            } else {
              response = await checkoutService.addAddress(userId, {
                addressId: selectedWard?.id,
                addressDetail: newAddress.addressLine2,
                name: newAddress.name,
                phone: newAddress.phone
              });
            }

            if (response.status === 200) {
              toast.current?.show({ 
                severity: 'success', 
                summary: editMode ? t('addressUpdated') : t('addressAdded'), 
                life: 3000 
              });
              await onSuccess();
              setTimeout(() => {
                onClose();
                setNewAddress({ 
                  addressLine1: '', 
                  addressLine2: '',
                  name: '',
                  phone: ''
                });
              }, 1000);
            }
          } catch (error) {
            console.error('Error with address:', error);
            toast.current?.show({ 
              severity: 'error', 
              summary: editMode ? t('addressUpdateError') : t('addressError'), 
              life: 3000 
            });
          } finally {
            setIsSubmitting(false);
          }
        }}
        className="space-y-4"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('name')}
            </label>
            <span className="p-input-icon-left w-full">
              <i className="pi pi-user" />
              <InputText
                value={newAddress.name}
                onChange={(e) =>
                  setNewAddress((prev) => ({ ...prev, name: e.target.value }))
                }
                className="w-full"
                placeholder={t('enterName')}
              />
            </span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('phone')}
            </label>
            <span className="p-input-icon-left w-full">
              <i className="pi pi-phone" />
              <InputText
                value={newAddress.phone}
                onChange={(e) =>
                  setNewAddress((prev) => ({ ...prev, phone: e.target.value }))
                }
                className="w-full"
                placeholder={t('enterPhone')}
              />
            </span>
          </div>
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('addressLine1')}
          </label>
          <div className="relative">
            <span className="p-input-icon-left w-full">
              <i className="pi pi-map-marker" />
              <InputText
                value={newAddress.addressLine1}
                onChange={(e) =>
                  setNewAddress((prev) => ({ ...prev, addressLine1: e.target.value }))
                }
                onFocus={() => {
                  setShowAddressSelect(true);
                  fetchProvinces();
                }}
                className="w-full"
                placeholder={t('selectAddress')}
              />
            </span>
          </div>
          {showAddressSelect && (
            <div ref={addressSelectRef} className="absolute z-10 left-0 right-0 mt-1 w-full">
              <div className="sticky top-0 bg-white z-20">
                <span className="p-input-icon-left w-full mb-4 mt-[10px]">
                  <i className="pi pi-search" />
                  <InputText
                    className="w-full"
                    placeholder={t('addressSelectModal.search')}
                  />
                </span>
                <div className="flex border-b relative">
                  <Button
                    className={`flex-1 text-[#666666] ${
                      activeTab === 'province' ? 'text-primary border-primary' : ''
                    }`}
                    onClick={() => {
                      handleTabChange('province');
                      setSelectedProvince(null);
                      setSelectedDistrict(null);
                      setSelectedWard(null);
                      fetchProvinces();
                    }}
                    label={t('addressSelectModal.province')}
                    text
                  />
                  <Button
                    className={`flex-1 text-[#666666] ${
                      activeTab === 'district' ? 'text-primary border-primary' : ''
                    }`}
                    disabled={!selectedProvince}
                    onClick={() => handleTabChange('district')}
                    label={t('addressSelectModal.district')}
                    text
                  />
                  <Button
                    className={`flex-1 text-[#666666] ${
                      activeTab === 'ward' ? 'text-primary border-primary' : ''
                    }`}
                    disabled={!selectedDistrict}
                    onClick={() => handleTabChange('ward')}
                    label={t('addressSelectModal.ward')}
                    text
                  />
                  <div
                    className={`absolute bottom-0 left-0 h-[2px] bg-btn-dart transition-all duration-300 ${
                      activeTab === 'province' ? 'w-1/3 translate-x-0' : ''
                    } ${
                      activeTab === 'district' ? 'w-1/3 translate-x-full' : ''
                    } ${
                      activeTab === 'ward' ? 'w-1/3 translate-x-[200%]' : ''
                    }`}
                  ></div>
                </div>
              </div>
              <div className="p-2">
                {!selectedProvince && (
                  <div className="space-y-1">
                    {provinces.map((province) => (
                      <Button
                        key={province.id}
                        className="w-full text-left text-[#666666]"
                        onClick={() => {
                          setSelectedProvince(province);
                          setNewAddress((prev) => ({ ...prev, addressLine1: `${province.name}` }));
                          fetchDistricts(province.id);
                          handleTabChange('district');
                        }}
                        label={province.name}
                        text
                      />
                    ))}
                  </div>
                )}
                {selectedProvince && !selectedDistrict && (
                  <div className="space-y-1">
                    {districts.map((district) => (
                      <Button
                        key={district.id}
                        className="w-full text-left text-[#666666]"
                        onClick={() => {
                          setSelectedDistrict(district);
                          setNewAddress((prev) => ({ ...prev, addressLine1: `${selectedProvince.name}, ${district.name}` }));
                          fetchWards(district.id);
                          handleTabChange('ward');
                        }}
                        label={district.name}
                        text
                      />
                    ))}
                  </div>
                )}
                {selectedDistrict && !selectedWard && (
                  <div className="space-y-1">
                    {wards.map((ward) => (
                      <Button
                        key={ward.id}
                        className="w-full text-left text-[#666666]"
                        onClick={() => {
                          setSelectedWard(ward);
                          const fullAddress = `${selectedProvince.name}, ${selectedDistrict.name}, ${ward.name}`;
                          setNewAddress((prev) => ({ ...prev, addressLine1: fullAddress }));
                          setShowAddressSelect(false);
                        }}
                        label={ward.name}
                        text
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('addressLine2')}
          </label>
          <span className="p-input-icon-left w-full">
            <i className="pi pi-home" />
            <InputText
              value={newAddress.addressLine2}
              onChange={(e) =>
                setNewAddress((prev) => ({ ...prev, addressLine2: e.target.value }))
              }
              className="w-full"
              placeholder={t('addressLine2')}
              disabled={isSubmitting}
            />
          </span>
        </div>

        <div className="absolute bottom-0 right-0 p-4">
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              onClick={onClose}
              label={t('cancel')}
              severity="secondary"
              text
              disabled={isSubmitting}
            />
            <Button
              type="submit"
              label={isSubmitting ? t('saving') : (editMode ? 'Save' : t('addAddress'))}
              disabled={isSubmitting}
              className="bg-btn-dart text-white"
            />
          </div>
        </div>
      </form>
    </Dialog>
  );
};

export default AddressForm;
