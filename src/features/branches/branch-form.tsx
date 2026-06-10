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
import type { Branch } from '@/types/models';
import type { BranchFormInput } from './use-branches-admin';

const schema = z.object({
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(255),
  phone: z.string().max(50).optional(),
  email: z.string().max(255).optional(),
  address: z.string().max(500).optional(),
});

type FormValues = z.input<typeof schema>;

interface BranchFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: Branch | null;
  loading?: boolean;
  onSubmit: (input: BranchFormInput) => void;
}

export function BranchForm({ open, onOpenChange, initial, loading, onSubmit }: BranchFormProps) {
  const { t } = useT();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { code: '', name: '', phone: '', email: '', address: '' },
  });

  useEffect(() => {
    if (open) {
      reset({
        code: initial?.code ?? '',
        name: initial?.name ?? '',
        phone: initial?.phone ?? '',
        email: initial?.email ?? '',
        address: initial?.address ?? '',
      });
    }
  }, [open, initial, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {initial ? t('branches.form.editTitle') : t('branches.form.createTitle')}
          </DialogTitle>
          <DialogDescription>
            {initial ? t('branches.form.editDesc') : t('branches.form.createDesc')}
          </DialogDescription>
        </DialogHeader>
        <form
          id="branch-form"
          onSubmit={handleSubmit((values) =>
            onSubmit({
              code: values.code,
              name: values.name,
              phone: values.phone || undefined,
              email: values.email || undefined,
              address: values.address || undefined,
            }),
          )}
          className="space-y-4"
        >
          <Input
            label={t('branches.code')}
            required
            error={errors.code ? t('branches.form.codeRequired') : undefined}
            {...register('code')}
          />
          <Input
            label={t('common.table.name')}
            required
            error={errors.name ? t('branches.form.nameRequired') : undefined}
            {...register('name')}
          />
          <Input label={t('branches.phone')} error={errors.phone?.message} {...register('phone')} />
          <Input label={t('branches.email')} error={errors.email?.message} {...register('email')} />
          <Textarea
            label={t('branches.address')}
            error={errors.address?.message}
            {...register('address')}
          />
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            {t('common.action.cancel')}
          </Button>
          <Button type="submit" form="branch-form" loading={loading}>
            {initial ? t('common.action.saveChanges') : t('common.action.create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
