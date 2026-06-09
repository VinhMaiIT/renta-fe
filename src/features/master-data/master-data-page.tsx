'use client';

import { useState } from 'react';
import { MoreHorizontal, Plus } from 'lucide-react';
import { PageHeader } from '@/components/common/page-header';
import { ListToolbar } from '@/components/common/list-toolbar';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { StatusBadge } from '@/components/common/status-badge';
import { ListView, type Column } from '@/components/tables/list-view';
import { PaginationBar } from '@/components/tables/pagination-bar';
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
import { useMasterData } from './use-master-data';
import { MasterDataForm } from './master-data-form';
import type { MasterRecord, MasterResource } from './api';

interface MasterDataPageProps {
  resource: MasterResource;
  title: string;
  description: string;
  singular: string;
}

export function MasterDataPage({ resource, title, description, singular }: MasterDataPageProps) {
  const { useList, useCreate, useUpdate, useRemove, useSetStatus } = useMasterData(
    resource,
    singular,
  );
  const pagination = usePagination();
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
    { id: 'name', header: 'Name', cell: (r) => <span className="font-medium">{r.name}</span> },
    { id: 'order', header: 'Order', hideBelow: 'sm', cell: (r) => r.order },
    {
      id: 'status',
      header: 'Status',
      cell: (r) => <StatusBadge meta={ACTIVE_STATUS_META[r.status]} />,
    },
    {
      id: 'updatedAt',
      header: 'Updated',
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
            <Button variant="ghost" size="icon-sm" aria-label="Actions">
              <MoreHorizontal className="size-4" />
            </Button>
          }
        />
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => openEdit(record)}>Edit</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setStatus.mutate({ id: record.id, status: nextStatus })}>
            {record.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive" onClick={() => setDeleting(record)}>
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title={title}
        description={description}
        actions={
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            New {singular.toLowerCase()}
          </Button>
        }
      />

      <ListToolbar
        search={pagination.search}
        onSearchChange={pagination.setSearch}
        searchPlaceholder={`Search ${title.toLowerCase()}…`}
        filters={
          <NativeSelect
            value={pagination.filters.status ?? ''}
            onChange={(e) => pagination.setFilter('status', e.target.value || undefined)}
            aria-label="Status filter"
          >
            <NativeSelectOption value="">All statuses</NativeSelectOption>
            <NativeSelectOption value="ACTIVE">Active</NativeSelectOption>
            <NativeSelectOption value="INACTIVE">Inactive</NativeSelectOption>
          </NativeSelect>
        }
      />

      <ListView
        columns={columns}
        rows={data?.items ?? []}
        getRowId={(r) => r.id}
        isLoading={list.isLoading}
        isError={list.isError}
        error={list.error}
        onRetry={() => list.refetch()}
        emptyTitle={`No ${title.toLowerCase()} yet`}
        emptyDescription={`Create your first ${singular.toLowerCase()} to get started.`}
        emptyAction={
          <Button onClick={openCreate} size="sm">
            <Plus className="size-4" />
            New {singular.toLowerCase()}
          </Button>
        }
      />

      {data ? (
        <PaginationBar
          page={data.page}
          pageSize={data.pageSize}
          total={data.total}
          totalPages={data.totalPages}
          onPageChange={pagination.setPage}
          onPageSizeChange={pagination.setPageSize}
        />
      ) : null}

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
        title={`Delete ${singular.toLowerCase()}?`}
        description={
          deleting ? (
            <>
              <strong>{deleting.name}</strong> will be permanently removed. This cannot be undone.
            </>
          ) : null
        }
        destructive
        confirmText="Delete"
        loading={remove.isPending}
        onConfirm={() => {
          if (!deleting) return;
          remove.mutate(deleting.id, { onSuccess: () => setDeleting(null) });
        }}
      />
    </div>
  );
}
