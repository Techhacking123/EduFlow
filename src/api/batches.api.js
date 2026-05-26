import { coreApi } from './axios';

export const getBatches = async (params = {}) => {
  const response = await coreApi.get('/batches', { params });
  return response.data;
};

export const createBatch = async (batchData) => {
  const response = await coreApi.post('/batches', batchData);
  return response.data;
};

export const getBatchDetail = async (batchId) => {
  const response = await coreApi.get(`/batches/${batchId}`);
  return response.data;
};

export const updateBatch = async (batchId, batchData) => {
  const response = await coreApi.put(`/batches/${batchId}`, batchData);
  return response.data;
};

export const updateBatchPrice = async (batchId, priceData) => {
  const response = await coreApi.put(`/batches/${batchId}/price`, priceData);
  return response.data;
};

export const getMyBatches = async () => {
  const response = await coreApi.get('/batches/my-batches');
  return response.data;
};

export const getBatchStudents = async (batchId) => {
  const response = await coreApi.get(`/batches/${batchId}/students`);
  return response.data;
};
