export interface SignupStoreState {
    shopName: string;
    setShopName: (name: string) => void;

    address: number;
    setAddress: (address: number) => void;

    addressDetail: string;
    setAddressDetail: (addressDetail: string) => void;

    phone: string;
    setPhone: (phone: string) => void;

    userId: string | null;
    setUserId: (userId: string) => void;

    idFront: string;
    setIdFront: (idFront: string) => void;

    idBack: string;
    setIdBack: (idBack: string) => void;

    taxCode: string;
    setTaxCode: (taxCode: string) => void;
}
