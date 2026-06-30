import axios from "axios";

export const API_BASE_URL =
  (
    process.env.REACT_APP_API_BASE_URL ||
    process.env.REACT_APP_API_URL ||
    "https://e-payment-backend-2rwj.onrender.com"
  ).replace(/\/+$/, "");
  
 

const instance = axios.create({
  baseURL: API_BASE_URL,
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  const warehouse =
    localStorage.getItem("warehouse_id") || localStorage.getItem("warehouse");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (warehouse) {
    config.headers.warehouse = warehouse;
  }

  return config;
});

export default instance;
