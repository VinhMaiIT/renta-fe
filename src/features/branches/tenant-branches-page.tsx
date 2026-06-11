'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { ListPageHeader } from '@/components/common/list-page-header';
import { StatusBadge } from '@/components/common/status-badge';
import { RowActions } from '@/components/common/row-actions';
import { DataTableView, type Column } from '@/components/tables/data-table-view';
import { Button } from '@/components/ui/button';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { usePagination } from '@/hooks/use-pagination';
import { ACTIVE_STATUS_META } from '@/constants/enum-labels';
import { useT } from '@/i18n/locale-provider';
import { useTenantBranchList, useTenantBranchMutations } from './use-tenant-branches';
import { BranchForm } from './branch-form';
import type { BranchFormInput } from './use-branches-admin';
import type { Branch } from '@/types/models';

export function TenantBranchesPage() {
  const { t } = useT();
  const pagination = usePagination({ initialPageSize: 10 });
  const list = useTenantBranchList(pagination.queryParams);
  const { create, update, setStatus, setMain } = useTenantBranchMutations();
  const data = list.data;

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Branch | null>(null);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (branch: Branch) => {
    setEditing(branch);
    setFormOpen(true);
  };

  const handleSubmit = (input: BranchFormInput) => {
    if (editing) {
      update.mutate({ id: editing.id, input }, { onSuccess: () => setFormOpen(false) });
    } else {
      create.mutate(input, { onSuccess: () => setFormOpen(false) });
    }
  };

  const columns: Column<Branch>[] = [
    {
      id: 'code',
      header: t('branches.code'),
      className: 'w-28',
      cell: (r) => <span className="font-mono text-xs">{r.code}</span>,
    },
    {
      id: 'name',
      header: t('common.table.name'),
      className: 'min-w-[16rem] whitespace-normal',
      cell: (r) => (
        <span className="flex items-center gap-2 font-medium">
          {r.name}
          {r.isMain ? (
            <span className="bg-primary/15 text-primary rounded-full px-2 py-0.5 text-xs font-medium">
              {t('branches.main')}
            </span>
          ) : null}
        </span>
      ),
    },
    {
      id: 'phone',
      header: t('branches.phone'),
      hideBelow: 'md',
      className: 'w-36',
      cell: (r) => r.phone ?? '—',
    },
    {
      id: 'address',
      header: t('branches.address'),
      hideBelow: 'lg',
      cell: (r) => r.address ?? '—',
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
      cell: (r) => (
        <RowActions
          onEdit={() => openEdit(r)}
          onSetMain={r.isMain ? undefined : () => setMain.mutate(r.id)}
          onToggleStatus={() =>
            setStatus.mutate({ id: r.id, status: r.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' })
          }
          isActive={r.status === 'ACTIVE'}
        />
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <ListPageHeader
        title={t('branches.countSummary', {
          count: data?.items.length ?? 0,
          total: data?.total ?? 0,
        })}
        titleClassName="text-base font-semibold sm:text-base"
        search={pagination.search}
        onSearchChange={pagination.setSearch}
        searchPlaceholder={t('branches.searchPlaceholder')}
        filters={
          <NativeSelect
            value={pagination.filters.status ?? ''}
            onChange={(e) => pagination.setFilter('status', e.target.value || undefined)}
            aria-label={t('common.table.status')}
            className="bg-card"
          >
            <NativeSelectOption value="">{t('common.table.allStatuses')}</NativeSelectOption>
            <NativeSelectOption value="ACTIVE">{t('enums.activeStatus.ACTIVE')}</NativeSelectOption>
            <NativeSelectOption value="INACTIVE">
              {t('enums.activeStatus.INACTIVE')}
            </NativeSelectOption>
          </NativeSelect>
        }
        actions={
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            {t('branches.newBranch')}
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
        emptyTitle={t('branches.emptyTitleTenant')}
        page={data?.page ?? pagination.page}
        pageSize={data?.pageSize ?? pagination.pageSize}
        total={data?.total ?? 0}
        onPageChange={pagination.setPage}
        onPageSizeChange={pagination.setPageSize}
      />

      <BranchForm
        open={formOpen}
        onOpenChange={setFormOpen}
        initial={editing}
        loading={create.isPending || update.isPending}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
