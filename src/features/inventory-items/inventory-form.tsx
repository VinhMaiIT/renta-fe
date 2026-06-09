'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { SelectField } from '@/components/forms/select-field';
import { INVENTORY_STATUS_META, CONDITION_STATUS_META, toOptions } from '@/constants/enum-labels';
import { useTenantContext } from '@/hooks/use-tenant-context';
import type { InventoryCreateInput } from './api';
import type { SelectOption } from '@/components/forms/select-field';

const schema = z.object({
  branchId: z.string().min(1, 'Branch is required'),
  productId: z.string().min(1, 'Product is required'),
  sizeId: z.string().min(1, 'Size is required'),
  serialCode: z.string().min(1, 'Serial code is required').max(255),
  barcode: z.string().max(255).optional().or(z.literal('')),
  status: z.string().min(1, 'Status is required'),
  conditionStatus: z.string().min(1, 'Condition is required'),
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
  onSubmit: (input: Omit<InventoryCreateInput, 'tenantId'>) => void;
}

const statusOptions = toOptions(INVENTORY_STATUS_META);
const conditionOptions = toOptions(CONDITION_STATUS_META);

export function InventoryForm({
  open,
  onOpenChange,
  loading,
  branchOptions,
  productOptions,
  sizeOptions,
  onSubmit,
}: InventoryFormProps) {
  const { branchId: activeBranchId } = useTenantContext();

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
          <DialogTitle>New inventory item</DialogTitle>
          <DialogDescription>Add a new inventory item to track.</DialogDescription>
        </DialogHeader>
        <form id="inventory-form" onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <SelectField
            label="Branch"
            required
            error={errors.branchId?.message}
            options={branchOptions}
            placeholder="Select branch…"
            id="branchId"
            {...register('branchId')}
          />
          <SelectField
            label="Product"
            required
            error={errors.productId?.message}
            options={productOptions}
            placeholder="Select product…"
            id="productId"
            {...register('productId')}
          />
          <SelectField
            label="Size"
            required
            error={errors.sizeId?.message}
            options={sizeOptions}
            placeholder="Select size…"
            id="sizeId"
            {...register('sizeId')}
          />
          <Input
            label="Serial code"
            required
            error={errors.serialCode?.message}
            placeholder="e.g. SN-001"
            {...register('serialCode')}
          />
          <Input
            label="Barcode"
            error={errors.barcode?.message}
            placeholder="Optional barcode"
            {...register('barcode')}
          />
          <SelectField
            label="Status"
            required
            error={errors.status?.message}
            options={statusOptions}
            id="status"
            {...register('status')}
          />
          <SelectField
            label="Condition"
            required
            error={errors.conditionStatus?.message}
            options={conditionOptions}
            id="conditionStatus"
            {...register('conditionStatus')}
          />
          <Textarea
            label="Note"
            error={errors.note?.message}
            placeholder="Optional note…"
            rows={3}
            {...register('note')}
          />
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" form="inventory-form" loading={loading}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
