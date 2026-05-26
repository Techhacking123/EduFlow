import api from './axios';

export const login = async (email, password) => {
  const response = await api.post('/login', { email, password });
  return response.data;
};

export const register = async (userData) => {
  const response = await api.post('/register', userData);
  return response.data;
};

export const refreshAccessToken = async (refreshToken) => {
  const response = await api.post('/refresh', { refresh_token: refreshToken });
  return response.data;
};

export const logout = async (accessToken, refreshToken) => {
  const response = await api.post(
    '/logout',
    { refresh_token: refreshToken },
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get('/me');
  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await api.post('/forgot-password', { email });
  return response.data;
};

export const resetPassword = async (email, otp, newPassword) => {
  const response = await api.post('/reset-password', {
    email,
    otp,
    new_password: newPassword,
  });
  return response.data;
};

export const getFaculties = async () => {
  const response = await api.get('/faculties');
  return response.data;
};
