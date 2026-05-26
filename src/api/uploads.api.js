import { coreApi } from './axios';

export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await coreApi.post('/uploads/file', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};
