export interface PaginatedRequest<T> {
  page?: number;
  pageSize?: number;
  queryString?: string;
  showDeleted?: boolean; // Whether to include deleted products
  sortBy?: keyof T;
  sortOrder?: 'asc' | 'desc';
}
