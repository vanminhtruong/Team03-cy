import { ClipboardDocumentIcon } from '@heroicons/react/24/solid';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useSignupStore = create(
    persist(
        (set) => ({
            fullName: '',
            setFullName: (fullName: string) => set(() => ({ fullName: fullName })),
            phoneAddress: '',
            setPhoneAddress: (phoneAddress: string) => set(() => ({ phoneAddress: phoneAddress })),
            shopName: '',
            setShopName: (name: string) => set(() => ({ shopName: name })),
            address: 0,
            setAddress: (address: number) => set(() => ({ address })),
            addressDetail: '',
            setAddressDetail: (addressDetail: string) => set(() => ({ addressDetail })),
            phone: '',
            setPhone: (phone: string) => set(() => ({ phone })),
            userId: null,
            setUserId: (userId: string) => set(() => ({ userId })),
            idFront: null as File | null,
            setFile: (fieldName: string, file: File | null) => set(() => ({ [fieldName]: file })),
            setIdFront: (file: File | null) => set(() => ({ idFront: file })),
            idBack: null as File | null,
            setIdBack: (file: File | null) => set(() => ({ idBack: file })),
            codeQR: null as File | null,
            setCodeQR: (file: File | null) => set(() => ({ codeQR: file })),
            taxCode: '',
            setTaxCode: (taxCode: string) => set(() => ({ taxCode })),
            cardID: '',
            setCardID: (cardID: string) => set(() => ({ cardID })),
            selectedAddress: null,
            setSelectedAddress: (selectedAddress: string) => set(() => ({ selectedAddress })),
            selectedCity: null,
            setSelectedCity: (selectedCity: any) => set(() => ({ selectedCity })),
            selectedDistrict: null,
            setSelectedDistrict: (selectedDistrict: any) => set(() => ({ selectedDistrict })),
            selectedWard: null,
            setSelectedWard: (selectedWard: any) => set(() => ({ selectedWard })),
            setShopInfo: (fullName: string, phoneAddress: string, shopName: string, address: number, addressDetail: string, phone: string, selectedAddress: string) =>
                set(() => ({
                    fullName,
                    phoneAddress,
                    shopName,
                    address,
                    addressDetail,
                    phone,
                    selectedAddress
                })),
            setUserInfo: (taxCode: string, idFront: File | null, idBack: File | null) =>
                set(() => ({
                    taxCode,
                    idFront,
                    idBack
                })),
            setSignupStore: (
                fullName: string,
                phoneAddress: string,
                shopName: string,
                address: number,
                addressDetail: string,
                phone: string,
                userId: string,
                taxCode: string,
                idFront: File | null,
                idBack: File | null,
                selectedAddress: string,
                cardID: string
            ) =>
                set(() => ({
                    fullName,
                    phoneAddress,
                    shopName,
                    address,
                    addressDetail,
                    phone,
                    userId,
                    taxCode,
                    idFront,
                    idBack,
                    selectedAddress,
                    cardID
                }))
        }),
        {
            name: 'signup',
            partialize: (state: any) => ({
                fullName: state.fullName,
                phoneAddress: state.phoneAddress,
                shopName: state.shopName,
                address: state.address,
                addressDetail: state.addressDetail,
                phone: state.phone,
                userId: state.userId,
                taxCode: state.taxCode,
                selectedAddress: state.selectedAddress,
                selectedCity: state.selectedCity,
                selectedDistrict: state.selectedDistrict,
                selectedWard: state.selectedWard,
                idFront: state.idFront,
                idBack: state.idBack,
                codeQR: state.codeQR,
                cardID: state.cardID
            })
        }
    )
);

export default useSignupStore;
