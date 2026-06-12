'use client';

import { useRouter } from 'next/navigation';
import { MoreHorizontal } from 'lucide-react';
import { ListPageHeader } from '@/components/common/list-page-header';
import { StatusBadge } from '@/components/common/status-badge';
import { DataTableView, type Column } from '@/components/tables/data-table-view';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FilterSelect } from '@/components/forms/filter-select';
import { usePagination } from '@/hooks/use-pagination';
import { ACTIVE_STATUS_META } from '@/constants/enum-labels';
import { useT } from '@/i18n/locale-provider';
import { useTenants, useSetTenantStatus } from './use-tenants';
import type { Tenant } from '@/types/models';

export function TenantsPage() {
  const { t } = useT();
  const router = useRouter();
  const pagination = usePagination({ initialPageSize: 10 });
  const list = useTenants(pagination.queryParams);
  const setStatus = useSetTenantStatus();
  const data = list.data;

  const columns: Column<Tenant>[] = [
    {
      id: 'code',
      header: t('tenants.code'),
      className: 'w-28',
      cell: (r) => <span className="font-mono text-xs">{r.code}</span>,
    },
    {
      id: 'name',
      header: t('common.table.name'),
      className: 'min-w-[18rem] whitespace-normal',
      cell: (r) => <span className="font-medium">{r.name}</span>,
    },
    {
      id: 'phone',
      header: t('tenants.phone'),
      hideBelow: 'md',
      className: 'w-36',
      cell: (r) => r.phone ?? '—',
    },
    {
      id: 'email',
      header: t('tenants.email'),
      hideBelow: 'lg',
      className: 'w-56',
      cell: (r) => r.email ?? '—',
    },
    {
      id: 'branchCount',
      header: t('tenants.branchCount'),
      hideBelow: 'md',
      className: 'w-28 text-center',
      cell: (r) => r.branchCount ?? '—',
    },
    {
      id: 'package',
      header: t('tenants.package'),
      hideBelow: 'sm',
      className: 'w-44',
      cell: (r) => r.subscription?.packageName ?? '—',
    },
    {
      id: 'status',
      header: t('common.table.status'),
      className: 'w-28',
      cell: (r) => <StatusBadge meta={ACTIVE_STATUS_META[r.status]} />,
    },
    {
      id: 'actions',
      header: '',
      headerClassName: 'w-10 text-right',
      className: 'text-right',
      cell: (r) => {
        const next = r.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        return (
          // Stop row navigation from firing when interacting with the menu.
          <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="ghost" size="icon-sm" aria-label={t('common.table.actions')}>
                    <MoreHorizontal className="size-4" />
                  </Button>
                }
              />
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setStatus.mutate({ id: r.id, status: next })}>
                  {r.status === 'ACTIVE' ? t('masterData.deactivate') : t('masterData.activate')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-5">
      <ListPageHeader
        title={t('tenants.countSummary', {
          count: data?.items.length ?? 0,
          total: data?.total ?? 0,
        })}
        titleClassName="text-base font-semibold sm:text-base"
        search={pagination.search}
        onSearchChange={pagination.setSearch}
        searchPlaceholder={t('tenants.searchPlaceholder')}
        filters={
          <FilterSelect
            value={pagination.filters.status}
            onChange={(v) => pagination.setFilter('status', v)}
            ariaLabel={t('common.table.status')}
            allLabel={t('common.table.allStatuses')}
            className="bg-card"
            options={[
              { value: 'ACTIVE', label: t('enums.activeStatus.ACTIVE') },
              { value: 'INACTIVE', label: t('enums.activeStatus.INACTIVE') },
            ]}
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
        onRowClick={(r) => router.push(`/tenants/${r.id}`)}
        emptyTitle={t('tenants.emptyTitle')}
        page={data?.page ?? pagination.page}
        pageSize={data?.pageSize ?? pagination.pageSize}
        total={data?.total ?? 0}
        onPageChange={pagination.setPage}
        onPageSizeChange={pagination.setPageSize}
      />
    </div>
  );
}
