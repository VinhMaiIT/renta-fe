'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/common/page-header';
import { ErrorState } from '@/components/common/states';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { SelectMenu } from '@/components/forms/select-menu';
import { CONDITION_STATUS_META } from '@/constants/enum-labels';
import { useEnumOptions } from '@/hooks/use-enum-options';
import { useT } from '@/i18n/locale-provider';
import { toast } from '@/lib/toast';
import { formatDate } from '@/lib/format';
import type { InventoryItemConditionStatus } from '@/types/enums';
import type { RentalOrder, RentalOrderItem } from '@/types/models';
import {
  useCreateReturnTransaction,
  useRentalOrderForReturn,
  useReturnableOrders,
} from './use-returns';
import type { ReturnItemInput } from './api';

const DEFAULT_CONDITION: InventoryItemConditionStatus = 'GOOD';

/** Per-row editable state in the return form. */
interface RowState {
  selected: boolean;
  conditionStatus: InventoryItemConditionStatus;
  damageFee: string;
  note: string;
}

interface ReturnCreateProps {
  initialOrderId?: string;
}

function nowLocalDatetime(): string {
  const now = new Date();
  const offsetMs = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offsetMs).toISOString().slice(0, 16);
}

function isUnreturned(item: RentalOrderItem): boolean {
  return item.status !== 'RETURNED' && item.status !== 'CANCELLED';
}

export function ReturnCreate({ initialOrderId }: ReturnCreateProps) {
  const router = useRouter();
  const { t } = useT();
  const [selectedOrderId, setSelectedOrderId] = useState<string>(initialOrderId ?? '');

  const orderQuery = useRentalOrderForReturn(selectedOrderId || undefined);
  const order = orderQuery.data;

  const backButton = (
    <Button variant="outline" size="sm" onClick={() => router.push('/return-transactions')}>
      <ArrowLeft className="size-4" />
      {t('returns.create.back')}
    </Button>
  );

  return (
    <div className="space-y-5 pb-24 md:pb-0">
      <PageHeader
        title={t('returns.create.title')}
        description={t('returns.create.subtitle')}
        actions={backButton}
      />

      {!selectedOrderId ? (
        <OrderSelector onSelect={setSelectedOrderId} />
      ) : orderQuery.isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : orderQuery.isError || !order ? (
        <ErrorState
          title={t('returns.create.couldNotLoadOrder')}
          description={orderQuery.error instanceof Error ? orderQuery.error.message : undefined}
          onRetry={() => orderQuery.refetch()}
        />
      ) : (
        <ReturnForm
          order={order}
          onChangeOrder={!initialOrderId ? () => setSelectedOrderId('') : undefined}
        />
      )}
    </div>
  );
}

