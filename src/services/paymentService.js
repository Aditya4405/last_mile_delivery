import axiosInstance, { isLive } from './axios';
import toast from 'react-hot-toast';

export const paymentService = {
  createPaymentOrder: async (orderIdOrDetails) => {
    if (isLive()) {
      try {
        const payload = typeof orderIdOrDetails === 'object' && orderIdOrDetails !== null
          ? { orderDetails: orderIdOrDetails }
          : { orderId: orderIdOrDetails };
          
        const response = await axiosInstance.post('/api/payments/create-order', payload);
        return response.data.data;
      } catch (err) {
        console.error('Backend payment order creation failed:', err);
        const errMsg = err.response?.data?.message || 'Failed to create payment order.';
        toast.error(errMsg);
        throw new Error(errMsg);
      }
    }

    // Fallback Mock payment response payload
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      razorpayOrderId: `rzp_mock_${Date.now()}`,
      amount: 2500,
      currency: 'INR',
      razorpayKey: 'rzp_test_T98uakJBS29XZ1'
    };
  },

  verifyPaymentSignature: async (verifyData) => {
    if (isLive()) {
      try {
        const response = await axiosInstance.post('/api/payments/verify', verifyData);
        return response.data.data;
      } catch (err) {
        console.error('Backend payment verification failed:', err);
        const errMsg = err.response?.data?.message || 'Payment verification failed.';
        toast.error(errMsg);
        throw new Error(errMsg);
      }
    }

    // Fallback Mock signature verification success
    await new Promise((resolve) => setTimeout(resolve, 400));
    return {
      status: 'CAPTURED',
      transactionId: `tx_mock_${Math.floor(100000 + Math.random() * 900000)}`
    };
  }
};
