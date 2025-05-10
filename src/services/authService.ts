import { AxiosResponse } from 'axios';
import { setCookie, deleteCookie } from 'cookies-next';
import apiClient from './apiClient';


interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    [key: string]: unknown;
  };
}

interface LoginData {
  email: string;
  password: string;
}

interface ProviderData {
  provider: string;
  token: string;
}

interface RegisterData {
  email: string;
  password: string;
  // confirmPassword: string;
  referralId: number;
}

interface ResetPasswordData {
  email: string;
  password: string;
  otp: string;
}

// const apiClient = axios.create({
//   baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// Function to handle login
export const loginUser = async (loginData: LoginData): Promise<AuthResponse> => {
  try {
    const response: AxiosResponse<AuthResponse> = await apiClient.post('/api/auth/signin', loginData);
    const { token, user } = response.data;
    
    // Set both cookie and localStorage
    setCookie('token', token);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    return response.data;
  } catch (error: any) {
    console.error('Login failed:', error);
    throw error.response?.data?.message ?? error.message ?? error;
  }
};

export const loginProvider = async (loginData: ProviderData): Promise<void> => {
  try {
    const response: AxiosResponse<AuthResponse> = await apiClient.post('/api/auth/signin/provider', loginData);
    const { token, user } = response.data;
    
    // Set both cookie and localStorage
    setCookie('token', token);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const socialSignup = async (loginData: ProviderData): Promise<void> => {
  try {
    const response: AxiosResponse<AuthResponse> = await apiClient.post('/api/auth/signup/provider', loginData);
    const { token, user } = response.data;
    
    // Set both cookie and localStorage
    setCookie('token', token);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};

// Function to handle registration
export const registerUser = async (registerData: RegisterData): Promise<void> => {
  try {
    const response: AxiosResponse<AuthResponse> = await apiClient.post('/api/auth/signup', registerData);
    const { token, user } = response.data;
    
    // Set both cookie and localStorage
    setCookie('token', token);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  } catch (error) {
    console.error('Registration failed:', error);
    throw error;
  }
};

export const forgotPassword = async (email: string): Promise<void> => {
  try {
    const response: AxiosResponse<AuthResponse> = await apiClient.post('/api/auth/forgot-password', {email});
  } catch (error) {
    console.error('Registration failed:', error);
    throw error;
  }
};

export const resetPassword = async (passwordResetData: ResetPasswordData): Promise<void> => {
  try {
    const response: AxiosResponse<AuthResponse> = await apiClient.post('/api/auth/reset-password', passwordResetData);
  } catch (error) {
    console.error('Registration failed:', error);
    throw error;
  }
};

// Function to handle logout
export const logoutUser = (): void => {
  deleteCookie('token');
  localStorage.removeItem('user');
  localStorage.removeItem('token');
};

// Function to get the current user
export const getCurrentUser = (): unknown | null => {
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
  return null;
};
