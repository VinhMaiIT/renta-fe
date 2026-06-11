'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { StatusBadge } from '@/components/common/status-badge';
import { ErrorState } from '@/components/common/states';
import { useEnumOptions } from '@/hooks/use-enum-options';
import { INVENTORY_STATUS_META, CONDITION_STATUS_META } from '@/constants/enum-labels';
import { useT } from '@/i18n/locale-provider';
import { formatDate } from '@/lib/format';
import type { InventoryItemStatus, InventoryItemConditionStatus } from '@/types/enums';
import {
  useInventoryItem,
  useSetInventoryStatus,
  useSetInventoryCondition,
  useInventoryLookups,
} from './use-inventory';

interface InventoryDetailProps {
  id: string;
}

export function InventoryDetail({ id }: InventoryDetailProps) {
  const { t } = useT();
  const router = useRouter();
  const { data: item, isLoading, isError, error, refetch } = useInventoryItem(id);
  const setStatusMutation = useSetInventoryStatus();
  const setConditionMutation = useSetInventoryCondition();
  const { productMap, sizeMap, branchMap } = useInventoryLookups();

  const statusOptions = useEnumOptions(INVENTORY_STATUS_META);
  const conditionOptions = useEnumOptions(CONDITION_STATUS_META);

  if (isLoading) {
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-7 w-48" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="grid grid-cols-2 gap-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError || !item) {
    return (
      <div className="space-y-5">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="size-4" />
          {t('common.action.back')}
        </Button>
        <ErrorState
          description={error instanceof Error ? error.message : undefined}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="size-4" />
          {t('common.action.back')}
        </Button>
        <h1 className="text-xl font-semibold">{item.serialCode}</h1>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Main details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t('inventory.detail')}</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground text-sm">{t('inventory.serial')}</dt>
                <dd className="mt-1 font-medium">{item.serialCode}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-sm">{t('inventory.product')}</dt>
                <dd className="mt-1">
                  {item.product?.name ?? productMap[item.productId] ?? item.productId}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-sm">{t('inventory.color')}</dt>
                <dd className="mt-1">{item.color?.name ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-sm">{t('inventory.size')}</dt>
                <dd className="mt-1">{item.size?.name ?? sizeMap[item.sizeId] ?? item.sizeId}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-sm">{t('inventory.branch')}</dt>
                <dd className="mt-1">
                  {item.branch?.name ?? branchMap[item.branchId] ?? item.branchId}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-sm">{t('inventory.note')}</dt>
                <dd className="mt-1">{item.note ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-sm">{t('common.table.created')}</dt>
                <dd className="mt-1">{formatDate(item.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-sm">{t('common.table.updated')}</dt>
                <dd className="mt-1">{formatDate(item.updatedAt)}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Status & Condition */}
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>{t('inventory.status')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <StatusBadge meta={INVENTORY_STATUS_META[item.status]} />
              </div>
              <div>
                <label className="text-muted-foreground mb-1.5 block text-sm">
                  {t('inventory.changeStatus')}
                </label>
                <NativeSelect
                  value={item.status}
                  disabled={setStatusMutation.isPending}
                  onChange={(e) => {
                    const newStatus = e.target.value as InventoryItemStatus;
                    if (newStatus !== item.status) {
                      setStatusMutation.mutate({ id: item.id, status: newStatus });
                    }
                  }}
                  aria-label={t('inventory.changeStatus')}
                >
                  {statusOptions.map((opt) => (
                    <NativeSelectOption key={opt.value} value={opt.value}>
                      {opt.label}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('inventory.condition')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <StatusBadge meta={CONDITION_STATUS_META[item.conditionStatus]} />
              </div>
              <div>
                <label className="text-muted-foreground mb-1.5 block text-sm">
                  {t('inventory.changeCondition')}
                </label>
                <NativeSelect
                  value={item.conditionStatus}
                  disabled={setConditionMutation.isPending}
                  onChange={(e) => {
                    const newCondition = e.target.value as InventoryItemConditionStatus;
                    if (newCondition !== item.conditionStatus) {
                      setConditionMutation.mutate({ id: item.id, conditionStatus: newCondition });
                    }
                  }}
                  aria-label={t('inventory.changeCondition')}
                >
                  {conditionOptions.map((opt) => (
                    <NativeSelectOption key={opt.value} value={opt.value}>
                      {opt.label}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
