import { AxiosResponse } from 'axios';
import axios from './apiClient';
import { Playlist } from '@/types/playlist';
import { Track } from '@/types/music';

const API_URL = '/api/playlists';

const getAllPlaylists = async (): Promise<Playlist[]> => {
  const response: AxiosResponse<Playlist[]> = await axios.get(API_URL);
  return response.data;
};

const getPlaylistById = async (id: string): Promise<Playlist & {tracks: Track[]}> => {
  const response: AxiosResponse<Playlist & {tracks: Track[]}> = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

const createPlaylist = async (formData: FormData): Promise<Playlist> => {
  const response: AxiosResponse<Playlist> = await axios.post(API_URL, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

const updatePlaylist = async (id: number, formData: FormData): Promise<Playlist> => {
  const response: AxiosResponse<Playlist> = await axios.put(`${API_URL}/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

const deletePlaylist = async (id: string): Promise<void> => {
  await axios.delete(`${API_URL}/${id}`);
};

const getPlaylistSongs = async (playlistId: string | number): Promise<Track[]> => {
  const response: AxiosResponse<Track[]> = await axios.get(`${API_URL}/${playlistId}/songs`);
  return response.data;
};

const addSongToPlaylist = async (playlistId: string, songId: string): Promise<void> => {
  await axios.post(`${API_URL}/${playlistId}/songs`, { songId });
};

const removeSongFromPlaylist = async (playlistId: string, songId: string): Promise<void> => {
  await axios.delete(`${API_URL}/${playlistId}/songs/${songId}`);
};
// eslint-disable-next-line import/no-anonymous-default-export
export default {
  getAllPlaylists,
  getPlaylistById,
  createPlaylist,
  updatePlaylist,
  deletePlaylist,
  getPlaylistSongs,
  addSongToPlaylist,
  removeSongFromPlaylist,
};