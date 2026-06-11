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
import type { Color } from '@/types/models';
import type { ColorInput } from './api';

const schema = z.object({
  name: z.string().min(1).max(100),
  hex: z.string().min(1),
});

type FormValues = z.input<typeof schema>;

interface ColorFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: Color | null;
  loading?: boolean;
  onSubmit: (input: ColorInput) => void;
}

export function ColorForm({ open, onOpenChange, initial, loading, onSubmit }: ColorFormProps) {
  const { t } = useT();
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', hex: '#000000' },
  });

  useEffect(() => {
    if (open) reset({ name: initial?.name ?? '', hex: initial?.hex ?? '#000000' });
  }, [open, initial, reset]);

  const hex = watch('hex');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {initial ? t('colors.form.editTitle') : t('colors.form.createTitle')}
          </DialogTitle>
        </DialogHeader>
        <form
          id="color-form"
          onSubmit={(e) => {
            // Stop the submit from bubbling (via the React portal tree) to a parent
            // form — e.g. the product form this dialog can be opened from.
            e.stopPropagation();
            void handleSubmit((values) => onSubmit({ name: values.name, hex: values.hex }))(e);
          }}
          className="space-y-4"
        >
          <div className="flex items-end gap-3">
            <div>
              <span className="text-foreground mb-1 block text-sm font-medium">
                {t('colors.hex')}
              </span>
              <input
                type="color"
                aria-label={t('colors.hex')}
                className="border-input size-9 cursor-pointer rounded-md border bg-transparent p-1"
                {...register('hex')}
              />
            </div>
            <div className="flex-1">
              <Input
                label={t('colors.name')}
                required
                error={errors.name ? t('colors.form.nameRequired') : undefined}
                {...register('name')}
              />
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span
              className="border-border size-5 rounded-full border"
              style={{ backgroundColor: hex }}
            />
            <span className="text-muted-foreground font-mono text-xs">{hex}</span>
          </div>
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            {t('common.action.cancel')}
          </Button>
          <Button type="submit" form="color-form" loading={loading}>
            {initial ? t('common.action.saveChanges') : t('common.action.create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
