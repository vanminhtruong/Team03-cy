import { GET } from '@/src/config/ApiService';

export const getStockByIdProduct = async (idProduct: number) => {  // Specify that idProduct is a number
    return await GET(`/v1/api/stock/${idProduct}`, {});
};
