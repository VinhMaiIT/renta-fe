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
import { useT } from '@/i18n/locale-provider';
import type { MasterInput, MasterRecord } from './api';

const schema = z.object({
  name: z.string().min(1).max(255),
  order: z.coerce.number().int().min(0),
});

type FormValues = z.input<typeof schema>;

interface MasterDataFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Translated singular noun for this resource (e.g. "size"). */
  singular: string;
  initial?: MasterRecord | null;
  loading?: boolean;
  onSubmit: (input: MasterInput) => void;
}

export function MasterDataForm({
  open,
  onOpenChange,
  singular,
  initial,
  loading,
  onSubmit,
}: MasterDataFormProps) {
  const { t } = useT();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', order: 0 },
  });

  useEffect(() => {
    if (open) reset({ name: initial?.name ?? '', order: initial?.order ?? 0 });
  }, [open, initial, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {initial
              ? t('masterData.editItem', { item: singular })
              : t('masterData.newItem', { item: singular })}
          </DialogTitle>
          <DialogDescription>
            {initial ? t('masterData.editDesc') : t('masterData.createDesc', { item: singular })}
          </DialogDescription>
        </DialogHeader>
        <form
          id="master-data-form"
          onSubmit={handleSubmit((values) =>
            onSubmit({ name: values.name, order: Number(values.order) }),
          )}
          className="space-y-4"
        >
          <Input
            label={t('masterData.name')}
            required
            error={errors.name ? t('common.field.required') : undefined}
            {...register('name')}
          />
          <Input
            label={t('masterData.sortOrder')}
            type="number"
            min={0}
            error={errors.order?.message}
            {...register('order')}
          />
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            {t('common.action.cancel')}
          </Button>
          <Button type="submit" form="master-data-form" loading={loading}>
            {initial ? t('common.action.saveChanges') : t('common.action.create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
