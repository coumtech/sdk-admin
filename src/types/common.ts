export type PaginationResponse<T, K extends string = 'data'> = {
    totalItems: number;
    totalPages: number;
    currentPage: number;
} & Record<K, T[]>;

export interface PaginationRequest {
    search?: string;
}

export interface ActionResponse {
    message?: string;
}