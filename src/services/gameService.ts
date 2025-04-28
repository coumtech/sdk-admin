import axiosClient from './apiClient';

const gameService = {
  getAllGames: async (params: any) => {
    try {
      const response = await axiosClient.get('/api/games', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching games:', error);
      throw error;
    }
  },

  getGameById: async (id: string) => {
    try {
      const response = await axiosClient.get(`/api/games/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching game:', error);
      throw error;
    }
  },

  createGame: async (formData: FormData) => {
    try {
      const response = await axiosClient.post('/api/games', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error creating game:', error);
      throw error;
    }
  },

  removeGameById: async (id: string) => {
    try {
      const response = await axiosClient.delete(`/api/games/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting game:', error);
      throw error;
    }
  },
};

export default gameService; 