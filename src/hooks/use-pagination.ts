'use client';

import { useCallback, useMemo, useState } from 'react';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '@/constants/config';
import type { SortOrder } from '@/types/api';

export type Filters = Record<string, string | undefined>;

export interface UsePaginationOptions {
  initialPage?: number;
  initialPageSize?: number;
  initialOrder?: SortOrder;
  initialSearch?: string;
  initialFilters?: Filters;
}

export interface UsePaginationResult {
  page: number;
  pageSize: number;
  order: SortOrder;
  search: string;
  filters: Filters;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setOrder: (order: SortOrder) => void;
  /** Updating search resets to page 1. */
  setSearch: (search: string) => void;
  /** Update a single filter (undefined/'' clears it) and reset to page 1. */
  setFilter: (key: string, value: string | undefined) => void;
  setFilters: (filters: Filters) => void;
  reset: () => void;
  /** Query params object ready to spread into a list request. */
  queryParams: Record<string, string | number>;
}

/**
 * Reusable list/table pagination state: page, pageSize, order, search, and an
 * arbitrary filter bag. Produces a `queryParams` object for API calls.
 */
export function usePagination(options: UsePaginationOptions = {}): UsePaginationResult {
  const {
    initialPage = DEFAULT_PAGE,
    initialPageSize = DEFAULT_PAGE_SIZE,
    initialOrder = 'DESC',
    initialSearch = '',
    initialFilters = {},
  } = options;

  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSizeState] = useState(initialPageSize);
  const [order, setOrderState] = useState<SortOrder>(initialOrder);
  const [search, setSearchState] = useState(initialSearch);
  const [filters, setFiltersState] = useState<Filters>(initialFilters);

  const setSearch = useCallback((value: string) => {
    setSearchState(value);
    setPage(1);
  }, []);

  const setPageSize = useCallback((value: number) => {
    setPageSizeState(value);
    setPage(1);
  }, []);

  const setOrder = useCallback((value: SortOrder) => {
    setOrderState(value);
    setPage(1);
  }, []);

  const setFilter = useCallback((key: string, value: string | undefined) => {
    setFiltersState((prev) => ({ ...prev, [key]: value || undefined }));
    setPage(1);
  }, []);

  const setFilters = useCallback((next: Filters) => {
    setFiltersState(next);
    setPage(1);
  }, []);

  const reset = useCallback(() => {
    setPage(initialPage);
    setPageSizeState(initialPageSize);
    setOrderState(initialOrder);
    setSearchState(initialSearch);
    setFiltersState(initialFilters);
  }, [initialPage, initialPageSize, initialOrder, initialSearch, initialFilters]);

  const queryParams = useMemo(() => {
    const params: Record<string, string | number> = { page, pageSize, order };
    if (search.trim()) params.search = search.trim();
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== '') params[key] = value;
    }
    return params;
  }, [page, pageSize, order, search, filters]);

  return {
    page,
    pageSize,
    order,
    search,
    filters,
    setPage,
    setPageSize,
    setOrder,
    setSearch,
    setFilter,
    setFilters,
    reset,
    queryParams,
  };
}
