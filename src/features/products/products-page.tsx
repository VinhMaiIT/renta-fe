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
import { ACTIVE_STATUS_META } from '@/constants/enum-labels';
import { formatCurrency } from '@/lib/format';
import {
  useProducts,
  useDeleteProduct,
  useSetProductStatus,
  useProductLookups,
} from './use-products';
import type { Product } from '@/types/models';

export function ProductsPage() {
  const router = useRouter();
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
      header: 'Code',
      cell: (r) => <span className="font-mono text-sm">{r.code}</span>,
    },
    {
      id: 'name',
      header: 'Name',
      primary: true,
      cell: (r) => <span className="font-medium">{r.name}</span>,
    },
    {
      id: 'type',
      header: 'Type',
      cell: (r) => lookups.productTypeMap[r.productTypeId] ?? '—',
    },
    {
      id: 'group',
      header: 'Group',
      hideBelow: 'md',
      cell: (r) => lookups.productGroupMap[r.productGroupId] ?? '—',
    },
    {
      id: 'rentalPrice',
      header: 'Rental price',
      hideBelow: 'md',
      cell: (r) => formatCurrency(r.rentalPrice),
    },
    {
      id: 'status',
      header: 'Status',
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
            <Button variant="ghost" size="icon-sm" aria-label="Actions">
              <MoreHorizontal className="size-4" />
            </Button>
          }
        />
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => router.push(`/products/${product.id}/edit`)}>
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setStatus.mutate({ id: product.id, status: nextStatus })}
          >
            {product.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive" onClick={() => setDeleting(product)}>
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Products"
        description="Manage your rental product catalog."
        actions={
          <Button onClick={() => router.push('/products/new')}>
            <Plus className="size-4" />
            New product
          </Button>
        }
      />

      <ListToolbar
        search={pagination.search}
        onSearchChange={pagination.setSearch}
        searchPlaceholder="Search by name or code…"
        filters={
          <>
            <NativeSelect
              value={pagination.filters.status ?? ''}
              onChange={(e) => pagination.setFilter('status', e.target.value || undefined)}
              aria-label="Status filter"
            >
              <NativeSelectOption value="">All statuses</NativeSelectOption>
              <NativeSelectOption value="ACTIVE">Active</NativeSelectOption>
              <NativeSelectOption value="INACTIVE">Inactive</NativeSelectOption>
            </NativeSelect>
            <NativeSelect
              value={pagination.filters.productTypeId ?? ''}
              onChange={(e) => pagination.setFilter('productTypeId', e.target.value || undefined)}
              aria-label="Product type filter"
            >
              <NativeSelectOption value="">All types</NativeSelectOption>
              {lookups.productTypeOptions.map((opt) => (
                <NativeSelectOption key={opt.value} value={opt.value}>
                  {opt.label}
                </NativeSelectOption>
              ))}
            </NativeSelect>
            <NativeSelect
              value={pagination.filters.productGroupId ?? ''}
              onChange={(e) => pagination.setFilter('productGroupId', e.target.value || undefined)}
              aria-label="Product group filter"
            >
              <NativeSelectOption value="">All groups</NativeSelectOption>
              {lookups.productGroupOptions.map((opt) => (
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
        emptyTitle="No products yet"
        emptyDescription="Create your first product to get started."
        emptyAction={
          <Button onClick={() => router.push('/products/new')} size="sm">
            <Plus className="size-4" />
            New product
          </Button>
        }
        onRowClick={(r) => router.push(`/products/${r.id}`)}
        mobileCard={(r) => (
          <div className="space-y-1.5">
            <div className="flex items-start justify-between gap-2">
              <p className="font-medium">{r.name}</p>
              <StatusBadge meta={ACTIVE_STATUS_META[r.status]} />
            </div>
            <p className="text-muted-foreground font-mono text-sm">{r.code}</p>
            <p className="text-sm">{formatCurrency(r.rentalPrice)}</p>
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

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete product?"
        description={
          deleting ? (
            <>
              <strong>{deleting.name}</strong> will be permanently removed. This cannot be undone.
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
