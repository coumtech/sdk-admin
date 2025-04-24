export interface App {
    id: number;
    userId: number;
    name: string;
    category: string;
    accessKey: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
}

export interface AppCategory {
    name: string;
    code: string;
}