'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { SelectField } from '@/components/forms/select-field';
import { useEnumOptions } from '@/hooks/use-enum-options';
import { INVENTORY_STATUS_META, CONDITION_STATUS_META } from '@/constants/enum-labels';
import { useT } from '@/i18n/locale-provider';
import { useTenantContext } from '@/hooks/use-tenant-context';
import type { InventoryCreateInput, InventoryCreatePayload } from './api';
import type { SelectOption } from '@/components/forms/select-field';

const schema = z.object({
  branchId: z.string().min(1),
  productId: z.string().min(1),
  sizeId: z.string().min(1),
  serialCode: z.string().min(1).max(255),
  barcode: z.string().max(255).optional().or(z.literal('')),
  status: z.string().min(1),
  conditionStatus: z.string().min(1),
  note: z.string().optional().or(z.literal('')),
});

type FormValues = z.input<typeof schema>;

interface InventoryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loading?: boolean;
  branchOptions: SelectOption[];
  productOptions: SelectOption[];
  sizeOptions: SelectOption[];
  onSubmit: (input: InventoryCreatePayload) => void;
}

export function InventoryForm({
  open,
  onOpenChange,
  loading,
  branchOptions,
  productOptions,
  sizeOptions,
  onSubmit,
}: InventoryFormProps) {
  const { t } = useT();
  const { branchId: activeBranchId } = useTenantContext();

  const statusOptions = useEnumOptions(INVENTORY_STATUS_META);
  const conditionOptions = useEnumOptions(CONDITION_STATUS_META);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      branchId: activeBranchId ?? '',
      productId: '',
      sizeId: '',
      serialCode: '',
      barcode: '',
      status: 'AVAILABLE',
      conditionStatus: 'NEW',
      note: '',
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        branchId: activeBranchId ?? '',
        productId: '',
        sizeId: '',
        serialCode: '',
        barcode: '',
        status: 'AVAILABLE',
        conditionStatus: 'NEW',
        note: '',
      });
    }
  }, [open, activeBranchId, reset]);

  function handleFormSubmit(values: FormValues) {
    onSubmit({
      branchId: values.branchId,
      productId: values.productId,
      sizeId: values.sizeId,
      serialCode: values.serialCode,
      barcode: values.barcode || undefined,
      status: values.status as InventoryCreateInput['status'],
      conditionStatus: values.conditionStatus as InventoryCreateInput['conditionStatus'],
      note: values.note || undefined,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('inventory.form.createTitle')}</DialogTitle>
        </DialogHeader>
        <form id="inventory-form" onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <SelectField
            label={t('inventory.branch')}
            required
            error={errors.branchId?.message}
            options={branchOptions}
            placeholder={t('inventory.form.selectBranch')}
            id="branchId"
            {...register('branchId')}
          />
          <SelectField
            label={t('inventory.product')}
            required
            error={errors.productId?.message}
            options={productOptions}
            placeholder={t('inventory.form.selectProduct')}
            id="productId"
            {...register('productId')}
          />
          <SelectField
            label={t('inventory.size')}
            required
            error={errors.sizeId?.message}
            options={sizeOptions}
            placeholder={t('inventory.form.selectSize')}
            id="sizeId"
            {...register('sizeId')}
          />
          <Input
            label={t('inventory.serial')}
            required
            error={errors.serialCode?.message}
            placeholder={t('inventory.form.serialPlaceholder')}
            {...register('serialCode')}
          />
          <Input
            label={t('inventory.barcode')}
            error={errors.barcode?.message}
            placeholder={t('inventory.form.barcodePlaceholder')}
            {...register('barcode')}
          />
          <SelectField
            label={t('inventory.status')}
            required
            error={errors.status?.message}
            options={statusOptions}
            id="status"
            {...register('status')}
          />
          <SelectField
            label={t('inventory.condition')}
            required
            error={errors.conditionStatus?.message}
            options={conditionOptions}
            id="conditionStatus"
            {...register('conditionStatus')}
          />
          <Textarea
            label={t('inventory.note')}
            error={errors.note?.message}
            placeholder={t('inventory.form.notePlaceholder')}
            rows={3}
            {...register('note')}
          />
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            {t('common.action.cancel')}
          </Button>
          <Button type="submit" form="inventory-form" loading={loading}>
            {t('common.action.create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
