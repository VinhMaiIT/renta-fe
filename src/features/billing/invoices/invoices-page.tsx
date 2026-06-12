'use client';

import { useRouter } from 'next/navigation';
import { ListPageHeader } from '@/components/common/list-page-header';
import { StatusBadge } from '@/components/common/status-badge';
import { DataTableView, type Column } from '@/components/tables/data-table-view';
import { Button } from '@/components/ui/button';
import { FilterSelect } from '@/components/forms/filter-select';
import { usePagination } from '@/hooks/use-pagination';
import { INVOICE_STATUS_META } from '@/constants/enum-labels';
import { formatCurrency, formatDate } from '@/lib/format';
import { useT } from '@/i18n/locale-provider';
import { useInvoices } from '../use-invoices';
import type { Invoice } from '@/types/billing';

export function InvoicesPage() {
  const { t } = useT();
  const router = useRouter();
  const pagination = usePagination();
  const list = useInvoices(pagination.queryParams);
  const data = list.data;

  const overdueOnly = pagination.filters.overdue === 'true';

  const columns: Column<Invoice>[] = [
    {
      id: 'code',
      header: t('billing.invoices.code'),
      cell: (i) => <span className="font-mono text-xs">{i.code}</span>,
    },
    {
      id: 'tenant',
      header: t('billing.invoices.tenant'),
      cell: (i) => <span className="font-medium">{i.tenantName}</span>,
    },
    {
      id: 'package',
      header: t('billing.invoices.package'),
      hideBelow: 'lg',
      cell: (i) => i.packageName,
    },
    {
      id: 'amount',
      header: t('billing.invoices.amount'),
      cell: (i) => formatCurrency(i.amount),
    },
    {
      id: 'dueDate',
      header: t('billing.invoices.dueDate'),
      hideBelow: 'sm',
      cell: (i) => formatDate(i.dueDate),
    },
    {
      id: 'paidDate',
      header: t('billing.invoices.paidDate'),
      hideBelow: 'md',
      cell: (i) => (i.paidDate ? formatDate(i.paidDate) : '—'),
    },
    {
      id: 'status',
      header: t('billing.invoices.status'),
      cell: (i) => <StatusBadge meta={INVOICE_STATUS_META[i.status]} />,
    },
  ];

  return (
    <div className="space-y-5">
      <ListPageHeader
        title={t('billing.invoices.title')}
        description={t('billing.invoices.subtitle')}
        search={pagination.search}
        onSearchChange={pagination.setSearch}
        searchPlaceholder={t('billing.invoices.searchPlaceholder')}
        filters={
          <>
            <FilterSelect
              value={pagination.filters.status}
              onChange={(v) => pagination.setFilter('status', v)}
              ariaLabel={t('billing.invoices.status')}
              allLabel={t('billing.invoices.allStatuses')}
              className="bg-card"
              options={[
                { value: 'PENDING', label: t('enums.invoiceStatus.PENDING') },
                { value: 'PAID', label: t('enums.invoiceStatus.PAID') },
                { value: 'OVERDUE', label: t('enums.invoiceStatus.OVERDUE') },
                { value: 'CANCELLED', label: t('enums.invoiceStatus.CANCELLED') },
              ]}
            />
            <Button
              variant={overdueOnly ? 'default' : 'outline'}
              onClick={() => pagination.setFilter('overdue', overdueOnly ? undefined : 'true')}
            >
              {t('billing.invoices.overdueOnly')}
            </Button>
          </>
        }
      />

      <DataTableView
        columns={columns}
        rows={data?.items ?? []}
        isLoading={list.isLoading}
        isError={list.isError}
        error={list.error}
        onRetry={() => list.refetch()}
        emptyTitle={t('billing.invoices.emptyTitle')}
        onRowClick={(i) => router.push(`/billing/invoices/${i.id}`)}
        page={data?.page ?? pagination.page}
        pageSize={data?.pageSize ?? pagination.pageSize}
        total={data?.total ?? 0}
        onPageChange={pagination.setPage}
        onPageSizeChange={pagination.setPageSize}
      />
    </div>
  );
}
