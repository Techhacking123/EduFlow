import { coreApi } from './axios';

export const getCourses = async (params = {}) => {
  const response = await coreApi.get('/courses', { params });
  return response.data;
};

export const createCourse = async (courseData) => {
  const response = await coreApi.post('/courses', courseData);
  return response.data;
};

export const getCourseDetail = async (courseId) => {
  const response = await coreApi.get(`/courses/${courseId}`);
  return response.data;
};

export const updateCourse = async (courseId, courseData) => {
  const response = await coreApi.put(`/courses/${courseId}`, courseData);
  return response.data;
};

export const togglePublishCourse = async (courseId) => {
  const response = await coreApi.post(`/courses/${courseId}/publish`);
  return response.data;
};

export const createLesson = async (courseId, lessonData) => {
  const response = await coreApi.post(`/courses/${courseId}/lessons`, lessonData);
  return response.data;
};

export const updateLesson = async (courseId, lessonId, lessonData) => {
  const response = await coreApi.put(`/courses/${courseId}/lessons/${lessonId}`, lessonData);
  return response.data;
};

export const deleteLesson = async (courseId, lessonId) => {
  const response = await coreApi.delete(`/courses/${courseId}/lessons/${lessonId}`);
  return response.data;
};

export const markLessonComplete = async (courseId, lessonId, data = {}) => {
  const response = await coreApi.post(`/courses/${courseId}/lessons/${lessonId}/progress`, data);
  return response.data;
};

export const getMyProgress = async (courseId) => {
  const response = await coreApi.get(`/courses/${courseId}/my-progress`);
  return response.data;
};
