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
import { useT } from '@/i18n/locale-provider';
import type { Customer } from '@/types/models';
import type { CustomerFormInput } from './use-customers';

const schema = z.object({
  name: z.string().min(1).max(255),
  phone: z.string().min(1).max(50),
  address: z.string().max(500).optional(),
  note: z.string().max(1000).optional(),
});

type FormValues = z.input<typeof schema>;

interface CustomerFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: Customer | null;
  loading?: boolean;
  onSubmit: (input: CustomerFormInput) => void;
}

export function CustomerForm({
  open,
  onOpenChange,
  initial,
  loading,
  onSubmit,
}: CustomerFormProps) {
  const { t } = useT();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', phone: '', address: '', note: '' },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: initial?.name ?? '',
        phone: initial?.phone ?? '',
        address: initial?.address ?? '',
        note: initial?.note ?? '',
      });
    }
  }, [open, initial, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {initial ? t('customers.form.editTitle') : t('customers.form.createTitle')}
          </DialogTitle>
          <DialogDescription>
            {initial ? t('customers.form.editDesc') : t('customers.form.createDesc')}
          </DialogDescription>
        </DialogHeader>
        <form
          id="customer-form"
          onSubmit={handleSubmit((values) =>
            onSubmit({
              name: values.name,
              phone: values.phone,
              address: values.address || undefined,
              note: values.note || undefined,
            }),
          )}
          className="space-y-4"
        >
          <Input
            label={t('common.table.name')}
            required
            error={errors.name ? t('customers.form.nameRequired') : undefined}
            {...register('name')}
          />
          <Input
            label={t('customers.phone')}
            required
            error={errors.phone ? t('customers.form.phoneRequired') : undefined}
            {...register('phone')}
          />
          <Input
            label={t('customers.address')}
            error={errors.address?.message}
            {...register('address')}
          />
          <Textarea
            label={t('customers.note')}
            error={errors.note?.message}
            {...register('note')}
          />
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            {t('common.action.cancel')}
          </Button>
          <Button type="submit" form="customer-form" loading={loading}>
            {initial ? t('common.action.saveChanges') : t('common.action.create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
