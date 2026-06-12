'use client';

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
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
import { Textarea } from '@/components/ui/textarea';
import { SelectMenu } from '@/components/forms/select-menu';
import { useEnumOptions } from '@/hooks/use-enum-options';
import { useColorOptions } from '@/features/colors/use-colors';
import { INVENTORY_STATUS_META, CONDITION_STATUS_META } from '@/constants/enum-labels';
import { useT } from '@/i18n/locale-provider';
import { useTenantContext } from '@/hooks/use-tenant-context';
import type { InventoryCreateInput, InventoryCreatePayload } from './api';
import type { SelectOption } from '@/components/forms/select-field';

const schema = z.object({
  branchId: z.string().min(1),
  productId: z.string().min(1),
  sizeId: z.string().min(1),
  colorId: z.string().min(1),
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
  const colorOptions = useColorOptions().map((c) => ({ value: c.id, label: c.name }));

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      branchId: activeBranchId ?? '',
      productId: '',
      sizeId: '',
      colorId: '',
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
        colorId: '',
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
      colorId: values.colorId,
      status: values.status as InventoryCreateInput['status'],
      conditionStatus: values.conditionStatus as InventoryCreateInput['conditionStatus'],
      note: values.note || undefined,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{t('inventory.form.createTitle')}</DialogTitle>
        </DialogHeader>
        <form id="inventory-form" onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {(
              [
                {
                  name: 'branchId',
                  label: t('inventory.branch'),
                  options: branchOptions,
                  placeholder: t('inventory.form.selectBranch'),
                },
                {
                  name: 'productId',
                  label: t('inventory.product'),
                  options: productOptions,
                  placeholder: t('inventory.form.selectProduct'),
                },
                {
                  name: 'sizeId',
                  label: t('inventory.size'),
                  options: sizeOptions,
                  placeholder: t('inventory.form.selectSize'),
                },
                {
                  name: 'colorId',
                  label: t('inventory.color'),
                  options: colorOptions,
                  placeholder: t('inventory.form.selectColor'),
                },
                {
                  name: 'status',
                  label: t('inventory.status'),
                  options: statusOptions,
                },
                {
                  name: 'conditionStatus',
                  label: t('inventory.condition'),
                  options: conditionOptions,
                },
              ] as const
            ).map((f) => (
              <Controller
                key={f.name}
                control={control}
                name={f.name}
                render={({ field }) => (
                  <SelectMenu
                    label={f.label}
                    required
                    id={f.name}
                    options={f.options}
                    placeholder={'placeholder' in f ? f.placeholder : undefined}
                    error={errors[f.name]?.message}
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                  />
                )}
              />
            ))}
          </div>
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
