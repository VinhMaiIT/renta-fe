'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/common/page-header';
import { ErrorState } from '@/components/common/states';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/common/status-badge';
import { RENTAL_ORDER_STATUS_META } from '@/constants/enum-labels';
import type { Id } from '@/types/models';
import type { RentalOrderUpdateInput } from './api';
import { useRentalOrder, useUpdateRentalOrder } from './use-rental-orders';
import { fromDateTimeLocal, toDateTimeLocal } from './datetime';

const schema = z.object({
  note: z.string().optional(),
  depositAmount: z.coerce.number().min(0),
  discountAmount: z.coerce.number().min(0),
  expectedReturnDate: z.string().min(1, 'Expected return date is required'),
});

type FormValues = z.input<typeof schema>;

interface RentalOrderEditProps {
  id: Id;
}

export function RentalOrderEdit({ id }: RentalOrderEditProps) {
  const router = useRouter();
  const query = useRentalOrder(id);
  const update = useUpdateRentalOrder();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { note: '', depositAmount: 0, discountAmount: 0, expectedReturnDate: '' },
  });

  const order = query.data;

  useEffect(() => {
    if (order) {
      reset({
        note: order.note ?? '',
        depositAmount: order.depositAmount,
        discountAmount: order.discountAmount,
        expectedReturnDate: toDateTimeLocal(order.expectedReturnDate),
      });
    }
  }, [order, reset]);

  if (query.isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  if (query.isError || !order) {
    return (
      <div className="space-y-5">
        <BackButton onClick={() => router.push(`/rental-orders/${id}`)} />
        <ErrorState
          description={query.error instanceof Error ? query.error.message : undefined}
          onRetry={() => query.refetch()}
        />
      </div>
    );
  }

  if (order.status !== 'DRAFT') {
    return (
      <div className="space-y-5">
        <BackButton onClick={() => router.push(`/rental-orders/${id}`)} />
        <PageHeader
          title={`Edit ${order.orderCode}`}
          actions={<StatusBadge meta={RENTAL_ORDER_STATUS_META[order.status]} />}
        />
        <Card>
          <CardContent className="text-muted-foreground text-sm">
            Only draft orders can be edited. This order is{' '}
            <strong>{RENTAL_ORDER_STATUS_META[order.status].label}</strong>.
          </CardContent>
        </Card>
      </div>
    );
  }

  const onSubmit = handleSubmit((values) => {
    const input: RentalOrderUpdateInput = {
      note: values.note?.trim() ? values.note.trim() : undefined,
      depositAmount: Number(values.depositAmount),
      discountAmount: Number(values.discountAmount),
      expectedReturnDate: fromDateTimeLocal(values.expectedReturnDate),
    };
    update.mutate({ id, input }, { onSuccess: () => router.push(`/rental-orders/${id}`) });
  });

  return (
    <div className="space-y-5">
      <BackButton onClick={() => router.push(`/rental-orders/${id}`)} />
      <PageHeader title={`Edit ${order.orderCode}`} description="Update draft order details." />

      <Card>
        <CardContent>
          <form id="rental-order-edit-form" onSubmit={onSubmit} className="space-y-4">
            <Input
              label="Expected return date"
              type="datetime-local"
              required
              error={errors.expectedReturnDate?.message}
              {...register('expectedReturnDate')}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Deposit amount"
                type="number"
                min={0}
                error={errors.depositAmount?.message}
                {...register('depositAmount')}
              />
              <Input
                label="Discount amount"
                type="number"
                min={0}
                error={errors.discountAmount?.message}
                {...register('discountAmount')}
              />
            </div>
            <Textarea label="Note" error={errors.note?.message} {...register('note')} />
          </form>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={() => router.push(`/rental-orders/${id}`)}
          disabled={update.isPending}
        >
          Cancel
        </Button>
        <Button type="submit" form="rental-order-edit-form" loading={update.isPending}>
          Save changes
        </Button>
      </div>
    </div>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="ghost" size="sm" onClick={onClick}>
      <ArrowLeft className="size-4" />
      Back to order
    </Button>
  );
}
