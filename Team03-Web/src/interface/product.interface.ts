export interface ProductResponse {
    productId: number;
    productName: string;
    numberOfFeedBack: number;
    numberOfLike: number;
    rating: number;
    sold: number;
    totalQuantity: number;
    newPrice: number;
    oldPrice: number;
    discountPercentage: number;
    isActive: number;
    note: string | null;
    createdAt: string;
    modifiedAt: string;
    deletedAt: string | null;
    category: Category;
    image: string;
    variants: Variant[];
    shop: Shop;
    feedbacks: Feedback[];
}

export interface ProductRelative {
    productId: number,
    productName: string,
    numberOfFeedBack: number,
    numberOfLike: number,
    rating: number,
    sold: number,
    newPrice: number,
    oldPrice: number,
    image: string,
    createdAt: Date,
    modifiedAt: Date,
    deletedAt: null,
}

export interface ProductDetail {
    productId: number;
    productName: string;
    numberOfFeedBack: number;
    numberOfLike: number;
    rating: number;
    description: string;
    sold: number;
    isActive: number;
    note: string | null;
    createdAt: string;
    newPrice: number;
    oldPrice: number;
    discountPercentage: number;
    modifiedAt: string;
    totalQuantity: number;
    deletedAt: string | null;
    category: Category;
    images: Image[];
    variants: Variant[];
    shop: Shop;
    feedbacks: Feedback[];
    profilePicture:any;
}

export interface Variant {
    variantId: number;
    option1: VariantOption;
    option2: VariantOption;
    oldPrice: number;
    newPrice: number;
    quantity: number;
    image: string | null;
}

export interface VariantOption {
    optionId: number;
    name: string;
    value: OptionValue;
}

export interface OptionValue {
    valueId: number;
    name: string;
}

export interface Shop {
    shopId: number;
    shopName: string;
    shopAddress: string;
    shopAddressDetail: string;
    productCount: number;
    joined: number;
    feedbackCount: number;
    rating: number;
    sold: number;
    profilePicture:any;
}

export interface Feedback {
    id: number;
    user: User;
    rate: number;
    content: string;
    replyFromSeller: string;
    createdAt: Date;
    feedbackImages: FeedbackImage[];
}

export interface FeedbackImage {
    id: number;
    imageLink: string;
}

export interface User {
    userId: number;
    username: string;
    name: string;
    profilePicture: string;
}

export interface Category {
    categoryId: number;
    categoryName: string;
    parentId: number;
    image: string;
    createdAt: string;
    modifiedAt: string;
    deletedAt: string | null;
}

export interface Image {
    id: number;
    imageLink: string;
}
