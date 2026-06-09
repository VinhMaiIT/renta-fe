'use client';

import type { ReactNode } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { EmptyState, ErrorState } from '@/components/common/states';
import { NormalizedApiError } from '@/types/api';
import { cn } from '@/lib/utils';

export interface Column<T> {
  id: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  className?: string;
  headerClassName?: string;
  /** Hide this column below the given breakpoint (compact tablet view). */
  hideBelow?: 'sm' | 'md' | 'lg';
  /** Use this column's cell as the title in the mobile card layout. */
  primary?: boolean;
}

interface ListViewProps<T> {
  columns: Column<T>[];
  rows: T[];
  getRowId: (row: T) => string;
  isLoading?: boolean;
  isError?: boolean;
  error?: unknown;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  onRowClick?: (row: T) => void;
  /** Custom mobile card renderer; defaults to a label/value list. */
  mobileCard?: (row: T) => ReactNode;
  skeletonRows?: number;
}

const HIDE_CLASS: Record<NonNullable<Column<unknown>['hideBelow']>, string> = {
  sm: 'hidden sm:table-cell',
  md: 'hidden md:table-cell',
  lg: 'hidden lg:table-cell',
};

/**
 * Responsive list: full table on desktop (md+), stacked cards on mobile.
 * Handles loading / error / empty states uniformly.
 */
export function ListView<T>({
  columns,
  rows,
  getRowId,
  isLoading = false,
  isError = false,
  error,
  onRetry,
  emptyTitle = 'No records found',
  emptyDescription = 'Try adjusting your search or filters.',
  emptyAction,
  onRowClick,
  mobileCard,
  skeletonRows = 6,
}: ListViewProps<T>) {
  if (isError) {
    const message = error instanceof NormalizedApiError ? error.message : undefined;
    return <ErrorState description={message} onRetry={onRetry} />;
  }

  if (!isLoading && rows.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />;
  }

  const renderMobileCard =
    mobileCard ??
    ((row: T) => (
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
        {columns.map((col) => (
          <div key={col.id} className="contents">
            <dt className="text-muted-foreground">{col.header}</dt>
            <dd className="text-right font-medium">{col.cell(row)}</dd>
          </div>
        ))}
      </dl>
    ));

  return (
    <div>
      {/* Desktop / tablet table */}
      <div className="border-border hidden overflow-hidden rounded-lg border md:block">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead
                  key={col.id}
                  className={cn(col.hideBelow && HIDE_CLASS[col.hideBelow], col.headerClassName)}
                >
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: skeletonRows }).map((_, i) => (
                  <TableRow key={i}>
                    {columns.map((col) => (
                      <TableCell
                        key={col.id}
                        className={cn(col.hideBelow && HIDE_CLASS[col.hideBelow])}
                      >
                        <Skeleton className="h-4 w-full max-w-[140px]" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : rows.map((row) => (
                  <TableRow
                    key={getRowId(row)}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    className={cn(onRowClick && 'hover:bg-muted/50 cursor-pointer')}
                  >
                    {columns.map((col) => (
                      <TableCell
                        key={col.id}
                        className={cn(col.hideBelow && HIDE_CLASS[col.hideBelow], col.className)}
                      >
                        {col.cell(row)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile cards */}
      <div className="flex flex-col gap-3 md:hidden">
        {isLoading
          ? Array.from({ length: skeletonRows }).map((_, i) => (
              <Card key={i} className="p-4">
                <Skeleton className="mb-3 h-5 w-1/2" />
                <Skeleton className="mb-2 h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </Card>
            ))
          : rows.map((row) => (
              <Card
                key={getRowId(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn('p-4', onRowClick && 'active:bg-muted/50 cursor-pointer')}
              >
                {renderMobileCard(row)}
              </Card>
            ))}
      </div>
    </div>
  );
}
