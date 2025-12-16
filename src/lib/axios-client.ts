import axios from "axios";

const NEXT_SERVER_URL = ""; 

export const apiClient = axios.create({
  baseURL: NEXT_SERVER_URL,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // If the Proxy says 401, it means Refresh Token failed
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);