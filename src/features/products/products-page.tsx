'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Image as ImageIcon, Plus } from 'lucide-react';
import { ListPageHeader } from '@/components/common/list-page-header';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { StatusBadge } from '@/components/common/status-badge';
import { RowActions } from '@/components/common/row-actions';
import { DataTableView, type Column } from '@/components/tables/data-table-view';
import { Button } from '@/components/ui/button';
import { FilterSelect } from '@/components/forms/filter-select';
import { usePagination } from '@/hooks/use-pagination';
import { ACTIVE_STATUS_META } from '@/constants/enum-labels';
import { formatCurrency } from '@/lib/format';
import { mediaUrl } from '@/lib/media';
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
  const pagination = usePagination({ initialPageSize: 10 });
  const lookups = useProductLookups();
  const list = useProducts(pagination.queryParams);
  const deleteMutation = useDeleteProduct();
  const setStatus = useSetProductStatus();

  const [deleting, setDeleting] = useState<Product | null>(null);

  const data = list.data;

  function ProductThumb({ product }: { product: Product }) {
    const img = product.images?.find((i) => i.isPrimary) ?? product.images?.[0];
    if (!img) {
      return (
        <div className="bg-muted text-muted-foreground flex size-10 items-center justify-center rounded-md">
          <ImageIcon className="size-4" />
        </div>
      );
    }
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={mediaUrl(img.url)}
        alt={product.name}
        className="border-border size-10 rounded-md border object-cover"
      />
    );
  }

  const columns: Column<Product>[] = [
    {
      id: 'image',
      header: t('products.image'),
      headerClassName: 'w-16',
      cell: (r) => <ProductThumb product={r} />,
    },
    {
      id: 'code',
      header: t('products.code'),
      className: 'w-28',
      cell: (r) => <span className="font-mono text-xs">{r.code}</span>,
    },
    {
      id: 'name',
      header: t('products.name'),
      className: 'min-w-[14rem] whitespace-normal',
      cell: (r) => <span className="font-medium">{r.name}</span>,
    },
    {
      id: 'groupType',
      header: t('products.groupType'),
      hideBelow: 'md',
      cell: (r) => (
        <div className="flex flex-col">
          <span>{lookups.productGroupMap[r.productGroupId] ?? '—'}</span>
          <span className="text-muted-foreground text-xs">
            {lookups.productTypeMap[r.productTypeId] ?? '—'}
          </span>
        </div>
      ),
    },
    {
      id: 'rentalPrice',
      header: t('products.rentalPrice'),
      hideBelow: 'lg',
      cell: (r) => formatCurrency(r.rentalPrice),
    },
    {
      id: 'depositPrice',
      header: t('products.depositPrice'),
      hideBelow: 'lg',
      cell: (r) => formatCurrency(r.depositPrice),
    },
    {
      id: 'status',
      header: t('common.table.status'),
      cell: (r) => <StatusBadge meta={ACTIVE_STATUS_META[r.status]} />,
    },
    {
      id: 'actions',
      header: '',
      headerClassName: 'text-right',
      className: 'text-right',
      cell: (r) => (
        <RowActions
          onEdit={() => router.push(`/products/${r.id}/edit`)}
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
        title={t('products.countSummary', {
          count: data?.items.length ?? 0,
          total: data?.total ?? 0,
        })}
        titleClassName="text-base font-semibold sm:text-base"
        search={pagination.search}
        onSearchChange={pagination.setSearch}
        searchPlaceholder={t('products.searchPlaceholder')}
        filters={
          <>
            <FilterSelect
              value={pagination.filters.status}
              onChange={(v) => pagination.setFilter('status', v)}
              ariaLabel={t('common.table.status')}
              allLabel={t('common.table.allStatuses')}
              className="bg-card"
              options={[
                { value: 'ACTIVE', label: t('common.table.active') },
                { value: 'INACTIVE', label: t('common.table.inactive') },
              ]}
            />
            <FilterSelect
              value={pagination.filters.productTypeId}
              onChange={(v) => pagination.setFilter('productTypeId', v)}
              ariaLabel={t('products.productType')}
              allLabel={t('products.allTypes')}
              className="bg-card"
              options={lookups.productTypeOptions}
            />
            <FilterSelect
              value={pagination.filters.productGroupId}
              onChange={(v) => pagination.setFilter('productGroupId', v)}
              ariaLabel={t('products.productGroup')}
              allLabel={t('products.allGroups')}
              className="bg-card"
              options={lookups.productGroupOptions}
            />
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
