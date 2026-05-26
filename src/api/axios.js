import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/v1/auth` : 'http://localhost:5000/api/v1/auth',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const coreApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/v1` : 'http://localhost:5000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

const attachInterceptors = (instance) => {
  // Request interceptor: attach access token
  instance.interceptors.request.use(
    (config) => {
      const token = sessionStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error),
  );

  // Response interceptor: handle 401 with auto token refresh
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const refreshToken = sessionStorage.getItem('refreshToken');
          if (!refreshToken) throw new Error('No refresh token');

          const refreshResp = await axios.post(
            `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/auth/refresh`,
            { refresh_token: refreshToken },
          );

          const newAccessToken = refreshResp.data.data.access_token;
          sessionStorage.setItem('accessToken', newAccessToken);

          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return instance(originalRequest);
        } catch (err) {
          // Token refresh failed — log out and redirect
          sessionStorage.removeItem('accessToken');
          sessionStorage.removeItem('user');
          sessionStorage.removeItem('refreshToken');
          window.location.href = '/login';
          return Promise.reject(err);
        }
      }

      return Promise.reject(error);
    },
  );
};

attachInterceptors(api);
attachInterceptors(coreApi);

export default api;
