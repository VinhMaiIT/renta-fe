'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import {
  useProducts,
  useDeleteProduct,
  useSetProductStatus,
  useProductLookups,
} from './use-products';
import type { Product } from '@/types/models';

export function ProductsPage() {
  const router = useRouter();
  const { t } = useT();
  const pagination = usePagination();
  const lookups = useProductLookups();
  const list = useProducts(pagination.queryParams);
  const deleteMutation = useDeleteProduct();
  const setStatus = useSetProductStatus();

  const [deleting, setDeleting] = useState<Product | null>(null);

  const data = list.data;

  const columns: Column<Product>[] = [
    {
      id: 'code',
      header: t('products.code'),
      cell: (r) => <span className="font-mono text-sm">{r.code}</span>,
    },
    {
      id: 'name',
      header: t('products.name'),
      cell: (r) => <span className="font-medium">{r.name}</span>,
    },
    {
      id: 'type',
      header: t('products.type'),
      cell: (r) => lookups.productTypeMap[r.productTypeId] ?? '—',
    },
    {
      id: 'group',
      header: t('products.group'),
      hideBelow: 'md',
      cell: (r) => lookups.productGroupMap[r.productGroupId] ?? '—',
    },
    {
      id: 'rentalPrice',
      header: t('products.rentalPrice'),
      hideBelow: 'md',
      cell: (r) => formatCurrency(r.rentalPrice),
    },
    {
      id: 'status',
      header: t('common.table.status'),
      cell: (r) => <StatusBadge meta={ACTIVE_STATUS_META[r.status]} />,
    },
    {
      id: 'actions',
      header: '',
      headerClassName: 'w-10',
      cell: (r) => <RowActions product={r} />,
    },
  ];

  function RowActions({ product }: { product: Product }) {
    const nextStatus = product.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
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
          <DropdownMenuItem onClick={() => router.push(`/products/${product.id}/edit`)}>
            {t('common.action.edit')}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setStatus.mutate({ id: product.id, status: nextStatus })}
          >
            {product.status === 'ACTIVE' ? t('products.deactivate') : t('products.activate')}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive" onClick={() => setDeleting(product)}>
            {t('common.action.delete')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="space-y-5">
      <ListPageHeader
        title={t('products.title')}
        description={t('products.subtitle')}
        search={pagination.search}
        onSearchChange={pagination.setSearch}
        searchPlaceholder={t('products.searchPlaceholder')}
        filters={
          <>
            <NativeSelect
              value={pagination.filters.status ?? ''}
              onChange={(e) => pagination.setFilter('status', e.target.value || undefined)}
              aria-label={t('common.table.status')}
              className="bg-card"
            >
              <NativeSelectOption value="">{t('common.table.allStatuses')}</NativeSelectOption>
              <NativeSelectOption value="ACTIVE">{t('common.table.active')}</NativeSelectOption>
              <NativeSelectOption value="INACTIVE">{t('common.table.inactive')}</NativeSelectOption>
            </NativeSelect>
            <NativeSelect
              value={pagination.filters.productTypeId ?? ''}
              onChange={(e) => pagination.setFilter('productTypeId', e.target.value || undefined)}
              aria-label={t('products.productType')}
              className="bg-card"
            >
              <NativeSelectOption value="">{t('products.allTypes')}</NativeSelectOption>
              {lookups.productTypeOptions.map((opt) => (
                <NativeSelectOption key={opt.value} value={opt.value}>
                  {opt.label}
                </NativeSelectOption>
              ))}
            </NativeSelect>
            <NativeSelect
              value={pagination.filters.productGroupId ?? ''}
              onChange={(e) => pagination.setFilter('productGroupId', e.target.value || undefined)}
              aria-label={t('products.productGroup')}
              className="bg-card"
            >
              <NativeSelectOption value="">{t('products.allGroups')}</NativeSelectOption>
              {lookups.productGroupOptions.map((opt) => (
                <NativeSelectOption key={opt.value} value={opt.value}>
                  {opt.label}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </>
        }
        actions={
          <Button onClick={() => router.push('/products/new')}>
            <Plus className="size-4" />
            {t('products.newProduct')}
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
        emptyTitle={t('products.emptyTitle')}
        onRowClick={(r) => router.push(`/products/${r.id}`)}
        page={data?.page ?? pagination.page}
        pageSize={data?.pageSize ?? pagination.pageSize}
        total={data?.total ?? 0}
        onPageChange={pagination.setPage}
        onPageSizeChange={pagination.setPageSize}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={t('common.confirm.deleteTitle', { item: t('products.title').toLowerCase() })}
        description={
          deleting ? t('products.deleteDesc', { name: deleting.name }) : null
        }
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
