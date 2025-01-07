import { GET, DELETE } from '@/src/config/ApiService';

export interface Product {
  productId: number;
  productName: string;
  description: string;
  isActive: number;
  category: {
    categoryId: number;
  };
  images: Array<{
    imageLink: string;
  }>;
}

export const fetchProducts = async (idShop:any): Promise<Product[]> => {
  try {
    const response = await GET(`/v1/api/product/shop/${idShop}?type=0`);
    console.log('API response:', response);

    if (response?.data?.data?.content && Array.isArray(response.data.data.content)) {
      return response.data.data.content;
    } else {
      console.error('Unexpected data format:', response);
      throw new Error('Dữ liệu không ở định dạng mong đợi');
    }
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const deleteProduct = async (productId: number): Promise<void> => {
  const response = await DELETE(`/v1/api/product/${productId}`);

  if (response.status !== 200) {
    throw new Error(`Failed to delete product: ${response.statusText}`);
  }
};
