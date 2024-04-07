import { PaginationParams } from "@lib-shared/params/pagination-params";

export type Pagination = {
  totalCount: number;
  totalPages: number | null;
  currentPage: number;
};

function pagination(totalCount: number, params: PaginationParams): Pagination {
  const totalPages = Math.ceil(totalCount / params.pageSize);
  return {
    totalCount: totalCount,
    totalPages: totalPages,
    currentPage: Math.max(Math.min(params.page, totalPages), 1),
  };
}

export type PaginatedModel<T> = {
  pagination: Pagination;
  items: T[];
};

export function paginatedModel<T>(items: T[], totalCount: number, params: PaginationParams): PaginatedModel<T> {
  return {
    items: items,
    pagination: pagination(totalCount, params),
  };
}
