import axios from "axios";

const adminAPI = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/admin`,
});

adminAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("admin_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default adminAPI;
