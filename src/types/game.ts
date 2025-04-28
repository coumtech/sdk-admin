export interface Game {
    id: string;
    title: string;
    developer: string;
    description: string;
    genre: string;
    price: number;
    gameUrl: string;
    coverUrl: string;
    createdAt: string;
    updatedAt: string;
    metadata: {
        fileSize: number;
        coverSize: number;
    };
} 