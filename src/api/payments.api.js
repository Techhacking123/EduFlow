import { coreApi } from './axios';

export const createPaymentOrder = async (batchId) => {
  const response = await coreApi.post('/payments/create-order', { batch_id: batchId });
  return response.data;
};

export const verifyPayment = async (paymentData) => {
  const response = await coreApi.post('/payments/verify', paymentData);
  return response.data;
};

export const getMyPaymentHistory = async () => {
  const response = await coreApi.get('/payments/my-history');
  return response.data;
};

export const getBatchRevenue = async (batchId) => {
  const response = await coreApi.get(`/payments/batch/${batchId}/revenue`);
  return response.data;
};

export const getRevenueSummary = async () => {
  const response = await coreApi.get('/payments/revenue/summary');
  return response.data;
};
