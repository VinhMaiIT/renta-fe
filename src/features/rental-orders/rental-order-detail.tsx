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
import { useT } from '@/i18n/locale-provider';
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
  const { t } = useT();
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
          {t('rentalOrders.detail.backToOrders')}
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
        {t('rentalOrders.detail.backToOrders')}
      </Button>

      <PageHeader
        title={order.orderCode}
        description={t('rentalOrders.detail.createdAt', { dateTime: formatDateTime(order.createdAt) })}
        actions={<StatusBadge meta={RENTAL_ORDER_STATUS_META[order.status]} />}
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t('rentalOrders.detail.orderDetails')}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
            <Field label={t('rentalOrders.detail.customer')} value={order.customerId} />
            <Field label={t('rentalOrders.detail.branch')} value={order.branchId} />
            <Field label={t('rentalOrders.detail.createdBy')} value={order.createdBy} />
            <Field label={t('rentalOrders.detail.rentDate')} value={formatDateTime(order.rentDate)} />
            <Field label={t('rentalOrders.detail.expectedReturn')} value={formatDateTime(order.expectedReturnDate)} />
            <Field label={t('rentalOrders.detail.actualReturn')} value={formatDateTime(order.actualReturnDate)} />
            {order.note ? (
              <div className="sm:col-span-2">
                <Field label={t('rentalOrders.detail.note')} value={order.note} />
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('rentalOrders.detail.amounts')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <AmountRow label={t('rentalOrders.detail.deposit')} value={order.depositAmount} />
            <AmountRow label={t('rentalOrders.detail.discount')} value={order.discountAmount} />
            <AmountRow label={t('rentalOrders.detail.lateFee')} value={order.lateFee} />
            <AmountRow label={t('rentalOrders.detail.damageFee')} value={order.damageFee} />
            <Separator className="my-2" />
            <div className="flex items-center justify-between font-semibold">
              <span>{t('rentalOrders.detail.total')}</span>
              <span>{formatCurrency(order.totalAmount)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('rentalOrders.detail.itemsCard', { count: order.items.length })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-border overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('rentalOrders.detail.inventoryItem')}</TableHead>
                  <TableHead>{t('rentalOrders.detail.product')}</TableHead>
                  <TableHead>{t('rentalOrders.detail.price')}</TableHead>
                  <TableHead>{t('rentalOrders.list.status')}</TableHead>
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
              {t('rentalOrders.detail.edit')}
            </Button>
            <Button onClick={() => setConfirmOpen(true)}>
              <CheckCircle2 className="size-4" />
              {t('rentalOrders.detail.confirm')}
            </Button>
          </>
        ) : null}

        {isActive ? (
          <>
            <Button onClick={() => router.push(`/return-transactions/new?orderId=${order.id}`)}>
              <RotateCcw className="size-4" />
              {t('rentalOrders.detail.processReturn')}
            </Button>
            <Button variant="outline" onClick={() => setCancelOpen(true)}>
              <XCircle className="size-4" />
              {t('rentalOrders.detail.cancel')}
            </Button>
          </>
        ) : null}

        {canDelete ? (
          <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="size-4" />
            {t('rentalOrders.detail.delete')}
          </Button>
        ) : null}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={t('rentalOrders.detail.confirmTitle')}
        description={t('rentalOrders.detail.confirmDesc')}
        confirmText={t('rentalOrders.detail.confirmText')}
        loading={confirm.isPending}
        onConfirm={() => confirm.mutate(order.id, { onSuccess: () => setConfirmOpen(false) })}
      />

      <ConfirmDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title={t('rentalOrders.detail.cancelTitle')}
        description={t('rentalOrders.detail.cancelDesc')}
        destructive
        confirmText={t('rentalOrders.detail.cancelText')}
        loading={cancel.isPending}
        onConfirm={() => cancel.mutate(order.id, { onSuccess: () => setCancelOpen(false) })}
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={t('rentalOrders.detail.deleteTitle')}
        description={
          <>
            <strong>{order.orderCode}</strong>{' '}
            {t('common.confirm.deleteDesc')}
          </>
        }
        destructive
        confirmText={t('rentalOrders.detail.deleteText')}
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
