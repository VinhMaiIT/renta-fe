'use client';

import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type {
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
  SortingState,
} from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';
import { ErrorState } from '@/components/common/states';
import { NormalizedApiError } from '@/types/api';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n/locale-provider';

/** Column config — identical to the one ListView used, for a drop-in swap. */
export interface Column<T> {
  id: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  className?: string;
  headerClassName?: string;
  hideBelow?: 'sm' | 'md' | 'lg';
}

interface DataTableViewProps<T> {
  columns: Column<T>[];
  rows: T[];
  isLoading?: boolean;
  isError?: boolean;
  error?: unknown;
  onRetry?: () => void;
  onRowClick?: (row: T) => void;
  emptyTitle?: string;
  /** Server pagination state + handlers. */
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

const HIDE_CLASS: Record<NonNullable<Column<unknown>['hideBelow']>, string> = {
  sm: 'hidden sm:table-cell',
  md: 'hidden md:table-cell',
  lg: 'hidden lg:table-cell',
};

/**
 * Adapter that renders the design-system `DataTable` (TanStack table with
 * server pagination + pinned actions + i18n) from our simple column config.
 */
export function DataTableView<T>({
  columns,
  rows,
  isLoading = false,
  isError = false,
  error,
  onRetry,
  onRowClick,
  emptyTitle,
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
}: DataTableViewProps<T>) {
  const { t } = useT();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const tableColumns = useMemo<ColumnDef<T>[]>(
    () =>
      columns.map((col) => ({
        id: col.id,
        header: () => col.header,
        cell: (ctx) => col.cell(ctx.row.original),
        enableSorting: false,
        meta: {
          className: cn(
            col.hideBelow && HIDE_CLASS[col.hideBelow],
            col.headerClassName,
            col.className,
          ),
          cardLabel: col.header,
        },
      })),
    [columns],
  );

  const pagination: PaginationState = { pageIndex: Math.max(0, page - 1), pageSize };

  const handlePaginationChange = (updater: PaginationState | ((old: PaginationState) => PaginationState)) => {
    const next = typeof updater === 'function' ? updater(pagination) : updater;
    if (next.pageSize !== pageSize) {
      onPageSizeChange(next.pageSize);
    } else if (next.pageIndex !== pagination.pageIndex) {
      onPageChange(next.pageIndex + 1);
    }
  };

  if (isError) {
    const message = error instanceof NormalizedApiError ? error.message : undefined;
    return <ErrorState description={message} onRetry={onRetry} />;
  }

  return (
    <div className="border-border bg-card overflow-hidden rounded-xl border p-2 shadow-sm sm:p-3">
      <DataTable<T>
        data={rows}
        columns={tableColumns}
        loading={isLoading}
        sorting={sorting}
        onSortingChange={setSorting}
        columnFilters={columnFilters}
        onColumnFiltersChange={setColumnFilters}
        pagination={pagination}
        onPaginationChange={handlePaginationChange}
        totalCount={total}
        onRowClick={onRowClick}
        emptyMessage={emptyTitle}
        emptyFilterMessage={emptyTitle}
        pageSizeLabel={(size) => t('common.pagination.perPage', { size })}
        mobileCards
      />
    </div>
  );
}
