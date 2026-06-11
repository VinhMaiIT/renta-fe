'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, Plus, Trash2 } from 'lucide-react';
import { ListPageHeader } from '@/components/common/list-page-header';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { StatusBadge } from '@/components/common/status-badge';
import { DataTableView, type Column } from '@/components/tables/data-table-view';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { usePagination } from '@/hooks/use-pagination';
import { useEnumOptions } from '@/hooks/use-enum-options';
import { INVENTORY_STATUS_META, CONDITION_STATUS_META } from '@/constants/enum-labels';
import { useT } from '@/i18n/locale-provider';
import { cn } from '@/lib/utils';
import type { InventoryItem } from '@/types/models';
import type { InventoryItemStatus, InventoryItemConditionStatus } from '@/types/enums';
import {
  useInventoryItems,
  useCreateInventoryItem,
  useDeleteInventoryItem,
  useSetInventoryStatus,
  useSetInventoryCondition,
  useInventoryLookups,
} from './use-inventory';
import { InventoryForm } from './inventory-form';
import type { InventoryCreatePayload } from './api';

/** Vivid text color per status for the actions menu. */
const STATUS_MENU_TONE: Record<InventoryItemStatus, string> = {
  AVAILABLE: 'text-green-600 focus:text-green-600 dark:text-green-400',
  RENTED: 'text-blue-600 focus:text-blue-600 dark:text-blue-400',
  MAINTENANCE: 'text-amber-600 focus:text-amber-600 dark:text-amber-400',
  LOST: 'text-red-600 focus:text-red-600 dark:text-red-400',
  DISABLED: 'text-gray-500 focus:text-gray-500 dark:text-gray-400',
};

/** Vivid text color per condition for the actions menu. */
const CONDITION_MENU_TONE: Record<InventoryItemConditionStatus, string> = {
  NEW: 'text-green-600 focus:text-green-600 dark:text-green-400',
  GOOD: 'text-emerald-600 focus:text-emerald-600 dark:text-emerald-400',
  FAIR: 'text-gray-500 focus:text-gray-500 dark:text-gray-400',
  NEEDS_CLEANING: 'text-amber-600 focus:text-amber-600 dark:text-amber-400',
  NEEDS_REPAIR: 'text-orange-600 focus:text-orange-600 dark:text-orange-400',
  DAMAGED: 'text-red-600 focus:text-red-600 dark:text-red-400',
};

