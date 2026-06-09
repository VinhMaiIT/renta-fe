'use client';

import { useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, Pencil, RotateCcw, Trash2, XCircle } from 'lucide-react';
import { PageHeader } from '@/components/common/page-header';
import { StatusBadge } from '@/components/common/status-badge';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { ErrorState } from '@/components/common/states';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { RENTAL_ORDER_ITEM_STATUS_META, RENTAL_ORDER_STATUS_META } from '@/constants/enum-labels';
import { formatCurrency, formatDateTime } from '@/lib/format';
import type { Id, RentalOrder } from '@/types/models';
import {
  useCancelRentalOrder,
  useConfirmRentalOrder,
  useDeleteRentalOrder,
  useRentalOrder,
} from './use-rental-orders';

interface RentalOrderDetailProps {
  id: Id;
}

const ACTIVE_STATUSES = new Set(['RENTING', 'PARTIALLY_RETURNED', 'OVERDUE']);

export function RentalOrderDetail({ id }: RentalOrderDetailProps) {
  const router = useRouter();
  const query = useRentalOrder(id);
  const confirm = useConfirmRentalOrder();
  const cancel = useCancelRentalOrder();
  const remove = useDeleteRentalOrder();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (query.isLoading) return <DetailSkeleton />;

  if (query.isError || !query.data) {
    return (
      <div className="space-y-5">
        <Button variant="ghost" size="sm" onClick={() => router.push('/rental-orders')}>
          <ArrowLeft className="size-4" />
          Back to orders
        </Button>
        <ErrorState
          description={query.error instanceof Error ? query.error.message : undefined}
          onRetry={() => query.refetch()}
        />
      </div>
    );
  }

  const order: RentalOrder = query.data;
  const isDraft = order.status === 'DRAFT';
  const canDelete = order.status === 'DRAFT' || order.status === 'CANCELLED';
  const isActive = ACTIVE_STATUSES.has(order.status);

  return (
    <div className="space-y-5 pb-20 md:pb-0">
      <Button variant="ghost" size="sm" onClick={() => router.push('/rental-orders')}>
        <ArrowLeft className="size-4" />
        Back to orders
      </Button>

      <PageHeader
        title={order.orderCode}
        description={`Created ${formatDateTime(order.createdAt)}`}
        actions={<StatusBadge meta={RENTAL_ORDER_STATUS_META[order.status]} />}
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Order details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
            <Field label="Customer ID" value={order.customerId} />
            <Field label="Branch" value={order.branchId} />
            <Field label="Created by" value={order.createdBy} />
            <Field label="Rent date" value={formatDateTime(order.rentDate)} />
            <Field label="Expected return" value={formatDateTime(order.expectedReturnDate)} />
            <Field label="Actual return" value={formatDateTime(order.actualReturnDate)} />
            {order.note ? (
              <div className="sm:col-span-2">
                <Field label="Note" value={order.note} />
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Amounts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <AmountRow label="Deposit" value={order.depositAmount} />
            <AmountRow label="Discount" value={order.discountAmount} />
            <AmountRow label="Late fee" value={order.lateFee} />
            <AmountRow label="Damage fee" value={order.damageFee} />
            <Separator className="my-2" />
            <div className="flex items-center justify-between font-semibold">
              <span>Total</span>
              <span>{formatCurrency(order.totalAmount)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Items ({order.items.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-border overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Inventory item</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.inventoryItemId}</TableCell>
                    <TableCell>{item.productId}</TableCell>
                    <TableCell>{formatCurrency(item.price)}</TableCell>
                    <TableCell>
                      <StatusBadge meta={RENTAL_ORDER_ITEM_STATUS_META[item.status]} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="bg-background/95 sticky bottom-0 -mx-4 flex flex-wrap gap-2 border-t p-4 backdrop-blur md:static md:mx-0 md:border-0 md:p-0 md:backdrop-blur-none">
        {isDraft ? (
          <>
            <Button
              variant="outline"
              onClick={() => router.push(`/rental-orders/${order.id}/edit`)}
            >
              <Pencil className="size-4" />
              Edit
            </Button>
            <Button onClick={() => setConfirmOpen(true)}>
              <CheckCircle2 className="size-4" />
              Confirm
            </Button>
          </>
        ) : null}

        {isActive ? (
          <>
            <Button onClick={() => router.push(`/return-transactions/new?orderId=${order.id}`)}>
              <RotateCcw className="size-4" />
              Process return
            </Button>
            <Button variant="outline" onClick={() => setCancelOpen(true)}>
              <XCircle className="size-4" />
              Cancel
            </Button>
          </>
        ) : null}

        {canDelete ? (
          <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="size-4" />
            Delete
          </Button>
        ) : null}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Confirm rental order?"
        description="This will move the order from Draft to Renting and mark the items as rented."
        confirmText="Confirm order"
        loading={confirm.isPending}
        onConfirm={() => confirm.mutate(order.id, { onSuccess: () => setConfirmOpen(false) })}
      />

      <ConfirmDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title="Cancel rental order?"
        description="The order will be marked as cancelled. This cannot be undone."
        destructive
        confirmText="Cancel order"
        loading={cancel.isPending}
        onConfirm={() => cancel.mutate(order.id, { onSuccess: () => setCancelOpen(false) })}
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete rental order?"
        description={
          <>
            <strong>{order.orderCode}</strong> will be permanently removed. This cannot be undone.
          </>
        }
        destructive
        confirmText="Delete"
        loading={remove.isPending}
        onConfirm={() =>
          remove.mutate(order.id, { onSuccess: () => router.push('/rental-orders') })
        }
      />
    </div>
  );
}

function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="space-y-0.5">
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="text-sm font-medium break-words">{value || '—'}</p>
    </div>
  );
}

function AmountRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span>{formatCurrency(value)}</span>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-10 w-64" />
      <div className="grid gap-5 lg:grid-cols-3">
        <Skeleton className="h-56 lg:col-span-2" />
        <Skeleton className="h-56" />
      </div>
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
