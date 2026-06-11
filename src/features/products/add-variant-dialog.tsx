'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { SelectField, type SelectOption } from '@/components/forms/select-field';
import { FormErrorMessage } from '@/components/ui/form-error-message';
import { useT } from '@/i18n/locale-provider';

export interface VariantRow {
  colorId: string;
  sizeId: string;
  branchId: string;
  quantity: number;
}

interface AddVariantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  colorOptions: SelectOption[];
  sizeOptions: SelectOption[];
  branchOptions: SelectOption[];
  /** Keys (`colorId::sizeId::branchId`) already in the grid — skipped to avoid duplicate rows. */
  existingKeys: string[];
  onAdd: (rows: VariantRow[]) => void;
}

export function AddVariantDialog({
  open,
  onOpenChange,
  colorOptions,
  sizeOptions,
  branchOptions,
  existingKeys,
  onAdd,
}: AddVariantDialogProps) {
  const { t } = useT();
  const [colorId, setColorId] = useState('');
  const [sizeIds, setSizeIds] = useState<string[]>([]);
  const [branchIds, setBranchIds] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setColorId('');
      setSizeIds([]);
      // Default to the only branch when the tenant has a single one.
      setBranchIds(branchOptions.length === 1 ? [branchOptions[0].value] : []);
      setQuantity(1);
      setError(null);
    }
  }, [open, branchOptions]);

  const toggleSize = (id: string) =>
    setSizeIds((cur) => (cur.includes(id) ? cur.filter((s) => s !== id) : [...cur, id]));
  const toggleBranch = (id: string) =>
    setBranchIds((cur) => (cur.includes(id) ? cur.filter((b) => b !== id) : [...cur, id]));

  function handleAdd() {
    if (!colorId) {
      setError(t('products.form.colorRequired'));
      return;
    }
    if (sizeIds.length === 0) {
      setError(t('products.form.sizesRequired'));
      return;
    }
    if (branchIds.length === 0) {
      setError(t('products.form.branchesRequired'));
      return;
    }
    const existing = new Set(existingKeys);
    const qty = Math.max(0, Math.trunc(quantity));
    const rows: VariantRow[] = [];
    for (const branchId of branchIds) {
      for (const sizeId of sizeIds) {
        if (existing.has(`${colorId}::${sizeId}::${branchId}`)) continue;
        rows.push({ colorId, sizeId, branchId, quantity: qty });
      }
    }
    if (rows.length > 0) onAdd(rows);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('products.form.addVariantTitle')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <SelectField
            label={t('products.form.colorColumn')}
            required
            value={colorId}
            onChange={(e) => {
              setColorId(e.target.value);
              setError(null);
            }}
            placeholder={t('products.form.selectColor')}
            options={colorOptions}
          />
          <div>
            <span className="text-foreground mb-1.5 block text-sm font-medium">
              {t('products.form.selectSizes')} <span className="text-destructive">*</span>
            </span>
            {sizeOptions.length === 0 ? (
              <p className="text-muted-foreground text-sm">{t('products.form.noSizes')}</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {sizeOptions.map((opt) => {
                  const checked = sizeIds.includes(opt.value);
                  return (
                    <label
                      key={opt.value}
                      className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition-colors ${
                        checked ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'
                      }`}
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => {
                          toggleSize(opt.value);
                          setError(null);
                        }}
                      />
                      {opt.label}
                    </label>
                  );
                })}
              </div>
            )}
          </div>
          <div>
            <span className="text-foreground mb-1.5 block text-sm font-medium">
              {t('products.form.selectBranches')} <span className="text-destructive">*</span>
            </span>
            {branchOptions.length === 0 ? (
              <p className="text-muted-foreground text-sm">{t('products.form.noBranches')}</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {branchOptions.map((opt) => {
                  const checked = branchIds.includes(opt.value);
                  // A single branch is the default and can't be unticked.
                  const locked = branchOptions.length === 1;
                  return (
                    <label
                      key={opt.value}
                      className={`flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition-colors ${
                        locked ? 'cursor-default' : 'cursor-pointer'
                      } ${
                        checked ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'
                      }`}
                    >
                      <Checkbox
                        checked={checked}
                        disabled={locked}
                        onCheckedChange={() => {
                          if (locked) return;
                          toggleBranch(opt.value);
                          setError(null);
                        }}
                      />
                      {opt.label}
                    </label>
                  );
                })}
              </div>
            )}
          </div>
          <Input
            label={t('products.form.quantity')}
            type="number"
            min={0}
            className="w-32"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
          />
          {error && <FormErrorMessage error={error} />}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.action.cancel')}
          </Button>
          <Button type="button" onClick={handleAdd}>
            {t('common.action.add')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
