import { GET } from '@/src/config/ApiService';

const fetchOrders = async (statusShip: string) => {
  try {
    const userDataString = localStorage.getItem('user');
    const userData = userDataString ? JSON.parse(userDataString) : null;
    const shopId = userData?.state?.id;
    const response = await GET(`/v1/api/shop/${shopId}/order?${statusShip ? `statusShip=${statusShip}` : ''}`);
    return Array.isArray(response.data.data) ? response.data.data : [];
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
};

export default fetchOrders;