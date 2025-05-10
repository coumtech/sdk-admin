import axios from 'axios';
import axiosClient from './apiClient';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  artist?: string;
  createdAt: {
    _seconds: number;
    _nanoseconds: number;
  };
  updatedAt: {
    _seconds: number;
    _nanoseconds: number;
  };
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Filters {
  maxPrice?: number;
  minPrice?: number;
  artist?: string;
  search?: string;
}

export interface Sort {
  field: string;
  order: 'asc' | 'desc';
}

export interface ProductsResponse {
  products: Product[];
  pagination: Pagination;
  filters: Filters;
  sort: Sort;
}

export const productService = {
  async createProduct(formData: FormData): Promise<Product> {
    const response = await axiosClient.post(`/api/products/artist`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async updateProduct(id: string, formData: FormData): Promise<Product> {
    const response = await axiosClient.put(`/api/products/artist/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async getProducts(): Promise<Product[]> {
    const response = await axiosClient.get(`/api/products/artist`);
    return response.data;
  },

  async deleteProduct(id: string): Promise<void> {
    await axiosClient.delete(`/api/products/artist/${id}`);
  },

  async getAllProducts(params?: URLSearchParams): Promise<ProductsResponse> {
    const response = await axiosClient.get(`/api/products?${params?.toString()}`);
    return response.data;
  },

  async getProductById(id: string): Promise<Product> {
    const response = await axiosClient.get(`/api/products/${id}`);
    return response.data;
  },
}; 