export function InventoryPage() {
  const { t } = useT();
  const router = useRouter();
  const pagination = usePagination({ initialPageSize: 10 });

  const statusOptions = useEnumOptions(INVENTORY_STATUS_META);
  const conditionOptions = useEnumOptions(CONDITION_STATUS_META);

  const { productMap, sizeMap, branchMap, branchOptions, productOptions, sizeOptions } =
    useInventoryLookups();

  const list = useInventoryItems(pagination.queryParams);
  const createMutation = useCreateInventoryItem();
  const deleteMutation = useDeleteInventoryItem();
  const setStatusMutation = useSetInventoryStatus();
  const setConditionMutation = useSetInventoryCondition();

  const [formOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState<InventoryItem | null>(null);

  const data = list.data;

  const columns: Column<InventoryItem>[] = [
    {
      id: 'serialCode',
      header: t('inventory.serial'),
      cell: (r) => <span className="font-medium">{r.serialCode}</span>,
    },
    {
      id: 'product',
      header: t('inventory.product'),
      cell: (r) => productMap[r.productId] ?? r.productId,
    },
    {
      id: 'size',
      header: t('inventory.size'),
      hideBelow: 'md',
      cell: (r) => sizeMap[r.sizeId] ?? r.sizeId,
    },
    {
      id: 'branch',
      header: t('inventory.branch'),
      hideBelow: 'lg',
      cell: (r) => branchMap[r.branchId] ?? r.branchId,
    },
    {
      id: 'status',
      header: t('inventory.status'),
      cell: (r) => <StatusBadge meta={INVENTORY_STATUS_META[r.status]} />,
    },
    {
      id: 'condition',
      header: t('inventory.condition'),
      hideBelow: 'sm',
      cell: (r) => <StatusBadge meta={CONDITION_STATUS_META[r.conditionStatus]} />,
    },
    {
      id: 'actions',
      header: '',
      headerClassName: 'text-right',
      className: 'text-right',
      cell: (r) => <RowActions record={r} />,
    },
  ];

  function RowActions({ record }: { record: InventoryItem }) {
    return (
      // Stop row navigation from firing when interacting with the controls.
      <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
        <Button
          variant="outline"
          size="icon-sm"
          className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
          aria-label={t('common.action.delete')}
          title={t('common.action.delete')}
          onClick={() => setDeleting(record)}
        >
          <Trash2 className="size-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="outline" size="sm" className="gap-1">
                {t('inventory.status')}
                <ChevronDown className="size-3.5" />
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="min-w-44">
            {statusOptions.map((opt) => (
              <DropdownMenuItem
                key={opt.value}
                disabled={record.status === opt.value}
                className={cn(
                  'gap-2 font-medium whitespace-nowrap',
                  STATUS_MENU_TONE[opt.value as InventoryItemStatus],
                )}
                onClick={() =>
                  setStatusMutation.mutate({
                    id: record.id,
                    status: opt.value as InventoryItemStatus,
                  })
                }
              >
                <span className="size-2.5 shrink-0 rounded-full bg-current" />
                {opt.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="outline" size="sm" className="gap-1">
                {t('inventory.condition')}
                <ChevronDown className="size-3.5" />
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="min-w-48">
            {conditionOptions.map((opt) => (
              <DropdownMenuItem
                key={opt.value}
                disabled={record.conditionStatus === opt.value}
                className={cn(
                  'gap-2 font-medium whitespace-nowrap',
                  CONDITION_MENU_TONE[opt.value as InventoryItemConditionStatus],
                )}
                onClick={() =>
                  setConditionMutation.mutate({
                    id: record.id,
                    conditionStatus: opt.value as InventoryItemConditionStatus,
                  })
                }
              >
                <span className="size-2.5 shrink-0 rounded-full bg-current" />
                {opt.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  function handleCreate(input: InventoryCreatePayload) {
    createMutation.mutate(input, { onSuccess: () => setFormOpen(false) });
  }

  return (
    <div className="space-y-5">
      <ListPageHeader
        title={t('inventory.countSummary', {
          count: data?.items.length ?? 0,
          total: data?.total ?? 0,
        })}
        titleClassName="text-base font-semibold sm:text-base"
        search={pagination.search}
        onSearchChange={pagination.setSearch}
        searchPlaceholder={t('inventory.searchPlaceholder')}
        filters={
          <>
            <NativeSelect
              value={pagination.filters.sizeId ?? ''}
              onChange={(e) => pagination.setFilter('sizeId', e.target.value || undefined)}
              aria-label={t('inventory.size')}
              className="bg-card"
            >
              <NativeSelectOption value="">{t('inventory.allSizes')}</NativeSelectOption>
              {sizeOptions.map((s) => (
                <NativeSelectOption key={s.value} value={s.value}>
                  {s.label}
                </NativeSelectOption>
              ))}
            </NativeSelect>
            <NativeSelect
              value={pagination.filters.status ?? ''}
              onChange={(e) => pagination.setFilter('status', e.target.value || undefined)}
              aria-label={t('inventory.status')}
              className="bg-card"
            >
              <NativeSelectOption value="">{t('inventory.allStatuses')}</NativeSelectOption>
              {statusOptions.map((opt) => (
                <NativeSelectOption key={opt.value} value={opt.value}>
                  {opt.label}
                </NativeSelectOption>
              ))}
            </NativeSelect>
            <NativeSelect
              value={pagination.filters.conditionStatus ?? ''}
              onChange={(e) => pagination.setFilter('conditionStatus', e.target.value || undefined)}
              aria-label={t('inventory.condition')}
              className="bg-card"
            >
              <NativeSelectOption value="">{t('inventory.allConditions')}</NativeSelectOption>
              {conditionOptions.map((opt) => (
                <NativeSelectOption key={opt.value} value={opt.value}>
                  {opt.label}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </>
        }
        actions={
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="size-4" />
            {t('inventory.newItem')}
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
        emptyTitle={t('inventory.emptyTitle')}
        onRowClick={(r) => router.push(`/inventory-items/${r.id}`)}
        page={data?.page ?? pagination.page}
        pageSize={data?.pageSize ?? pagination.pageSize}
        total={data?.total ?? 0}
        onPageChange={pagination.setPage}
        onPageSizeChange={pagination.setPageSize}
      />

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
        title={t('common.confirm.deleteTitle', { item: t('inventory.title') })}
        description={deleting ? t('inventory.deleteDesc', { serial: deleting.serialCode }) : null}
        destructive
        confirmText={t('common.action.delete')}
        loading={deleteMutation.isPending}
        onConfirm={() => {
          if (!deleting) return;
          deleteMutation.mutate(deleting.id, { onSuccess: () => setDeleting(null) });
        }}
      />
    </div>
  );
}
