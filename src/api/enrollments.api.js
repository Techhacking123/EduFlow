import { coreApi } from './axios';

export const enrollFreeBatch = async (batchId) => {
  const response = await coreApi.post('/enrollments/free', { batch_id: batchId });
  return response.data;
};

export const getMyEnrollments = async () => {
  const response = await coreApi.get('/enrollments/my-enrollments');
  return response.data;
};

export const approveEnrollment = async (enrollmentId) => {
  const response = await coreApi.put(`/enrollments/${enrollmentId}/approve`);
  return response.data;
};

export const dropEnrollment = async (enrollmentId) => {
  const response = await coreApi.put(`/enrollments/${enrollmentId}/drop`);
  return response.data;
};

export const getAllEnrollments = async (status = '') => {
  const url = status ? `/enrollments?status=${status}` : '/enrollments';
  const response = await coreApi.get(url);
  return response.data;
};
