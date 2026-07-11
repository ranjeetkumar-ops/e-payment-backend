import axios from "axios";

const LOCAL_API_BASE_URL = "http://127.0.0.1:8000";
const ONLINE_API_BASE_URL = "https://e-payment-backend-2rwj.onrender.com";

const cleanUrl = (url) => String(url || "").replace(/\/+$/, "");

export const API_SERVERS = {
  local: cleanUrl(process.env.REACT_APP_LOCAL_API_URL || LOCAL_API_BASE_URL),
  online: cleanUrl(process.env.REACT_APP_ONLINE_API_URL || ONLINE_API_BASE_URL),
};

const configuredApiUrl = cleanUrl(
  process.env.REACT_APP_API_BASE_URL || process.env.REACT_APP_API_URL || ""
);

const configuredApiMode = (process.env.REACT_APP_API_MODE || "").toLowerCase();

const getInitialApiBaseUrl = () => {
  if (configuredApiUrl) return configuredApiUrl;
  if (configuredApiMode === "online") return API_SERVERS.online;
  if (configuredApiMode === "local") return API_SERVERS.local;

  const savedMode = localStorage.getItem("api_server");
  if (savedMode === "online") return API_SERVERS.online;
  if (savedMode === "local") return API_SERVERS.local;

  return API_SERVERS.local;
};

let activeApiBaseUrl = getInitialApiBaseUrl();

export const API_BASE_URL = activeApiBaseUrl;

export const getApiBaseUrl = () => activeApiBaseUrl;

export const buildApiUrl = (path = "") => {
  const cleanPath = String(path).replace(/^\/+/, "");
  return cleanPath ? `${activeApiBaseUrl}/${cleanPath}` : activeApiBaseUrl;
};

const getFallbackApiBaseUrl = () => {
  return activeApiBaseUrl === API_SERVERS.local ? API_SERVERS.online : API_SERVERS.local;
};

const shouldTryFallback = (error) => {
  if (!error.response) return true;
  return [502, 503, 504].includes(error.response.status);
};

const setActiveApiBaseUrl = (url) => {
  activeApiBaseUrl = url;
  instance.defaults.baseURL = activeApiBaseUrl;
  localStorage.setItem(
    "api_server",
    activeApiBaseUrl === API_SERVERS.online ? "online" : "local"
  );
};

const instance = axios.create({
  baseURL: activeApiBaseUrl,
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

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const fallbackApiBaseUrl = getFallbackApiBaseUrl();

    if (shouldTryFallback(error) && fallbackApiBaseUrl && originalRequest && !originalRequest._usedApiFallback) {
      originalRequest._usedApiFallback = true;
      setActiveApiBaseUrl(fallbackApiBaseUrl);
      originalRequest.baseURL = activeApiBaseUrl;
      return instance(originalRequest);
    }

    return Promise.reject(error);
  }
);

export default instance;
