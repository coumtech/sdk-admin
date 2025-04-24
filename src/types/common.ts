export interface PaginationResponse<T> {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    data: T[];
}

export interface PaginationRequest {
    search?: string;
}

export interface ActionResponse {
    message?: string;
}