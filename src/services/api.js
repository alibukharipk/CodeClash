import axios from "axios";
import { API_URL } from "../common.js";

const api = axios.create({
  baseURL: API_URL,
});

// Add interceptor to inject token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;