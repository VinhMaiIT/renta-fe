'use client';

import { useState } from 'react';
import { MoreHorizontal, Plus } from 'lucide-react';
import { PageHeader } from '@/components/common/page-header';
import { ListToolbar } from '@/components/common/list-toolbar';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
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
import { usePagination } from '@/hooks/use-pagination';
import { formatDate } from '@/lib/format';
import {
  useCustomers,
  useCreateCustomer,
  useUpdateCustomer,
  useDeleteCustomer,
} from './use-customers';
import { CustomerForm } from './customer-form';
import type { Customer } from '@/types/models';

export function CustomersPage() {
  const pagination = usePagination();
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
      header: 'Name',
      primary: true,
      cell: (r) => <span className="font-medium">{r.name}</span>,
    },
    {
      id: 'phone',
      header: 'Phone',
      cell: (r) => r.phone,
    },
    {
      id: 'address',
      header: 'Address',
      hideBelow: 'md',
      cell: (r) => r.address ?? '—',
    },
    {
      id: 'updatedAt',
      header: 'Updated',
      hideBelow: 'lg',
      cell: (r) => formatDate(r.updatedAt),
    },
    {
      id: 'actions',
      header: '',
      headerClassName: 'w-10',
      cell: (r) => <RowActions customer={r} />,
    },
  ];

  function RowActions({ customer }: { customer: Customer }) {
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
          <DropdownMenuItem onClick={() => openEdit(customer)}>Edit</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive" onClick={() => setDeleting(customer)}>
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Customers"
        description="Manage your customer records."
        actions={
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            New customer
          </Button>
        }
      />

      <ListToolbar
        search={pagination.search}
        onSearchChange={pagination.setSearch}
        searchPlaceholder="Search by name or phone…"
      />

      <ListView
        columns={columns}
        rows={data?.items ?? []}
        getRowId={(r) => r.id}
        isLoading={list.isLoading}
        isError={list.isError}
        error={list.error}
        onRetry={() => list.refetch()}
        emptyTitle="No customers yet"
        emptyDescription="Create your first customer to get started."
        emptyAction={
          <Button onClick={openCreate} size="sm">
            <Plus className="size-4" />
            New customer
          </Button>
        }
        mobileCard={(r) => (
          <div className="space-y-1">
            <p className="font-bold">{r.name}</p>
            <p className="text-muted-foreground text-sm">{r.phone}</p>
            {r.address ? <p className="text-muted-foreground text-sm">{r.address}</p> : null}
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
        title="Delete customer?"
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
