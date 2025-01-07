import { DELETE_PROMOTION } from '@/src/config/ApiService';

export const cancelProductPromotion = async (promotionId: string | number, productList: number[]) => {
    const url = `/v1/api/promotion/cancel?promotionId=${promotionId}`;
    return await DELETE_PROMOTION(url, productList);
};
