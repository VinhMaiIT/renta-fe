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
import { useT } from '@/i18n/locale-provider';
import type { MasterInput, MasterRecord } from './api';

const schema = z.object({
  name: z.string().min(1).max(255),
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
    defaultValues: { name: '' },
  });

  useEffect(() => {
    if (open) reset({ name: initial?.name ?? '' });
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
        </DialogHeader>
        <form
          id="master-data-form"
          onSubmit={handleSubmit((values) => onSubmit({ name: values.name }))}
          className="space-y-4"
        >
          <Input
            label={t('masterData.name')}
            required
            error={errors.name ? t('common.field.required') : undefined}
            {...register('name')}
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
