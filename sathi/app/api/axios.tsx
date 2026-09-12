import axios from "axios";
import { getAccessToken, setAccessToken, setUser } from "../auth/store";

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const axiosInstance = axios.create({
  baseURL: baseURL,
  withCredentials: false,
  timeout: 0
});

// request interceptor — har request mein token lagao
axiosInstance.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const publicPaths = ["/user/verifyOtp", "/user/login", "/user/signup"];

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // auth routes pe refresh mat karo
    const isPublicRoute = publicPaths.some((path) =>
      originalRequest.url?.includes(path)
    );

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isPublicRoute   // ← ye add kiya
    ) {
      originalRequest._retry = true;
      try {
        const { data } = await axios.post(
          `/api/refresh`, {}
        );
        setAccessToken(data.accessToken);
        setUser(data.user);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return axiosInstance(originalRequest);
      } catch (err) {
        setAccessToken(null);
        setUser(null);
        if (window.location.pathname.startsWith('/admin')) {
          window.location.href = '/admin/login';
        } else {
          window.location.href = '/signin';
        }
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export const initAuth = async () => {
  try {
    const { data } = await axios.post(
      `/api/refresh`, {}
    );
    console.log("REFRESH RESPONSE:", data);
    setAccessToken(data.accessToken);
    setUser(data.user);
  } catch {
    setAccessToken(null);
    setUser(null);
  }
};