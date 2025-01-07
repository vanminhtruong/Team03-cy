import { GET, DELETE, POST, PUT } from '@/src/config/ApiService';
interface AddressData {
    fullAddress: string[];
}
export const fetchAddresses = async (userId: number) => {
    const response = await GET(`/v1/api/user/${userId}/shipping-address`);
    const data = await response.data;
    if (data.status === 200) {
        return data.data;
    } else {
        throw new Error(data.message);
    }
};

export const deleteAddress = async (userId: number, shippingAddressId: number) => {
    const response = await DELETE(`/v1/api/user/${userId}/delete-address?shippingAddressId=${shippingAddressId}`);
    const data = await response.data;
    if (data.status === 200) {
        return data.message;
    } else {
        throw new Error(data.message);
    }
};
export const addAddress = async (userId: number, newAddress: AddressData) => {
    const response = await POST(`/v1/api/user/${userId}/add-address`, newAddress);
    const data = await response.data;
    if (data.status === 200) {
        return data.data;
    } else {
        throw new Error(data.message);
    }
};

export const updateAddress = async (userId: number, addressId: number, updatedAddress: AddressData) => {
    const response = await PUT(`/v1/api/user/${userId}/update-address/${addressId}`, updatedAddress);
    const data = await response.data;
    if (data.status === 200) {
        return data.data;
    } else {
        throw new Error(data.message);
    }
};
