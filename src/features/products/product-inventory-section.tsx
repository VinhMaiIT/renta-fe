'use client';

import { useMemo, useState } from 'react';
import { Minus, Palette, Plus, Ruler, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import type { SelectOption } from '@/components/forms/select-field';
import { ColorForm } from '@/features/colors/color-form';
import { useCreateColor } from '@/features/colors/use-colors';
import { useT } from '@/i18n/locale-provider';
import type { Color, Id, ProductInventoryItem } from '@/types/models';
import { AddVariantDialog, type VariantRow } from './add-variant-dialog';
import { AddSizeDialog } from './add-size-dialog';
import { useAddInventoryItems, useDeleteInventoryItems } from './use-products';

interface ProductInventorySectionProps {
  productId: Id;
  items: ProductInventoryItem[];
  colorList: Color[];
  sizeOptions: SelectOption[];
  branchOptions: SelectOption[];
}

interface Group {
  key: string;
  colorId: string;
  sizeId: string;
  branchId: string;
  colorName: string;
  sizeName: string;
  branchName: string;
  /** Item ids that can be deleted (not currently RENTED). */
  deletableIds: Id[];
  quantity: number;
}

/**
 * Edit-mode stock manager: every add / increment / decrement / delete hits the
 * inventory API directly and refetches — no diff-on-save.
 */
export function ProductInventorySection({
  productId,
  items,
  colorList,
  sizeOptions,
  branchOptions,
}: ProductInventorySectionProps) {
  const { t } = useT();
  const add = useAddInventoryItems(productId);
  const remove = useDeleteInventoryItems(productId);
  const createColor = useCreateColor();

  const [addOpen, setAddOpen] = useState(false);
  const [colorFormOpen, setColorFormOpen] = useState(false);
  const [sizeFormOpen, setSizeFormOpen] = useState(false);
  const [deleting, setDeleting] = useState<Group | null>(null);

  const colorById = useMemo(() => new Map(colorList.map((c) => [c.id, c])), [colorList]);
  const busy = add.isPending || remove.isPending;

  const groups = useMemo<Group[]>(() => {
    const map = new Map<string, Group>();
    for (const item of items) {
      const colorId = item.color?.id ?? '';
      const sizeId = item.size?.id ?? '';
      const branchId = item.branch?.id ?? '';
      if (!colorId || !sizeId || !branchId) continue;
      const key = `${colorId}::${sizeId}::${branchId}`;
      let group = map.get(key);
      if (!group) {
        group = {
          key,
          colorId,
          sizeId,
          branchId,
          colorName: item.color?.name ?? '',
          sizeName: item.size?.name ?? '',
          branchName: item.branch?.name ?? '',
          deletableIds: [],
          quantity: 0,
        };
        map.set(key, group);
      }
      group.quantity += 1;
      if (item.status !== 'RENTED') group.deletableIds.push(item.id);
    }
    return [...map.values()];
  }, [items]);

  const increment = (g: Group) =>
    add.mutate([{ branchId: g.branchId, colorId: g.colorId, sizeId: g.sizeId, quantity: 1 }]);

  const decrement = (g: Group) => {
    const id = g.deletableIds.at(-1);
    if (id) remove.mutate([id]);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle className="text-primary">{t('products.form.colorsSizes')}</CardTitle>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => setColorFormOpen(true)}>
            <Palette className="size-3.5" />
            {t('products.form.newColor')}
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => setSizeFormOpen(true)}>
            <Ruler className="size-3.5" />
            {t('products.form.newSize')}
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={
              colorList.length === 0 || sizeOptions.length === 0 || branchOptions.length === 0
            }
            onClick={() => setAddOpen(true)}
          >
            <Plus className="size-3.5" />
            {t('products.form.addVariant')}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {groups.length === 0 ? (
          <p className="text-muted-foreground text-sm">{t('products.form.variantsEmpty')}</p>
        ) : (
          <div className="border-border overflow-hidden rounded-md border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">
                    {t('products.form.colorColumn')}
                  </th>
                  <th className="px-3 py-2 text-left font-medium">
                    {t('products.form.sizeColumn')}
                  </th>
                  <th className="px-3 py-2 text-left font-medium">
                    {t('products.form.branchColumn')}
                  </th>
                  <th className="px-3 py-2 text-center font-medium">
                    {t('products.form.quantityColumn')}
                  </th>
                  <th className="w-10 px-3 py-2" />
                </tr>
              </thead>
              <tbody className="divide-border divide-y">
                {groups.map((g) => {
                  const hex = colorById.get(g.colorId)?.hex;
                  return (
                    <tr key={g.key}>
                      <td className="px-3 py-2">
                        <span className="flex items-center gap-2 font-medium">
                          <span
                            className="border-border size-4 shrink-0 rounded-full border"
                            style={hex ? { backgroundColor: hex } : undefined}
                          />
                          {g.colorName}
                        </span>
                      </td>
                      <td className="px-3 py-2">{g.sizeName}</td>
                      <td className="px-3 py-2">{g.branchName}</td>
                      <td className="px-3 py-2">
                        <div className="flex items-center justify-center gap-1.5">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon-sm"
                            disabled={busy || g.deletableIds.length === 0}
                            onClick={() => decrement(g)}
                            aria-label={t('common.action.remove')}
                          >
                            <Minus className="size-3.5" />
                          </Button>
                          <span className="w-8 text-center font-medium tabular-nums">
                            {g.quantity}
                          </span>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon-sm"
                            disabled={busy}
                            onClick={() => increment(g)}
                            aria-label={t('common.action.add')}
                          >
                            <Plus className="size-3.5" />
                          </Button>
                        </div>
                      </td>
                      <td className="px-2 py-2 text-right">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="text-destructive hover:text-destructive"
                          disabled={busy || g.deletableIds.length === 0}
                          onClick={() => setDeleting(g)}
                          aria-label={t('common.action.remove')}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>

      <AddVariantDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        colorOptions={colorList.map((c) => ({ value: c.id, label: c.name }))}
        sizeOptions={sizeOptions}
        branchOptions={branchOptions}
        existingKeys={groups.map((g) => g.key)}
        onAdd={(rows: VariantRow[]) => add.mutate(rows)}
      />

      <ColorForm
        open={colorFormOpen}
        onOpenChange={setColorFormOpen}
        loading={createColor.isPending}
        onSubmit={(input) =>
          createColor.mutate(input, { onSuccess: () => setColorFormOpen(false) })
        }
      />

      <AddSizeDialog open={sizeFormOpen} onOpenChange={setSizeFormOpen} />

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={t('common.confirm.deleteTitle', {
          item: t('products.form.colorsSizes').toLowerCase(),
        })}
        description={
          deleting ? `${deleting.colorName} · ${deleting.sizeName} · ${deleting.branchName}` : null
        }
        destructive
        confirmText={t('common.action.delete')}
        loading={remove.isPending}
        onConfirm={() => {
          if (!deleting) return;
          remove.mutate(deleting.deletableIds, { onSuccess: () => setDeleting(null) });
        }}
      />
    </Card>
  );
}
