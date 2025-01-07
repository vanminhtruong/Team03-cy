export interface Category {
    categoryId: number;
    categoryName: string;
    parentId: number;
    image: string;
    createdAt: string;
    modifiedAt: string;
    deletedAt: string | null;
}
