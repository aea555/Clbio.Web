import axios from "axios";

const NEXT_SERVER_URL = "";

export const apiClient = axios.create({
  baseURL: NEXT_SERVER_URL,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;

    const isAuthRequest = originalRequest.url?.includes("/auth/") ||
      originalRequest.url?.includes("/login") ||
      originalRequest.url?.includes("/register") ||
      originalRequest.url?.includes("/verify");

    if (error.response?.status === 401 && !isAuthRequest) {
      window.location.href = "/auth/login";
    }

    return Promise.reject(error);
  }
);