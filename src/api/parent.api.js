import { coreApi } from './axios';

export const parentApi = {
  getLinkedChildren: async () => {
    const response = await coreApi.get('/parent/children');
    return response.data;
  },

  linkStudent: async (studentCode) => {
    const response = await coreApi.post('/parent/link-student', { student_code: studentCode });
    return response.data;
  },

  getChildProgress: async (studentId) => {
    const response = await coreApi.get(`/parent/children/${studentId}/progress`);
    return response.data;
  },

  getChildFees: async (studentId) => {
    const response = await coreApi.get(`/parent/children/${studentId}/fees`);
    return response.data;
  }
};
