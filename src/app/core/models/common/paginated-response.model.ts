export interface PaginatedResponse<T> {
  data: T[]; // Array of items of generic type T
  pagination: {
    page: number; // Current page number
    pageSize: number; // Number of items per page
    total: number; // Total number of items
    totalPages: number; // Total number of pages
  };
}
