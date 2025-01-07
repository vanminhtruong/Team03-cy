export interface StatisticData {
    period: string;
    statistics: {
        revenue: number;
        totalOfOrders: number;
        soldProducts: number;
        totalOfProducts: number;
        totalOfCustomers: number;
        totalOfFeedbacks: number;
        averageRating: number;
        lockedProducts: number;
    };
    topPurchasedProducts: Product[];
    topPurchasedUsers: User[];
}

export interface Product {
    productName: string;
    sold: number;
    price: number;
    rating: number;
    image: string;
}

export interface User {
    username: string;
    name: string;
    profilePicture?: string;
}
