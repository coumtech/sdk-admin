import { Artist } from '@/types/artist'
import axiosClient from './apiClient';

const artistService = {
    async createArtist(artistData: Omit<Artist, 'id' | 'createdAt' | 'updatedAt'>): Promise<Artist> {
        const response = await axiosClient.post<Artist>('/artist', artistData);
        return response.data;
    },

    async getArtists(): Promise<Artist[]> {
        const response = await axiosClient.get<Artist[]>('/api/artist');
        return response.data;
    },

    async getArtistById(artistId: number): Promise<Artist> {
        const response = await axiosClient.get<Artist>(`/api/artist/${artistId}`);
        return response.data;
    },

    async updateArtist(
        artistId: number,
        artistData: Partial<Omit<Artist, 'id' | 'createdAt' | 'updatedAt'>>
    ): Promise<Artist> {
        const response = await axiosClient.put<Artist>(`/artist/${artistId}`, artistData);
        return response.data;
    },

    async deleteArtist(artistId: number): Promise<void> {
        await axiosClient.delete<void>(`/artist/${artistId}`);
    },
};

export default artistService;