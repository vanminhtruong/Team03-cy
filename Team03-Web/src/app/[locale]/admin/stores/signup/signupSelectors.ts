import useSignupStore from "./useSignupStore";

export const useSignupSelectors = () => {
    return useSignupStore((state:any) => ({
        userId: state.userId,
        shopName: state.shopName,
        address: state.address,
        addressDetail: state.addressDetail,
        phone: state.phone,
        taxCode: state.taxCode,
        idFront: state.idFront,
        idBack: state.idBack,
        setUserId: state.setUserId,
        setShopName: state.setShopName,
        setAddress: state.setAddress,
        setAddressDetail: state.setAddressDetail,
        setPhone: state.setPhone,
        setTaxCode: state.setTaxCode,
        setIdFront: state.setIdFront,
        setIdBack: state.setIdBack
    }));
};
