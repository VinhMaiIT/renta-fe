'use client';

import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/common/page-header';
import { ListToolbar } from '@/components/common/list-toolbar';
import { StatusBadge } from '@/components/common/status-badge';
import { ListView, type Column } from '@/components/tables/list-view';
import { PaginationBar } from '@/components/tables/pagination-bar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { usePagination } from '@/hooks/use-pagination';
import { RENTAL_ORDER_STATUS_META, toOptions } from '@/constants/enum-labels';
import { formatCurrency, formatDate } from '@/lib/format';
import type { RentalOrder } from '@/types/models';
import type { RentalOrderStatus } from '@/types/enums';
import { useRentalOrders } from './use-rental-orders';

const STATUS_OPTIONS = toOptions(RENTAL_ORDER_STATUS_META);

export function RentalOrdersPage() {
  const router = useRouter();
  const pagination = usePagination();
  const list = useRentalOrders(pagination.queryParams);
  const data = list.data;

  const goToOrder = (id: string) => router.push(`/rental-orders/${id}`);

  const columns: Column<RentalOrder>[] = [
    {
      id: 'orderCode',
      header: 'Order code',
      primary: true,
      cell: (r) => <span className="font-medium">{r.orderCode}</span>,
    },
    {
      id: 'status',
      header: 'Status',
      cell: (r) => <StatusBadge meta={RENTAL_ORDER_STATUS_META[r.status]} />,
    },
    { id: 'rentDate', header: 'Rent date', cell: (r) => formatDate(r.rentDate) },
    {
      id: 'expectedReturnDate',
      header: 'Expected return',
      hideBelow: 'md',
      cell: (r) => formatDate(r.expectedReturnDate),
    },
    { id: 'items', header: 'Items', cell: (r) => r.items.length },
    {
      id: 'total',
      header: 'Total',
      hideBelow: 'sm',
      cell: (r) => formatCurrency(r.totalAmount),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Rental orders"
        description="Create and track rental orders across their lifecycle."
        actions={
          <Button onClick={() => router.push('/rental-orders/new')}>
            <Plus className="size-4" />
            New order
          </Button>
        }
      />

      <ListToolbar
        search={pagination.search}
        onSearchChange={pagination.setSearch}
        searchPlaceholder="Search by order code…"
        filters={
          <>
            <NativeSelect
              value={pagination.filters.status ?? ''}
              onChange={(e) =>
                pagination.setFilter('status', (e.target.value as RentalOrderStatus) || undefined)
              }
              aria-label="Status filter"
            >
              <NativeSelectOption value="">All statuses</NativeSelectOption>
              {STATUS_OPTIONS.map((opt) => (
                <NativeSelectOption key={opt.value} value={opt.value}>
                  {opt.label}
                </NativeSelectOption>
              ))}
            </NativeSelect>
            <Input
              className="w-full sm:w-48"
              placeholder="Customer ID (optional)"
              value={pagination.filters.customerId ?? ''}
              onChange={(e) => pagination.setFilter('customerId', e.target.value || undefined)}
              aria-label="Customer ID filter"
            />
          </>
        }
      />

      <ListView
        columns={columns}
        rows={data?.items ?? []}
        getRowId={(r) => r.id}
        isLoading={list.isLoading}
        isError={list.isError}
        error={list.error}
        onRetry={() => list.refetch()}
        onRowClick={(r) => goToOrder(r.id)}
        emptyTitle="No rental orders yet"
        emptyDescription="Create your first rental order to get started."
        emptyAction={
          <Button onClick={() => router.push('/rental-orders/new')} size="sm">
            <Plus className="size-4" />
            New order
          </Button>
        }
        mobileCard={(r) => (
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium">{r.orderCode}</span>
              <StatusBadge meta={RENTAL_ORDER_STATUS_META[r.status]} />
            </div>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              <dt className="text-muted-foreground">Rent date</dt>
              <dd className="text-right">{formatDate(r.rentDate)}</dd>
              <dt className="text-muted-foreground">Expected return</dt>
              <dd className="text-right">{formatDate(r.expectedReturnDate)}</dd>
              <dt className="text-muted-foreground">Items</dt>
              <dd className="text-right">{r.items.length}</dd>
              <dt className="text-muted-foreground">Total</dt>
              <dd className="text-right font-medium">{formatCurrency(r.totalAmount)}</dd>
            </dl>
          </div>
        )}
      />

      {data ? (
        <PaginationBar
          page={data.page}
          pageSize={data.pageSize}
          total={data.total}
          totalPages={data.totalPages}
          onPageChange={pagination.setPage}
          onPageSizeChange={pagination.setPageSize}
        />
      ) : null}
    </div>
  );
}
