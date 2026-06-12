'use client';

import { useRouter } from 'next/navigation';
import { ListPageHeader } from '@/components/common/list-page-header';
import { StatusBadge } from '@/components/common/status-badge';
import { DataTableView, type Column } from '@/components/tables/data-table-view';
import { FilterSelect } from '@/components/forms/filter-select';
import { usePagination } from '@/hooks/use-pagination';
import { PAYMENT_CYCLE_META, SUBSCRIPTION_STATUS_META } from '@/constants/enum-labels';
import { formatDate } from '@/lib/format';
import { useT } from '@/i18n/locale-provider';
import { useSubscriptions } from '../use-subscriptions';
import type { Subscription, SubscriptionStatus } from '@/types/billing';

const STATUS_OPTIONS: SubscriptionStatus[] = [
  'ACTIVE',
  'TRIAL',
  'PENDING_PAYMENT',
  'EXPIRED',
  'CANCELLED',
];

export function SubscriptionsPage() {
  const { t } = useT();
  const router = useRouter();
  const pagination = usePagination({ initialPageSize: 10 });
  const list = useSubscriptions(pagination.queryParams);
  const data = list.data;

  const columns: Column<Subscription>[] = [
    {
      id: 'tenant',
      header: t('billing.subscriptions.tenant'),
      className: 'min-w-[14rem]',
      cell: (s) => <span className="font-medium">{s.tenantName || '—'}</span>,
    },
    {
      id: 'package',
      header: t('billing.subscriptions.package'),
      cell: (s) => s.packageName || '—',
    },
    {
      id: 'cycle',
      header: t('billing.subscriptions.cycle'),
      cell: (s) => <StatusBadge meta={PAYMENT_CYCLE_META[s.paymentCycle]} />,
    },
    {
      id: 'startDate',
      header: t('billing.subscriptions.startDate'),
      cell: (s) => formatDate(s.startDate),
    },
    {
      id: 'endDate',
      header: t('billing.subscriptions.endDate'),
      cell: (s) => formatDate(s.endDate),
    },
    {
      id: 'nextBilling',
      header: t('billing.subscriptions.nextBilling'),
      cell: (s) => formatDate(s.nextBillingDate),
    },
    {
      id: 'autoRenew',
      header: t('billing.subscriptions.autoRenew'),
      cell: (s) =>
        typeof s.autoRenew === 'boolean' ? t(s.autoRenew ? 'common.yes' : 'common.no') : '—',
    },
    {
      id: 'status',
      header: t('billing.subscriptions.status'),
      cell: (s) => <StatusBadge meta={SUBSCRIPTION_STATUS_META[s.status]} />,
    },
  ];

  return (
    <div className="space-y-5">
      <ListPageHeader
        title={t('billing.subscriptions.countSummary', {
          count: data?.items.length ?? 0,
          total: data?.total ?? 0,
        })}
        titleClassName="text-base font-semibold sm:text-base"
        search={pagination.search}
        onSearchChange={pagination.setSearch}
        searchPlaceholder={t('billing.subscriptions.searchPlaceholder')}
        filters={
          <FilterSelect
            value={pagination.filters.status}
            onChange={(v) => pagination.setFilter('status', v)}
            ariaLabel={t('billing.subscriptions.status')}
            allLabel={t('common.table.allStatuses')}
            className="bg-card"
            options={STATUS_OPTIONS.map((status) => ({
              value: status,
              label: t(`enums.subscriptionStatus.${status}`),
            }))}
          />
        }
      />

      <DataTableView
        columns={columns}
        rows={data?.items ?? []}
        isLoading={list.isLoading}
        isError={list.isError}
        error={list.error}
        onRetry={() => list.refetch()}
        onRowClick={(s) => router.push(`/billing/subscriptions/${s.id}`)}
        emptyTitle={t('billing.subscriptions.emptyTitle')}
        page={data?.page ?? pagination.page}
        pageSize={data?.pageSize ?? pagination.pageSize}
        total={data?.total ?? 0}
        onPageChange={pagination.setPage}
        onPageSizeChange={pagination.setPageSize}
      />
    </div>
  );
}
