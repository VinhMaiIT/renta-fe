'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { INVENTORY_STATUS_META, CONDITION_STATUS_META, toOptions } from '@/constants/enum-labels';
import type { InventoryItem } from '@/types/models';
import type { InventoryItemStatus } from '@/types/enums';
import {
  useInventoryItems,
  useCreateInventoryItem,
  useDeleteInventoryItem,
  useSetInventoryStatus,
  useInventoryLookups,
} from './use-inventory';
import { InventoryForm } from './inventory-form';
import type { InventoryCreateInput } from './api';

const statusOptions = toOptions(INVENTORY_STATUS_META);
const conditionOptions = toOptions(CONDITION_STATUS_META);

export function InventoryPage() {
  const router = useRouter();
  const pagination = usePagination();

  const { productMap, sizeMap, branchMap, branchOptions, productOptions, sizeOptions } =
    useInventoryLookups();

  const list = useInventoryItems(pagination.queryParams);
  const createMutation = useCreateInventoryItem();
  const deleteMutation = useDeleteInventoryItem();
  const setStatusMutation = useSetInventoryStatus();

  const [formOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState<InventoryItem | null>(null);

  const data = list.data;

  const columns: Column<InventoryItem>[] = [
    {
      id: 'serialCode',
      header: 'Serial',
      primary: true,
      cell: (r) => <span className="font-medium">{r.serialCode}</span>,
    },
    {
      id: 'product',
      header: 'Product',
      cell: (r) => productMap[r.productId] ?? r.productId,
    },
    {
      id: 'size',
      header: 'Size',
      hideBelow: 'md',
      cell: (r) => sizeMap[r.sizeId] ?? r.sizeId,
    },
    {
      id: 'branch',
      header: 'Branch',
      hideBelow: 'lg',
      cell: (r) => branchMap[r.branchId] ?? r.branchId,
    },
    {
      id: 'status',
      header: 'Status',
      cell: (r) => <StatusBadge meta={INVENTORY_STATUS_META[r.status]} />,
    },
    {
      id: 'condition',
      header: 'Condition',
      hideBelow: 'sm',
      cell: (r) => <StatusBadge meta={CONDITION_STATUS_META[r.conditionStatus]} />,
    },
    {
      id: 'actions',
      header: '',
      headerClassName: 'w-10',
      cell: (r) => <RowActions record={r} />,
    },
  ];

  function RowActions({ record }: { record: InventoryItem }) {
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
          <DropdownMenuItem onClick={() => router.push(`/inventory-items/${record.id}`)}>
            View
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {statusOptions.map((opt) => (
            <DropdownMenuItem
              key={opt.value}
              disabled={record.status === opt.value}
              onClick={() =>
                setStatusMutation.mutate({
                  id: record.id,
                  status: opt.value as InventoryItemStatus,
                })
              }
            >
              Set: {opt.label}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive" onClick={() => setDeleting(record)}>
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  function handleCreate(input: Omit<InventoryCreateInput, 'tenantId'>) {
    createMutation.mutate(input, { onSuccess: () => setFormOpen(false) });
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Inventory Items"
        description="Track your rental inventory by serial code and condition."
        actions={
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="size-4" />
            New item
          </Button>
        }
      />

      <ListToolbar
        search={pagination.search}
        onSearchChange={pagination.setSearch}
        searchPlaceholder="Search serial or barcode…"
        filters={
          <>
            <NativeSelect
              value={pagination.filters.branchId ?? ''}
              onChange={(e) => pagination.setFilter('branchId', e.target.value || undefined)}
              aria-label="Branch filter"
            >
              <NativeSelectOption value="">All branches</NativeSelectOption>
              {branchOptions.map((b) => (
                <NativeSelectOption key={b.value} value={b.value}>
                  {b.label}
                </NativeSelectOption>
              ))}
            </NativeSelect>
            <NativeSelect
              value={pagination.filters.productId ?? ''}
              onChange={(e) => pagination.setFilter('productId', e.target.value || undefined)}
              aria-label="Product filter"
            >
              <NativeSelectOption value="">All products</NativeSelectOption>
              {productOptions.map((p) => (
                <NativeSelectOption key={p.value} value={p.value}>
                  {p.label}
                </NativeSelectOption>
              ))}
            </NativeSelect>
            <NativeSelect
              value={pagination.filters.sizeId ?? ''}
              onChange={(e) => pagination.setFilter('sizeId', e.target.value || undefined)}
              aria-label="Size filter"
            >
              <NativeSelectOption value="">All sizes</NativeSelectOption>
              {sizeOptions.map((s) => (
                <NativeSelectOption key={s.value} value={s.value}>
                  {s.label}
                </NativeSelectOption>
              ))}
            </NativeSelect>
            <NativeSelect
              value={pagination.filters.status ?? ''}
              onChange={(e) => pagination.setFilter('status', e.target.value || undefined)}
              aria-label="Status filter"
            >
              <NativeSelectOption value="">All statuses</NativeSelectOption>
              {statusOptions.map((opt) => (
                <NativeSelectOption key={opt.value} value={opt.value}>
                  {opt.label}
                </NativeSelectOption>
              ))}
            </NativeSelect>
            <NativeSelect
              value={pagination.filters.conditionStatus ?? ''}
              onChange={(e) => pagination.setFilter('conditionStatus', e.target.value || undefined)}
              aria-label="Condition filter"
            >
              <NativeSelectOption value="">All conditions</NativeSelectOption>
              {conditionOptions.map((opt) => (
                <NativeSelectOption key={opt.value} value={opt.value}>
                  {opt.label}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </>
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
        emptyTitle="No inventory items yet"
        emptyDescription="Create your first inventory item to get started."
        emptyAction={
          <Button onClick={() => setFormOpen(true)} size="sm">
            <Plus className="size-4" />
            New item
          </Button>
        }
        onRowClick={(r) => router.push(`/inventory-items/${r.id}`)}
        mobileCard={(r) => (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium">{r.serialCode}</span>
              <StatusBadge meta={INVENTORY_STATUS_META[r.status]} />
            </div>
            <div className="text-muted-foreground text-sm">
              {productMap[r.productId] ?? r.productId}
              {sizeMap[r.sizeId] ? ` · ${sizeMap[r.sizeId]}` : ''}
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge meta={CONDITION_STATUS_META[r.conditionStatus]} />
              {branchMap[r.branchId] ? (
                <span className="text-muted-foreground text-xs">{branchMap[r.branchId]}</span>
              ) : null}
            </div>
          </div>
        )}
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

      <InventoryForm
        open={formOpen}
        onOpenChange={setFormOpen}
        loading={createMutation.isPending}
        branchOptions={branchOptions}
        productOptions={productOptions}
        sizeOptions={sizeOptions}
        onSubmit={handleCreate}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete inventory item?"
        description={
          deleting ? (
            <>
              Item <strong>{deleting.serialCode}</strong> will be permanently removed. This cannot
              be undone.
            </>
          ) : null
        }
        destructive
        confirmText="Delete"
        loading={deleteMutation.isPending}
        onConfirm={() => {
          if (!deleting) return;
          deleteMutation.mutate(deleting.id, { onSuccess: () => setDeleting(null) });
        }}
      />
    </div>
  );
}