function OrderSelector({ onSelect }: { onSelect: (id: string) => void }) {
  const { t } = useT();
  const [value, setValue] = useState('');
  const ordersQuery = useReturnableOrders({ pageSize: 100 });

  const options = useMemo(
    () =>
      (ordersQuery.data?.items ?? []).map((o) => ({
        value: o.id,
        label: `${o.orderCode} (#${o.id})`,
      })),
    [ordersQuery.data],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('returns.create.selectOrder')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {ordersQuery.isLoading ? (
          <Skeleton className="h-9 w-full" />
        ) : ordersQuery.isError ? (
          <ErrorState
            title={t('returns.create.noReturnableOrders')}
            onRetry={() => ordersQuery.refetch()}
          />
        ) : (
          <>
            <SelectMenu
              label={t('returns.create.rentalOrder')}
              required
              placeholder={t('returns.create.choosePlaceholder')}
              options={options}
              value={value}
              onChange={(v) => setValue(v)}
            />
            <Button disabled={!value} onClick={() => onSelect(value)}>
              {t('returns.create.continue')}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function ReturnForm({ order, onChangeOrder }: { order: RentalOrder; onChangeOrder?: () => void }) {
  const router = useRouter();
  const { t } = useT();
  const create = useCreateReturnTransaction();
  const conditionOptions = useEnumOptions(CONDITION_STATUS_META);

  const returnableItems = useMemo(() => order.items.filter(isUnreturned), [order.items]);

  const [rows, setRows] = useState<Record<string, RowState>>(() =>
    Object.fromEntries(
      returnableItems.map((item) => [
        item.id,
        { selected: false, conditionStatus: DEFAULT_CONDITION, damageFee: '', note: '' },
      ]),
    ),
  );
  const [returnDate, setReturnDate] = useState<string>(nowLocalDatetime());
  const [lateFee, setLateFee] = useState<string>('');
  const [orderNote, setOrderNote] = useState<string>('');

  const update = (id: string, patch: Partial<RowState>) =>
    setRows((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));

  const selectedCount = Object.values(rows).filter((r) => r.selected).length;

  const submit = () => {
    const items: ReturnItemInput[] = returnableItems
      .filter((item) => rows[item.id]?.selected)
      .map((item) => {
        const row = rows[item.id];
        const fee = row.damageFee.trim() === '' ? undefined : Number(row.damageFee);
        return {
          rentalOrderItemId: item.id,
          inventoryItemId: item.inventoryItemId,
          conditionStatus: row.conditionStatus,
          ...(fee !== undefined && !Number.isNaN(fee) ? { damageFee: fee } : {}),
          ...(row.note.trim() ? { note: row.note.trim() } : {}),
        };
      });

    if (items.length === 0) {
      toast.error(t('returns.create.selectAtLeastOne'));
      return;
    }

    const parsedLateFee = lateFee.trim() === '' ? undefined : Number(lateFee);
    const returnDateIso = new Date(returnDate).toISOString();

    create.mutate(
      {
        rentalOrderId: order.id,
        returnDate: returnDateIso,
        ...(parsedLateFee !== undefined && !Number.isNaN(parsedLateFee)
          ? { lateFee: parsedLateFee }
          : {}),
        ...(orderNote.trim() ? { note: orderNote.trim() } : {}),
        items,
      },
      {
        onSuccess: () => router.push(`/rental-orders/${order.id}`),
      },
    );
  };

  const actions = (
    <Button onClick={submit} loading={create.isPending} disabled={selectedCount === 0}>
      {t('returns.create.submit', { count: selectedCount })}
    </Button>
  );

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>
            {order.orderCode}{' '}
            <span className="text-muted-foreground font-normal">#{order.id}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p className="text-muted-foreground">
            {t('returns.create.rented', { date: formatDate(order.rentDate) })} ·{' '}
            {t('returns.create.expectedReturn', { date: formatDate(order.expectedReturnDate) })}
          </p>
          {onChangeOrder ? (
            <Button variant="link" size="sm" className="px-0" onClick={onChangeOrder}>
              {t('returns.create.chooseDifferentOrder')}
            </Button>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('returns.create.unreturnedItems')}</CardTitle>
        </CardHeader>
        <CardContent>
          {returnableItems.length === 0 ? (
            <p className="text-muted-foreground text-sm">{t('returns.create.noItemsLeft')}</p>
          ) : (
            <div className="space-y-4">
              {returnableItems.map((item) => {
                const row = rows[item.id];
                return (
                  <div key={item.id} className="border-border space-y-3 rounded-lg border p-4">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={row.selected}
                        onCheckedChange={(checked) =>
                          update(item.id, { selected: checked === true })
                        }
                        aria-label={t('returns.create.include', { id: item.inventoryItemId })}
                      />
                      <div className="text-sm">
                        <p className="font-medium">
                          {t('returns.create.inventoryItem', { id: item.inventoryItemId })}
                        </p>
                        <p className="text-muted-foreground font-mono text-xs">
                          {t('returns.create.orderItem', { id: item.id })}
                        </p>
                      </div>
                    </div>

                    {row.selected ? (
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <SelectMenu
                          label={t('returns.create.condition')}
                          options={conditionOptions}
                          value={row.conditionStatus}
                          onChange={(v) =>
                            update(item.id, {
                              conditionStatus: v as InventoryItemConditionStatus,
                            })
                          }
                        />
                        <Input
                          label={t('returns.create.damageFee')}
                          type="number"
                          min={0}
                          inputMode="decimal"
                          value={row.damageFee}
                          onChange={(e) => update(item.id, { damageFee: e.target.value })}
                          placeholder="0"
                        />
                        <Textarea
                          label={t('returns.create.note')}
                          className="sm:col-span-2"
                          value={row.note}
                          onChange={(e) => update(item.id, { note: e.target.value })}
                          placeholder={t('returns.create.notePlaceholder')}
                        />
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('returns.create.returnDetails')}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input
            label={t('returns.create.returnDate')}
            required
            type="datetime-local"
            value={returnDate}
            onChange={(e) => setReturnDate(e.target.value)}
          />
          <Input
            label={t('returns.create.lateFee')}
            type="number"
            min={0}
            inputMode="decimal"
            value={lateFee}
            onChange={(e) => setLateFee(e.target.value)}
            placeholder="0"
          />
          <Textarea
            label={t('returns.create.note')}
            className="sm:col-span-2"
            value={orderNote}
            onChange={(e) => setOrderNote(e.target.value)}
            placeholder={t('returns.create.returnNotePlaceholder')}
          />
        </CardContent>
      </Card>

      {/* Desktop action bar */}
      <div className="hidden justify-end md:flex">{actions}</div>

      {/* Sticky mobile action bar */}
      <div className="border-border bg-background fixed inset-x-0 bottom-0 z-10 border-t p-4 md:hidden">
        <div className="flex items-center justify-between gap-3">
          <span className="text-muted-foreground text-sm">
            {t('returns.create.selected', { count: selectedCount })}
          </span>
          {actions}
        </div>
      </div>
    </div>
  );
}
