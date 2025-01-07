export enum OrderStatusType {
    CREATED = 0,
    PENDING = 1,
    CONFIRMED = 2,
    SHIPPING_PENDING = 3,
    SHIPPING_CONFIRMED = 4,
    DELIVERING = 5,
    DELIVERED = 6,
    PAID = 7,
    COMPLETED = 8,
    CANCELLED = 9
}

export interface OrderStatus {
    status: OrderStatusType;
    label: string;
    date: string;
    isCompleted: boolean;
}

export interface CustomerInfo {
    name: string;
    phone: string;
    address: string;
}

export interface OrderItem {
    id: number;
    name: string;
    quantity: number;
    price: number;
    imageUrl?: string;
    orderId: number;
    productId: number;
    product: {
        id: number;
        name: string;
        image: string;
        price: number;
    };
}

export interface OrderDetailData {
    order: {
        id: number;
        totalPrice: number;
        phoneReception: string | null;
        shippingAddress: string;
        statusCheckout: number;
        methodCheckout: string;
        createdAt: string;
        orderCode: string;
        customerName?: string;
        user: {
            userId: number;
            name: string;
            username: string;
            email: string;
            phone: string;
            addresses: Array<{
                id?: number;
                addressLine1: string;
                addressLine2: string;
            }>;
            gender?: number;
            roleId?: number;
            id_front?: string | null;
            id_back?: string | null;
            tax_code?: string | null;
            shop_name?: string;
            isActive?: number;
            activationNote?: string | null;
            address_id_shop?: number;
            shop_status?: number;
            shop_address_detail?: string | null;
            time_created_shop?: string | null;
            allAddresses?: any;
            profilePicture?: string | null;
        };
    };
    orderDetails: Array<{
        id: number;
        shopId?: number;
        orderId?: number;
        quantity: number;
        price: number;
        option1: number;
        option2: number;
        productName: string;
        user?: any;
        createdAt?: string;
        shippingStatus?: number;
        skuDto: {
            productId?: number;
            variantId?: number;
            option1: {
                optionId?: number;
                name: string;
                value: {
                    valueId?: number;
                    name: string;
                };
            };
            option2: {
                optionId?: number;
                name: string;
                value: {
                    valueId?: number;
                    name: string;
                };
            };
            oldPrice?: number;
            newPrice?: number;
            quantity?: number;
            image: string;
        };
        hasFeedback?: boolean | null;
    }>;
    orderTracking: {
        id?: number;
        status: number;
        createdAt: string;
        note: string | null;
        shopId?: number;
        paidDate: string | null;
        historyStatusShippingDtoList?: Array<{
            id: number;
            status: number;
            createdChangeStatus: string;
        }>;
    };
} 