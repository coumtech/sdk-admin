import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
// import Router from 'next/router';
import { toast } from 'react-toastify';

// Create an Axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add the Bearer token to the headers
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      // const decoded = token && jwt.decode(token);
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors and redirects
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    const errorMessage = (error.response?.data as { message?: string })?.message;
    if (errorMessage) {
      toast.error(errorMessage);
    }

    // Check for 401 status and handle redirection to login
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        // Client-side only actions
        document.cookie = 'token=; Max-Age=0; path=/;';
        localStorage.clear();

        // Use Router to redirect to login
        // Router.push('/login');
        window.location.pathname = '/login'
      } else {
        // Handle the case for SSR (server-side)
        // In SSR, you can't directly redirect but can return some flag/response to handle it in getServerSideProps or a similar function
        return Promise.resolve({
          redirect: {
            destination: '/login',
            permanent: false,
          },
        });
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;