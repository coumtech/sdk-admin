import axios from 'axios';
import axiosClient from './apiClient';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  imageUrl: string;
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
}; 