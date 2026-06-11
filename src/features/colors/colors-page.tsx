'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { ListPageHeader } from '@/components/common/list-page-header';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { StatusBadge } from '@/components/common/status-badge';
import { RowActions } from '@/components/common/row-actions';
import { DataTableView, type Column } from '@/components/tables/data-table-view';
import { Button } from '@/components/ui/button';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { usePagination } from '@/hooks/use-pagination';
import { ACTIVE_STATUS_META } from '@/constants/enum-labels';
import { formatDate } from '@/lib/format';
import { useT } from '@/i18n/locale-provider';
import {
  useColors,
  useCreateColor,
  useUpdateColor,
  useDeleteColor,
  useSetColorStatus,
} from './use-colors';
import { ColorForm } from './color-form';
import type { Color } from '@/types/models';

export function ColorsPage() {
  const { t } = useT();
  const pagination = usePagination({ initialPageSize: 10 });
  const list = useColors(pagination.queryParams);
  const create = useCreateColor();
  const update = useUpdateColor();
  const remove = useDeleteColor();
  const setStatus = useSetColorStatus();
  const data = list.data;

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Color | null>(null);
  const [deleting, setDeleting] = useState<Color | null>(null);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (color: Color) => {
    setEditing(color);
    setFormOpen(true);
  };

  const columns: Column<Color>[] = [
    {
      id: 'name',
      header: t('common.table.name'),
      cell: (r) => (
        <span className="flex items-center gap-3 font-medium">
          <span
            className="border-border size-8 shrink-0 rounded-md border"
            style={{ backgroundColor: r.hex }}
          />
          {r.name}
        </span>
      ),
    },
    {
      id: 'hex',
      header: t('colors.hex'),
      cell: (r) => <span className="font-mono text-xs">{r.hex}</span>,
    },
    {
      id: 'status',
      header: t('common.table.status'),
      cell: (r) => <StatusBadge meta={ACTIVE_STATUS_META[r.status]} />,
    },
    {
      id: 'updatedAt',
      header: t('common.table.updated'),
      hideBelow: 'lg',
      cell: (r) => formatDate(r.updatedAt),
    },
    {
      id: 'actions',
      header: '',
      headerClassName: 'text-right',
      className: 'text-right',
      cell: (r) => (
        <RowActions
          onEdit={() => openEdit(r)}
          onToggleStatus={() =>
            setStatus.mutate({ id: r.id, status: r.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' })
          }
          isActive={r.status === 'ACTIVE'}
          onDelete={() => setDeleting(r)}
        />
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <ListPageHeader
        title={t('colors.countSummary', {
          count: data?.items.length ?? 0,
          total: data?.total ?? 0,
        })}
        titleClassName="text-base font-semibold sm:text-base"
        search={pagination.search}
        onSearchChange={pagination.setSearch}
        searchPlaceholder={t('colors.searchPlaceholder')}
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
            {t('colors.newColor')}
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
        emptyTitle={t('colors.emptyTitle')}
        page={data?.page ?? pagination.page}
        pageSize={data?.pageSize ?? pagination.pageSize}
        total={data?.total ?? 0}
        onPageChange={pagination.setPage}
        onPageSizeChange={pagination.setPageSize}
      />

      <ColorForm
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
        title={t('common.confirm.deleteTitle', { item: t('colors.title').toLowerCase() })}
        description={deleting ? t('colors.deleteDesc', { name: deleting.name }) : null}
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
