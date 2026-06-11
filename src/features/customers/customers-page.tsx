'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { ListPageHeader } from '@/components/common/list-page-header';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { RowActions } from '@/components/common/row-actions';
import { DataTableView, type Column } from '@/components/tables/data-table-view';
import { Button } from '@/components/ui/button';
import { usePagination } from '@/hooks/use-pagination';
import { formatDate } from '@/lib/format';
import { useT } from '@/i18n/locale-provider';
import {
  useCustomers,
  useCreateCustomer,
  useUpdateCustomer,
  useDeleteCustomer,
} from './use-customers';
import { CustomerForm } from './customer-form';
import type { Customer } from '@/types/models';

export function CustomersPage() {
  const { t } = useT();
  const pagination = usePagination({ initialPageSize: 10 });
  const list = useCustomers(pagination.queryParams);
  const create = useCreateCustomer();
  const update = useUpdateCustomer();
  const deleteMutation = useDeleteCustomer();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [deleting, setDeleting] = useState<Customer | null>(null);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (customer: Customer) => {
    setEditing(customer);
    setFormOpen(true);
  };

  const data = list.data;
  const saving = create.isPending || update.isPending;

  const columns: Column<Customer>[] = [
    {
      id: 'name',
      header: t('common.table.name'),
      cell: (r) => <span className="font-medium">{r.name}</span>,
    },
    {
      id: 'phone',
      header: t('customers.phone'),
      cell: (r) => r.phone,
    },
    {
      id: 'address',
      header: t('customers.address'),
      hideBelow: 'md',
      cell: (r) => r.address ?? '—',
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
        <RowActions onEdit={() => openEdit(r)} onDelete={() => setDeleting(r)} />
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <ListPageHeader
        title={t('customers.countSummary', {
          count: data?.items.length ?? 0,
          total: data?.total ?? 0,
        })}
        titleClassName="text-base font-semibold sm:text-base"
        search={pagination.search}
        onSearchChange={pagination.setSearch}
        searchPlaceholder={t('customers.searchPlaceholder')}
        actions={
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            {t('customers.newCustomer')}
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
        emptyTitle={t('customers.emptyTitle')}
        page={data?.page ?? pagination.page}
        pageSize={data?.pageSize ?? pagination.pageSize}
        total={data?.total ?? 0}
        onPageChange={pagination.setPage}
        onPageSizeChange={pagination.setPageSize}
      />

      <CustomerForm
        open={formOpen}
        onOpenChange={setFormOpen}
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
        title={t('common.confirm.deleteTitle', { item: t('customers.title').toLowerCase() })}
        description={
          deleting ? t('customers.deleteDesc', { name: deleting.name }) : null
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
