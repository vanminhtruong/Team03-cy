import { GET, POST, PUT } from '@/src/config/ApiService';
import { updateCart } from '../../../cart/service/serviceCart';

interface PaymentRequestItem {
    productSkuId: number;
    quantity: number;
    shopId: number;
    price: number;
    option1: number;
    option2: number;
    nameProduct: string;
}

interface PaymentRequest {
    userId: number;
    addressShipping: string;
    methodCheckout: string;
    amount: string;
    customerName: string;
    cartItems: PaymentRequestItem[];
    phoneReception:any;
}

export const checkoutService = {
    getCheckoutData: async (userId: string, cartItemId: string) => {
        const response = await GET(`/v1/api/cart/checkout/${userId}?cartItemId=${cartItemId}`);
        return response.data;
    },

    createPayment: async (userId: number, addressShipping: string, methodCheckout: string, amount: number, cartItems: any[], customerName: string, phoneReception: any) => {
        const paymentRequest: PaymentRequest = {
            userId,
            addressShipping,
            methodCheckout: methodCheckout,
            amount: amount.toString(),
            customerName,
            phoneReception,
            cartItems: cartItems.map((item) => ({
                productSkuId: item.item.itemId,
                cartDetailId: item.cartDetailId,
                quantity: item.itemQuantity,
                shopId: item.item.productFamily.shopId,
                price: item.item.price,
                option1: item.item.value1?.valueId || null,
                option2: item.item.value2?.valueId || null,
                nameProduct: item.item.productFamily.productName
            }))
        };

        const response = await POST('/v1/api/payment/create-payment', paymentRequest);
        return response.data;
    },

    addAddress: async (
        userId: number,
        addressData: {
            addressId: number;
            addressDetail: string;
            name: string;
            phone: string;
        }
    ) => {
        const response = await POST(`/v1/api/user/${userId}/add-address`, addressData);
        return response;
    },

    updateAddress: async (params: { userId: number; shippingAddressId: number; addressId: number; addressDetail: string; name: string; phone: string }) => {
        const response = await PUT(`/v1/api/user/${params.userId}/update-address`, {
            shippingAddressId: params.shippingAddressId,
            addressId: params.addressId,
            addressDetail: params.addressDetail,
            name: params.name,
            phone: params.phone
        });
        return response;
    },

    getProvinces: async () => {
        const response = await GET('/v1/api/address/0/children');
        return response.data;
    },

    getDistricts: async (provinceId: number) => {
        const response = await GET(`/v1/api/address/${provinceId}/children`);
        return response.data;
    },

    getWards: async (districtId: number) => {
        const response = await GET(`/v1/api/address/${districtId}/children`);
        return response.data;
    },

    checkQuantity: async (skuId: number, currentQuantity: number) => {
        const response = await GET(`/v1/api/cart/check-quantity?skuId=${skuId}&currentQuatity=${currentQuantity}`);
        return response.data;
    }
};
