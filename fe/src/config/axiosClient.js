// src/api/axiosClient.js
import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, 
});

// axiosClient.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('token'); // hoặc từ Redux, Zustand...
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// // Response Interceptor (handle lỗi chung)
// axiosClient.interceptors.response.use(
//   (response) => response.data,
//   (error) => {
//     console.error('API error:', error.response || error.message);
//     return Promise.reject(error);
//   }
// );

export default axiosClient;
