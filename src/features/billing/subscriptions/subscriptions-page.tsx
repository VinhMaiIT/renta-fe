'use client';

import { useRouter } from 'next/navigation';
import { ListPageHeader } from '@/components/common/list-page-header';
import { StatusBadge } from '@/components/common/status-badge';
import { DataTableView, type Column } from '@/components/tables/data-table-view';
import { Button } from '@/components/ui/button';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { usePagination } from '@/hooks/use-pagination';
import { PAYMENT_CYCLE_META, SUBSCRIPTION_STATUS_META } from '@/constants/enum-labels';
import { formatDate } from '@/lib/format';
import { useT } from '@/i18n/locale-provider';
import { useSubscriptions, useBillingLookups } from '../use-subscriptions';
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
  const pagination = usePagination();
  const list = useSubscriptions(pagination.queryParams);
  const { tenants, packages } = useBillingLookups();
  const data = list.data;

  const expiringSoon = pagination.filters.expiringSoon === 'true';

  const columns: Column<Subscription>[] = [
    {
      id: 'tenant',
      header: t('billing.subscriptions.tenant'),
      cell: (s) => <span className="font-medium">{s.tenantName}</span>,
    },
    {
      id: 'package',
      header: t('billing.subscriptions.package'),
      cell: (s) => s.packageName,
    },
    {
      id: 'cycle',
      header: t('billing.subscriptions.cycle'),
      cell: (s) => <StatusBadge meta={PAYMENT_CYCLE_META[s.paymentCycle]} />,
    },
    {
      id: 'startDate',
      header: t('billing.subscriptions.startDate'),
      hideBelow: 'md',
      cell: (s) => formatDate(s.startDate),
    },
    {
      id: 'endDate',
      header: t('billing.subscriptions.endDate'),
      hideBelow: 'sm',
      cell: (s) => formatDate(s.endDate),
    },
    {
      id: 'nextBilling',
      header: t('billing.subscriptions.nextBilling'),
      hideBelow: 'lg',
      cell: (s) => formatDate(s.nextBillingDate),
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
        title={t('billing.subscriptions.title')}
        description={t('billing.subscriptions.subtitle')}
        search={pagination.search}
        onSearchChange={pagination.setSearch}
        searchPlaceholder={t('billing.subscriptions.searchPlaceholder')}
        filters={
          <>
            <NativeSelect
              value={pagination.filters.tenantId ?? ''}
              onChange={(e) => pagination.setFilter('tenantId', e.target.value || undefined)}
              aria-label={t('billing.subscriptions.tenant')}
              className="bg-card"
            >
              <NativeSelectOption value="">
                {t('billing.subscriptions.allTenants')}
              </NativeSelectOption>
              {tenants.map((tenant) => (
                <NativeSelectOption key={tenant.id} value={tenant.id}>
                  {tenant.name}
                </NativeSelectOption>
              ))}
            </NativeSelect>

            <NativeSelect
              value={pagination.filters.packageId ?? ''}
              onChange={(e) => pagination.setFilter('packageId', e.target.value || undefined)}
              aria-label={t('billing.subscriptions.package')}
              className="bg-card"
            >
              <NativeSelectOption value="">
                {t('billing.subscriptions.allPackages')}
              </NativeSelectOption>
              {packages.map((pkg) => (
                <NativeSelectOption key={pkg.id} value={pkg.id}>
                  {pkg.name}
                </NativeSelectOption>
              ))}
            </NativeSelect>

            <NativeSelect
              value={pagination.filters.status ?? ''}
              onChange={(e) => pagination.setFilter('status', e.target.value || undefined)}
              aria-label={t('billing.subscriptions.status')}
              className="bg-card"
            >
              <NativeSelectOption value="">{t('common.table.allStatuses')}</NativeSelectOption>
              {STATUS_OPTIONS.map((status) => (
                <NativeSelectOption key={status} value={status}>
                  {t(`enums.subscriptionStatus.${status}`)}
                </NativeSelectOption>
              ))}
            </NativeSelect>

            <Button
              variant={expiringSoon ? 'secondary' : 'outline'}
              onClick={() =>
                pagination.setFilter('expiringSoon', expiringSoon ? undefined : 'true')
              }
            >
              {t('billing.subscriptions.expiringSoon')}
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
