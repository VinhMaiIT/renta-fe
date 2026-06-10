'use client';

import { useState } from 'react';
import { MoreHorizontal, Plus } from 'lucide-react';
import { ListPageHeader } from '@/components/common/list-page-header';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { StatusBadge } from '@/components/common/status-badge';
import { DataTableView, type Column } from '@/components/tables/data-table-view';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { usePagination } from '@/hooks/use-pagination';
import { ACTIVE_STATUS_META } from '@/constants/enum-labels';
import { formatCurrency } from '@/lib/format';
import { useT } from '@/i18n/locale-provider';
import { usePackages, usePackageMutations } from '../use-packages';
import { PackageForm } from './package-form';
import type { Package } from '@/types/billing';

export function PackagesPage() {
  const { t } = useT();
  const pagination = usePagination();
  const list = usePackages(pagination.queryParams);
  const { create, update, remove, setStatus } = usePackageMutations();
  const data = list.data;

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Package | null>(null);
  const [deleting, setDeleting] = useState<Package | null>(null);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (pkg: Package) => {
    setEditing(pkg);
    setFormOpen(true);
  };

  const columns: Column<Package>[] = [
    { id: 'code', header: t('billing.packages.code'), cell: (p) => <span className="font-mono text-xs">{p.code}</span> },
    { id: 'name', header: t('billing.packages.name'), cell: (p) => <span className="font-medium">{p.name}</span> },
    {
      id: 'priceMonthly',
      header: t('billing.packages.priceMonthly'),
      hideBelow: 'sm',
      cell: (p) => formatCurrency(p.priceMonthly),
    },
    {
      id: 'priceYearly',
      header: t('billing.packages.priceYearly'),
      hideBelow: 'md',
      cell: (p) => formatCurrency(p.priceYearly),
    },
    {
      id: 'limits',
      header: t('billing.packages.limits'),
      hideBelow: 'lg',
      cell: (p) => (
        <span className="text-muted-foreground text-xs">
          {p.maxBranches}b · {p.maxUsers}u · {p.maxProducts}p
        </span>
      ),
    },
    {
      id: 'status',
      header: t('common.table.status'),
      cell: (p) => <StatusBadge meta={ACTIVE_STATUS_META[p.status]} />,
    },
    {
      id: 'actions',
      header: '',
      headerClassName: 'w-10 text-right',
      className: 'text-right',
      cell: (p) => {
        const next = p.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        return (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon-sm" aria-label={t('common.table.actions')}>
                  <MoreHorizontal className="size-4" />
                </Button>
              }
            />
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => openEdit(p)}>
                {t('common.action.edit')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatus.mutate({ id: p.id, status: next })}>
                {p.status === 'ACTIVE' ? t('masterData.deactivate') : t('masterData.activate')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={() => setDeleting(p)}>
                {t('common.action.delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="space-y-5">
      <ListPageHeader
        title={t('billing.packages.title')}
        description={t('billing.packages.subtitle')}
        search={pagination.search}
        onSearchChange={pagination.setSearch}
        searchPlaceholder={t('billing.packages.searchPlaceholder')}
        filters={
          <NativeSelect
            value={pagination.filters.status ?? ''}
            onChange={(e) => pagination.setFilter('status', e.target.value || undefined)}
            aria-label={t('common.table.status')}
            className="bg-card"
          >
            <NativeSelectOption value="">{t('common.table.allStatuses')}</NativeSelectOption>
            <NativeSelectOption value="ACTIVE">{t('enums.activeStatus.ACTIVE')}</NativeSelectOption>
            <NativeSelectOption value="INACTIVE">{t('enums.activeStatus.INACTIVE')}</NativeSelectOption>
          </NativeSelect>
        }
        actions={
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            {t('billing.packages.newPackage')}
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
        emptyTitle={t('billing.packages.emptyTitle')}
        page={data?.page ?? pagination.page}
        pageSize={data?.pageSize ?? pagination.pageSize}
        total={data?.total ?? 0}
        onPageChange={pagination.setPage}
        onPageSizeChange={pagination.setPageSize}
      />

      <PackageForm
        open={formOpen}
        onOpenChange={setFormOpen}
        initial={editing}
        loading={create.isPending || update.isPending}
        onSubmit={(input) => {
          if (editing) {
            update.mutate({ id: editing.id, input }, { onSuccess: () => setFormOpen(false) });
          } else {
            create.mutate(input, { onSuccess: () => setFormOpen(false) });
          }
        }}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={t('common.confirm.deleteTitle', { item: deleting?.name ?? '' })}
        description={deleting ? t('billing.packages.deleteDesc', { name: deleting.name }) : null}
        destructive
        confirmText={t('common.action.delete')}
        loading={remove.isPending}
        onConfirm={() => {
          if (!deleting) return;
          remove.mutate(deleting.id, { onSuccess: () => setDeleting(null) });
        }}
      />
    </div>
  );
}
