export interface PaginationResult<T> {
  items: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}
