// src/api/axiosClient.js
import axios from 'axios';
import { enqueueSnackbar } from 'notistack';
import { supabase } from './Supabase';

// const axiosClient = axios.create({
//   baseURL: 'https://schoolmedix-be.fly.dev/api',
//   headers: {
//     'Content-Type': 'application/json',
//   },
//   timeout: 60000,
// });

const axiosClient = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000,
});

axiosClient.interceptors.request.use(
  async (config) => {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error("Lỗi khi lấy session:", error.message);
    }

    const token = data?.session?.access_token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    console.error("Request Interceptor Error", error);
    return Promise.reject(error);
  }
);



axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      enqueueSnackbar("Chưa đăng nhập hoặc token hết hạn", { variant: 'warning' });
    } else if (status === 403) {
      enqueueSnackbar("Bạn không có quyền truy cập", { variant: 'error' });
    } else if (status === 404) {
      enqueueSnackbar("API không tồn tại", { variant: 'info' });
    }

    return Promise.reject(error);
  }
);


export default axiosClient;
