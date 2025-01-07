import { GET, POST, PUT } from '@/service/ApiService';

export const OrderApprovalService = {
    getAllProductNotConfirmed: (type, pageIndex = 0, pageSize = 5) => {
        return GET(`/v1/api/product/status/${type}?pageSize=${pageSize}&pageIndex=${pageIndex}`);
    },

    activateProduct: (id, type, note) => {
        return PUT(`/v1/api/product/activate/${id}?type=${type}&note=${encodeURIComponent(note)}`);
    }
};

export default OrderApprovalService;
