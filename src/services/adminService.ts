import { Track } from '@/types/music';
import axiosClient from './apiClient';

const adminService = {

    getTotalStorageBreakdown: async (): Promise<any> => {
        try {
            return await axiosClient.get('/api/songs/storage/usage').then(res => res.data);
        } catch (error) {
            console.error('get storage breakdown failed:', error);
            throw error;
        }
    },

    async createSong(formData: FormData): Promise<Track> {
        const response = await axiosClient.post<Track>('/api/songs/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        return response.data;
      },
};

export default adminService;