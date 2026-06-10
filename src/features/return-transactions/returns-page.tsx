'use client';

import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { ListPageHeader } from '@/components/common/list-page-header';
import { DataTableView, type Column } from '@/components/tables/data-table-view';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePagination } from '@/hooks/use-pagination';
import { formatCurrency, formatDate } from '@/lib/format';
import { useT } from '@/i18n/locale-provider';
import { useReturnTransactions } from './use-returns';
import type { ReturnTransaction } from '@/types/models';

export function ReturnsPage() {
  const router = useRouter();
  const { t } = useT();
  const pagination = usePagination();
  const list = useReturnTransactions(pagination.queryParams);

  const data = list.data;

  const openNew = () => router.push('/return-transactions/new');
  const openDetail = (row: ReturnTransaction) => router.push(`/return-transactions/${row.id}`);

  const columns: Column<ReturnTransaction>[] = [
    {
      id: 'code',
      header: t('returns.list.returnCol'),
      cell: (r) => <span className="font-medium">#{r.id}</span>,
    },
    {
      id: 'rentalOrderId',
      header: t('returns.list.rentalOrder'),
      cell: (r) => <span className="font-mono text-sm">#{r.rentalOrderId}</span>,
    },
    { id: 'returnDate', header: t('returns.list.returnDate'), cell: (r) => formatDate(r.returnDate) },
    { id: 'items', header: t('returns.list.items'), cell: (r) => r.items.length },
    {
      id: 'lateFee',
      header: t('returns.list.lateFee'),
      hideBelow: 'md',
      cell: (r) => formatCurrency(r.lateFee),
    },
    {
      id: 'damageFee',
      header: t('returns.list.damageFee'),
      hideBelow: 'md',
      cell: (r) => formatCurrency(r.damageFee),
    },
    {
      id: 'total',
      header: t('returns.list.total'),
      cell: (r) => <span className="font-medium">{formatCurrency(r.totalAmount)}</span>,
    },
  ];

  return (
    <div className="space-y-5">
      <ListPageHeader
        title={t('returns.list.title')}
        description={t('returns.list.subtitle')}
        search={pagination.search}
        onSearchChange={pagination.setSearch}
        searchPlaceholder={t('returns.list.searchPlaceholder')}
        filters={
          <Input
            value={pagination.filters.rentalOrderId ?? ''}
            onChange={(e) => pagination.setFilter('rentalOrderId', e.target.value || undefined)}
            placeholder={t('returns.list.filterByOrder')}
            aria-label={t('returns.list.filterByOrder')}
            className="bg-card w-full sm:w-56"
          />
        }
        actions={
          <Button onClick={openNew}>
            <Plus className="size-4" />
            {t('returns.list.newReturn')}
          </Button>
        }
      />

      <DataTableView
        columns={columns}
        rows={data?.items ?? []}
        isLoading={list.isLoading}
        isError={list.isError}
        error={list.error}
        onRetry={() => list.refetch()}
        onRowClick={openDetail}
        emptyTitle={t('returns.list.emptyTitle')}
        page={data?.page ?? pagination.page}
        pageSize={data?.pageSize ?? pagination.pageSize}
        total={data?.total ?? 0}
        onPageChange={pagination.setPage}
        onPageSizeChange={pagination.setPageSize}
      />
    </div>
  );
}
