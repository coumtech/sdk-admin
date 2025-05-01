import { Album, Track } from '@/types/music';
import { ActionResponse, PaginationRequest, PaginationResponse } from '@/types/common';
import axiosClient from './apiClient';

const musicService = {

  async createAlbum(formData: FormData): Promise<Album> {
    const response = await axiosClient.post<Album>('/api/album', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async getAlbums(params: PaginationRequest): Promise<PaginationResponse<Album>> {
    const response = await axiosClient.get<PaginationResponse<Album>>('/api/album', { params });
    return response.data;
  },

  async getAlbumById(id: any): Promise<Album> {
    const response = await axiosClient.get<Album>(`/api/album/${id}`);
    return response.data;
  },

  async removeAlbumById(id: any): Promise<ActionResponse> {
    const response = await axiosClient.delete<ActionResponse>(`/api/album/${id}`);
    return response.data;
  },

  async createSong(formData: FormData): Promise<Track> {
    const response = await axiosClient.post<Track>('/api/track', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async getSongs(params: PaginationRequest): Promise<PaginationResponse<Track>> {
    const response = await axiosClient.get<PaginationResponse<Track>>('/api/songs', { params });
    return response.data;
  },

  async getAllSongs(params: PaginationRequest): Promise<PaginationResponse<Track, 'songs'>> {
    const response = await axiosClient.get<PaginationResponse<Track, 'songs'>>('/api/songs', { params });
    return response.data;
  },

  async getSongById(id: any): Promise<Track> {
    const response = await axiosClient.get<Track>(`/api/songs/${id}`);
    return response.data;
  },

  async removeSongById(id: any): Promise<ActionResponse> {
    const response = await axiosClient.delete<ActionResponse>(`/api/songs/${id}`);
    return response.data;
  },

  async getChargeBySongId(id: any, method: string, params = {}): Promise<any> {
    const response = await axiosClient.get<any>(`/api/songs/${id}/charge/${method}`, { params });
    return response.data;
  },

  async saveStripePurchaseData(id: any, paymentintent: string): Promise<any> {
    const response = await axiosClient.post<any>(`/api/songs/${id}/purchase/${paymentintent}`);
    return response.data;
  },
  async saveCryptoPurchaseData(id: any, paymentToken: string, txHash: string): Promise<any> {
    const response = await axiosClient.post<any>(`/api/songs/${id}/crypto/verify`, { paymentToken, txHash });
    return response.data;
  },

  async getPublicSongById(id: any): Promise<Track> {
    const response = await axiosClient.get<Track>(`/api/public/songs/${id}`);
    return response.data;
  },
};

export default musicService;