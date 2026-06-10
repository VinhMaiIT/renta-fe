'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { branchHeader, http } from '@/lib/api/http';
import { useTenantContext } from '@/hooks/use-tenant-context';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Spinner } from '@/components/ui/spinner';
import { EmptyState, ErrorState } from '@/components/common/states';
import { formatCurrency } from '@/lib/format';
import { useT } from '@/i18n/locale-provider';
import { cn } from '@/lib/utils';
import type { InventoryItem, Product } from '@/types/models';
import type { PaginatedResponse } from '@/types/api';
import type { WizardLineItem, WizardState } from './wizard-state';

interface StepInventoryProps {
  state: WizardState;
  update: (patch: Partial<WizardState>) => void;
}

export function StepInventory({ state, update }: StepInventoryProps) {
  const { t } = useT();
  const { tenantId, branchId } = useTenantContext();
  const [search, setSearch] = useState('');

  const inventoryQuery = useQuery({
    queryKey: ['wizard-inventory', tenantId, branchId],
    enabled: Boolean(tenantId) && Boolean(branchId),
    queryFn: () =>
      http.get<PaginatedResponse<InventoryItem>>('/tenant/inventory-items', {
        params: { status: 'AVAILABLE', pageSize: 100 },
        ...branchHeader(branchId),
      }),
  });

  const productsQuery = useQuery({
    queryKey: ['wizard-products', tenantId],
    enabled: Boolean(tenantId),
    queryFn: () =>
      http.get<PaginatedResponse<Product>>('/tenant/products', {
        params: { pageSize: 100 },
      }),
  });

  const productMap = useMemo(() => {
    const map = new Map<string, Product>();
    for (const product of productsQuery.data?.items ?? []) map.set(product.id, product);
    return map;
  }, [productsQuery.data]);

  const selectedById = useMemo(() => {
    const map = new Map<string, WizardLineItem>();
    for (const item of state.items) map.set(item.inventoryItemId, item);
    return map;
  }, [state.items]);

  const items = inventoryQuery.data?.items ?? [];
  const filtered = search
    ? items.filter(
        (i) =>
          i.serialCode.toLowerCase().includes(search.toLowerCase()) ||
          (i.barcode ?? '').toLowerCase().includes(search.toLowerCase()),
      )
    : items;

  const toggle = (inv: InventoryItem) => {
    if (selectedById.has(inv.id)) {
      update({ items: state.items.filter((i) => i.inventoryItemId !== inv.id) });
    } else {
      const product = productMap.get(inv.productId);
      const line: WizardLineItem = {
        inventoryItemId: inv.id,
        productId: inv.productId,
        serialCode: inv.serialCode,
        price: product?.rentalPrice ?? 0,
      };
      update({ items: [...state.items, line] });
    }
  };

  const setPrice = (inventoryItemId: string, price: number) => {
    update({
      items: state.items.map((i) => (i.inventoryItemId === inventoryItemId ? { ...i, price } : i)),
    });
  };

  if (!branchId) {
    return (
      <ErrorState
        title={t('rentalOrders.wizard.noBranch')}
        description={t('rentalOrders.wizard.noBranchDesc')}
      />
    );
  }

  if (inventoryQuery.isError) {
    return (
      <ErrorState
        description={
          inventoryQuery.error instanceof Error ? inventoryQuery.error.message : undefined
        }
        onRetry={() => inventoryQuery.refetch()}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <Input
          className="max-w-xs"
          placeholder={t('rentalOrders.wizard.selectItems')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span className="text-muted-foreground text-sm">
          {t('rentalOrders.wizard.selected', { count: state.items.length })}
        </span>
      </div>

      {inventoryQuery.isLoading || productsQuery.isLoading ? (
        <div className="text-muted-foreground flex items-center gap-2 p-4 text-sm">
          <Spinner /> {t('rentalOrders.wizard.loadingInventory')}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title={t('rentalOrders.wizard.noAvailable')}
          description={t('rentalOrders.wizard.noAvailableDesc')}
        />
      ) : (
        <div className="flex max-h-[420px] flex-col gap-2 overflow-y-auto">
          {filtered.map((inv) => {
            const selected = selectedById.get(inv.id);
            const product = productMap.get(inv.productId);
            return (
              <Card
                key={inv.id}
                size="sm"
                className={cn(
                  'flex-row flex-wrap items-center gap-3 px-4 py-3',
                  selected && 'ring-primary ring-2',
                )}
              >
                <Checkbox
                  checked={Boolean(selected)}
                  onCheckedChange={() => toggle(inv)}
                  aria-label={t('rentalOrders.wizard.selectAriaLabel', { serialCode: inv.serialCode })}
                />
                <button type="button" onClick={() => toggle(inv)} className="flex-1 text-left">
                  <p className="font-medium">{inv.serialCode}</p>
                  <p className="text-muted-foreground text-xs">
                    {product?.name ?? inv.productId}
                    {' · '}
                    {t('rentalOrders.wizard.defaultPrice')}{' '}
                    {formatCurrency(product?.rentalPrice ?? 0)}
                  </p>
                </button>
                {selected ? (
                  <Input
                    type="number"
                    min={0}
                    size="sm"
                    className="w-32"
                    aria-label={t('rentalOrders.wizard.priceAriaLabel', { serialCode: inv.serialCode })}
                    value={selected.price}
                    onChange={(e) => setPrice(inv.id, Number(e.target.value) || 0)}
                  />
                ) : null}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
