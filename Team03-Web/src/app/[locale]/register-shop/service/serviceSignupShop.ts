import { GET, POST } from '@/src/config/ApiService';

export const signupShop = async (userId: number, shopName: string, address: number, addressDetail: string, phone: string, idFront: File, idBack: File, taxCode: string, cardID: string) => {
    const formData = new FormData();
    formData.append('userId', userId.toString());
    formData.append('id_front', idFront);
    formData.append('id_back', idBack);
    formData.append('tax_code', taxCode);
    formData.append('shop_name', shopName);
    formData.append('shop_address', address.toString());
    formData.append('shop_address_detail', addressDetail);
    formData.append('phone', phone);
    formData.append('citizenIdentification', cardID);

    return await POST('/v1/api/user/register-shop', formData);
};

export const getAddress = async (parentId: number) => {
    return await GET(`/v1/api/address/${parentId}/children`);
};

export const getFullAddress = async (id: number) => {
    return await GET(`/v1/api/address/${id}/full-address`);
};

export const scanQRCode = async (imageSrc: File) => {
    const formData = new FormData();
    formData.append('file', imageSrc);
    const response = await POST('/v1/api/qr/scan', formData);
    return response.data.data.data;
};

export const getUserShopName = async () => {
    const response = await GET('/v1/api/user');
    return response.data?.data?.content;
};
