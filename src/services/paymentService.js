import axiosInstance, { isLive } from './axios';
import toast from 'react-hot-toast';

export const paymentService = {
  getPaymentDashboard: async () => {
    if (isLive()) {
      try {
        const response = await axiosInstance.get('/api/payments/dashboard');
        return response.data.data || {
          totalPaid: 0,
          pendingCod: 0,
          onlinePaymentsCount: 0,
          failedPaymentsCount: 0,
          refundsCount: 0,
          recentPayments: []
        };
      } catch (err) {
        console.error('Failed to fetch payment dashboard:', err);
        return {
          totalPaid: 0,
          pendingCod: 0,
          onlinePaymentsCount: 0,
          failedPaymentsCount: 0,
          refundsCount: 0,
          recentPayments: []
        };
      }
    }

    // Fallback Mock data
    await new Promise((resolve) => setTimeout(resolve, 300));
    return {
      totalPaid: 18450,
      pendingCod: 3200,
      onlinePaymentsCount: 42,
      failedPaymentsCount: 3,
      refundsCount: 1,
      recentPayments: [
        { id: 1, paymentId: 'PAY-892174', customerName: 'Aditya Customer', trackingNumber: 'TRK-294021', amount: 2500, paymentMethod: 'ONLINE', status: 'CAPTURED', createdAt: new Date().toISOString(), invoiceNumber: 'INV-2026-0001', transactionReference: 'TXN-98124982' },
        { id: 2, paymentId: 'PAY-892175', customerName: 'John Doe', trackingNumber: 'TRK-294022', amount: 1200, paymentMethod: 'COD', status: 'PENDING', createdAt: new Date().toISOString(), invoiceNumber: 'INV-2026-0002', transactionReference: 'TXN-98124983' }
      ]
    };
  },

  getPaymentHistory: async () => {
    if (isLive()) {
      try {
        const response = await axiosInstance.get('/api/payments/history');
        return response.data.data || [];
      } catch (err) {
        console.error('Failed to fetch payment history:', err);
        return [];
      }
    }
    return [];
  },

  getPayment: async (paymentId) => {
    if (isLive()) {
      try {
        const response = await axiosInstance.get(`/api/payments/${paymentId}`);
        return response.data.data;
      } catch (err) {
        console.error(`Failed to fetch payment details for ID ${paymentId}:`, err);
        throw err;
      }
    }
    return null;
  },

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
  },

  verifyPayment: async (verifyData) => {
    return paymentService.verifyPaymentSignature(verifyData);
  },

  refundPayment: async (paymentId) => {
    if (isLive()) {
      try {
        const response = await axiosInstance.post(`/api/payments/refund?paymentId=${paymentId}`);
        return response.data.data;
      } catch (err) {
        console.error('Backend payment refund failed:', err);
        const errMsg = err.response?.data?.message || 'Failed to process refund.';
        toast.error(errMsg);
        throw new Error(errMsg);
      }
    }
    return true;
  },

  downloadInvoice: async (paymentId) => {
    toast.success('Downloading tax invoice receipt PDF...');
    return true;
  },

  getTransactions: async () => {
    return paymentService.getPaymentHistory();
  }
};
