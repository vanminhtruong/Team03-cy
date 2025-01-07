import { POST } from '@/src/config/ApiService';

export const addProductPromotion = async (promotionId:any, productIds:any) => {
    if (!promotionId || !Array.isArray(productIds) || productIds.length === 0) {
        throw new Error('Invalid input: promotionId must be a number and productIds must be a non-empty array.');
    }

    const queryParams = new URLSearchParams({
        promotionId: promotionId.toString()
    });

    return await POST(`/v1/api/promotion/apply-promotion?${queryParams.toString()}`, productIds);
};
