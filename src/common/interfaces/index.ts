// common
export interface ApiResponse<T> {
  status: 'success' | 'error';
  message: string;
  data?: T;
  meta?: any;
}


// pagination
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginationResult<T> {
  meta: PaginationMeta;
  data: T[];
}

