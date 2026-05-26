import { createSlice } from '@reduxjs/toolkit';

// Rehydrate from sessionStorage on load
const storedToken = sessionStorage.getItem('accessToken');
const storedUser = sessionStorage.getItem('user');

const initialState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  accessToken: storedToken || null,
  isAuthenticated: !!storedToken,
  loading: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, accessToken } = action.payload;
      state.user = user;
      state.accessToken = accessToken;
      state.isAuthenticated = true;
      state.loading = false;
      // Persist to sessionStorage
      sessionStorage.setItem('accessToken', accessToken);
      sessionStorage.setItem('user', JSON.stringify(user));
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.loading = false;
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('refreshToken');
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    updateAccessToken: (state, action) => {
      state.accessToken = action.payload;
      sessionStorage.setItem('accessToken', action.payload);
    },
  },
});

export const { setCredentials, logout, setLoading, updateAccessToken } =
  authSlice.actions;

export default authSlice.reducer;
