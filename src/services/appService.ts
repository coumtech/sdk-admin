import { AxiosResponse } from 'axios';
import axiosClient from './apiClient';
import { App, AppCategory } from '@/types/app';


interface CreateAppData {
    name: string;
}

interface RecreateAccessKeyResponse {
    message: string;
    accessKey: string;
}

class AppService {
    static async createApp(appData: CreateAppData): Promise<AxiosResponse<{ message: string; app: App }>> {
        try {
            const response = await axiosClient.post(`/api/app/create`, appData);
            return response.data;
        } catch (error: any) {
            console.error('Error creating app:', error);
            throw error.response?.data || error;
        }
    }

    static async getUserAllApps(): Promise<App[]> {
        try {
            const response = await axiosClient.get<App[]>(`/api/app`);
            return response.data;
        } catch (error: any) {
            console.error('Error fetching all apps:', error);
            throw error.response?.data || error;
        }
    }

    static async getAppById(id: number): Promise<App> {
        try {
            const response = await axiosClient.get<App>(`/api/app/${id}`);
            return response.data;
        } catch (error: any) {
            console.error(`Error fetching app with ID ${id}:`, error);
            throw error.response?.data || error;
        }
    }

    static async recreateAccessKey(id: number): Promise<RecreateAccessKeyResponse> {
        try {
            const response = await axiosClient.put<RecreateAccessKeyResponse>(`/api/app/${id}/recreate-access-key`);
            return response.data;
        } catch (error: any) {
            console.error(`Error recreating access key for app with ID ${id}:`, error);
            throw error.response?.data || error;
        }
    }

    static async getAppCategories(): Promise<AppCategory[]> {
        try {
            const response = await axiosClient.get<AppCategory[]>(`/api/app/categories`);
            return response.data;
        } catch (error: any) {
            console.error('Error fetching all apps:', error);
            throw error.response?.data || error;
        }
    }

    static async getAppComments(): Promise<any> {
        try {
            const response = await axiosClient.get<any>(`/api/app/comments`);
            return response.data;
        } catch (error: any) {
            console.error('Error fetching all apps:', error);
            throw error.response?.data || error;
        }
    }
}

export default AppService;