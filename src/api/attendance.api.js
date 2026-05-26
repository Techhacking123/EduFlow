import { coreApi } from './axios';

export const attendanceApi = {
  getBatchAttendance: async (batchId, date) => {
    let url = `/batches/${batchId}/attendance`;
    if (date) url += `?date=${date}`;
    const response = await coreApi.get(url);
    return response.data;
  },

  getStudentAttendance: async (batchId, studentId) => {
    const response = await coreApi.get(`/batches/${batchId}/attendance/student/${studentId}`);
    return response.data;
  }
};
