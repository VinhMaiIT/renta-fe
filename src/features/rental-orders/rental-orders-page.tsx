'use client';

import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { ListPageHeader } from '@/components/common/list-page-header';
import { StatusBadge } from '@/components/common/status-badge';
import { DataTableView, type Column } from '@/components/tables/data-table-view';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FilterSelect } from '@/components/forms/filter-select';
import { usePagination } from '@/hooks/use-pagination';
import { useEnumOptions } from '@/hooks/use-enum-options';
import { RENTAL_ORDER_STATUS_META } from '@/constants/enum-labels';
import { formatCurrency, formatDate } from '@/lib/format';
import { useT } from '@/i18n/locale-provider';
import type { RentalOrder } from '@/types/models';
import { useRentalOrders } from './use-rental-orders';

export function RentalOrdersPage() {
  const { t } = useT();
  const router = useRouter();
  const pagination = usePagination();
  const list = useRentalOrders(pagination.queryParams);
  const data = list.data;
  const statusOptions = useEnumOptions(RENTAL_ORDER_STATUS_META);

  const goToOrder = (id: string) => router.push(`/rental-orders/${id}`);

  const columns: Column<RentalOrder>[] = [
    {
      id: 'orderCode',
      header: t('rentalOrders.list.orderCode'),
      cell: (r) => <span className="font-medium">{r.orderCode}</span>,
    },
    {
      id: 'status',
      header: t('rentalOrders.list.status'),
      cell: (r) => <StatusBadge meta={RENTAL_ORDER_STATUS_META[r.status]} />,
    },
    { id: 'rentDate', header: t('rentalOrders.list.rentDate'), cell: (r) => formatDate(r.rentDate) },
    {
      id: 'expectedReturnDate',
      header: t('rentalOrders.list.expectedReturn'),
      hideBelow: 'md',
      cell: (r) => formatDate(r.expectedReturnDate),
    },
    { id: 'items', header: t('rentalOrders.list.items'), cell: (r) => r.items.length },
    {
      id: 'total',
      header: t('rentalOrders.list.total'),
      hideBelow: 'sm',
      cell: (r) => formatCurrency(r.totalAmount),
    },
  ];

  return (
    <div className="space-y-5">
      <ListPageHeader
        title={t('rentalOrders.list.title')}
        description={t('rentalOrders.list.subtitle')}
        search={pagination.search}
        onSearchChange={pagination.setSearch}
        searchPlaceholder={t('rentalOrders.list.searchPlaceholder')}
        filters={
          <>
            <FilterSelect
              className="bg-card"
              value={pagination.filters.status}
              onChange={(v) => pagination.setFilter('status', v)}
              ariaLabel={t('rentalOrders.list.status')}
              allLabel={t('rentalOrders.list.allStatuses')}
              options={statusOptions}
            />
            <Input
              className="w-full sm:w-48 bg-card"
              placeholder={t('rentalOrders.list.customerIdPlaceholder')}
              value={pagination.filters.customerId ?? ''}
              onChange={(e) => pagination.setFilter('customerId', e.target.value || undefined)}
              aria-label={t('rentalOrders.list.customerIdPlaceholder')}
            />
          </>
        }
        actions={
          <Button onClick={() => router.push('/rental-orders/new')}>
            <Plus className="size-4" />
            {t('rentalOrders.list.newOrder')}
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
        onRowClick={(r) => goToOrder(r.id)}
        emptyTitle={t('rentalOrders.list.emptyTitle')}
        page={data?.page ?? pagination.page}
        pageSize={data?.pageSize ?? pagination.pageSize}
        total={data?.total ?? 0}
        onPageChange={pagination.setPage}
        onPageSizeChange={pagination.setPageSize}
      />
    </div>
  );
}
