'use client';

import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/common/page-header';
import { ListToolbar } from '@/components/common/list-toolbar';
import { ListView, type Column } from '@/components/tables/list-view';
import { PaginationBar } from '@/components/tables/pagination-bar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePagination } from '@/hooks/use-pagination';
import { formatCurrency, formatDate } from '@/lib/format';
import { useReturnTransactions } from './use-returns';
import type { ReturnTransaction } from '@/types/models';

export function ReturnsPage() {
  const router = useRouter();
  const pagination = usePagination();
  const list = useReturnTransactions(pagination.queryParams);

  const data = list.data;

  const openNew = () => router.push('/return-transactions/new');
  const openDetail = (row: ReturnTransaction) => router.push(`/return-transactions/${row.id}`);

  const columns: Column<ReturnTransaction>[] = [
    {
      id: 'code',
      header: 'Return',
      primary: true,
      cell: (r) => <span className="font-medium">#{r.id}</span>,
    },
    {
      id: 'rentalOrderId',
      header: 'Rental order',
      cell: (r) => <span className="font-mono text-sm">#{r.rentalOrderId}</span>,
    },
    { id: 'returnDate', header: 'Return date', cell: (r) => formatDate(r.returnDate) },
    { id: 'items', header: 'Items', cell: (r) => r.items.length },
    {
      id: 'lateFee',
      header: 'Late fee',
      hideBelow: 'md',
      cell: (r) => formatCurrency(r.lateFee),
    },
    {
      id: 'damageFee',
      header: 'Damage fee',
      hideBelow: 'md',
      cell: (r) => formatCurrency(r.damageFee),
    },
    {
      id: 'total',
      header: 'Total',
      cell: (r) => <span className="font-medium">{formatCurrency(r.totalAmount)}</span>,
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Return transactions"
        description="Record and review item returns against rental orders."
        actions={
          <Button onClick={openNew}>
            <Plus className="size-4" />
            New return
          </Button>
        }
      />

      <ListToolbar
        search={pagination.search}
        onSearchChange={pagination.setSearch}
        searchPlaceholder="Search returns…"
        filters={
          <Input
            value={pagination.filters.rentalOrderId ?? ''}
            onChange={(e) => pagination.setFilter('rentalOrderId', e.target.value || undefined)}
            placeholder="Filter by rental order id"
            aria-label="Filter by rental order id"
            className="w-full sm:w-56"
          />
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
        onRowClick={openDetail}
        emptyTitle="No returns yet"
        emptyDescription="Record your first return to get started."
        emptyAction={
          <Button onClick={openNew} size="sm">
            <Plus className="size-4" />
            New return
          </Button>
        }
        mobileCard={(r) => (
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="font-medium">#{r.id}</span>
              <span className="font-medium">{formatCurrency(r.totalAmount)}</span>
            </div>
            <div className="text-muted-foreground flex items-center justify-between">
              <span>Order #{r.rentalOrderId}</span>
              <span>{formatDate(r.returnDate)}</span>
            </div>
            <div className="text-muted-foreground flex items-center justify-between">
              <span>{r.items.length} item(s)</span>
              <span>
                Late {formatCurrency(r.lateFee)} · Damage {formatCurrency(r.damageFee)}
              </span>
            </div>
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
