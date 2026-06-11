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
import { formatDate } from '@/lib/format';
import { useT } from '@/i18n/locale-provider';
import { useMasterData } from './use-master-data';
import { MasterDataForm } from './master-data-form';
import type { MasterRecord, MasterResource } from './api';

/** Maps a resource path to its i18n namespace key under `masterData.*`. */
const NS_KEY: Record<MasterResource, string> = {
  sizes: 'sizes',
  units: 'units',
  'product-types': 'productTypes',
  'product-groups': 'productGroups',
};

export function MasterDataPage({ resource }: { resource: MasterResource }) {
  const { t } = useT();
  const ns = NS_KEY[resource];
  const title = t(`masterData.${ns}.title`);
  const singular = t(`masterData.${ns}.singular`);

  const { useList, useCreate, useUpdate, useRemove, useSetStatus } = useMasterData(resource);
  const pagination = usePagination({ initialPageSize: 10 });
  const list = useList(pagination.queryParams);
  const create = useCreate();
  const update = useUpdate();
  const remove = useRemove();
  const setStatus = useSetStatus();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<MasterRecord | null>(null);
  const [deleting, setDeleting] = useState<MasterRecord | null>(null);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (record: MasterRecord) => {
    setEditing(record);
    setFormOpen(true);
  };

  const data = list.data;
  const saving = create.isPending || update.isPending;

  const columns: Column<MasterRecord>[] = [
    {
      id: 'name',
      header: t('common.table.name'),
      cell: (r) => <span className="font-medium">{r.name}</span>,
    },
    {
      id: 'status',
      header: t('common.table.status'),
      cell: (r) => <StatusBadge meta={ACTIVE_STATUS_META[r.status]} />,
    },
    {
      id: 'updatedAt',
      header: t('common.table.updated'),
      hideBelow: 'md',
      cell: (r) => formatDate(r.updatedAt),
    },
    {
      id: 'actions',
      header: '',
      headerClassName: 'w-10',
      cell: (r) => <RowActions record={r} />,
    },
  ];

  function RowActions({ record }: { record: MasterRecord }) {
    const nextStatus = record.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
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
          <DropdownMenuItem onClick={() => openEdit(record)}>
            {t('common.action.edit')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setStatus.mutate({ id: record.id, status: nextStatus })}>
            {record.status === 'ACTIVE' ? t('masterData.deactivate') : t('masterData.activate')}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive" onClick={() => setDeleting(record)}>
            {t('common.action.delete')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="space-y-5">
      <ListPageHeader
        title={t('masterData.countSummary', {
          count: data?.items.length ?? 0,
          total: data?.total ?? 0,
        })}
        titleClassName="text-base font-semibold sm:text-base"
        search={pagination.search}
        onSearchChange={pagination.setSearch}
        searchPlaceholder={t('masterData.searchPlaceholder', { items: title.toLowerCase() })}
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
            {t('masterData.newItem', { item: singular })}
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
        emptyTitle={t('masterData.emptyTitle', { items: title.toLowerCase() })}
        page={data?.page ?? pagination.page}
        pageSize={data?.pageSize ?? pagination.pageSize}
        total={data?.total ?? 0}
        onPageChange={pagination.setPage}
        onPageSizeChange={pagination.setPageSize}
      />

      <MasterDataForm
        open={formOpen}
        onOpenChange={setFormOpen}
        singular={singular}
        initial={editing}
        loading={saving}
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
        title={t('common.confirm.deleteTitle', { item: singular })}
        description={deleting ? t('masterData.deleteDesc', { name: deleting.name }) : null}
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
