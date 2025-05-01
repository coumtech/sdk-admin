import { Track } from './music';

export interface Playlist {
    id?: number;
    name: string;
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
    songs?: Track[];
}