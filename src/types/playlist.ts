export interface Playlist {
    id?: number;
    title: string;
    appCategory: string;
    description?: string;
    cover?: string;
    public: boolean;
    likes?: number;
    follows?: number;
    lastUpdated?: Date;
    userId: number;
    createdAt: string;
    updatedAt: string;
  }