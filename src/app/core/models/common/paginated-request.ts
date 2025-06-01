export interface PaginatedRequest {
  page?: number;
  pageSize?: number;
  queryString?: string;
  showDeleted?: boolean; // Whether to include deleted products
}
