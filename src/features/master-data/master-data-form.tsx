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
import type { MasterInput, MasterRecord } from './api';

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  order: z.coerce.number().int().min(0),
});

type FormValues = z.input<typeof schema>;

interface MasterDataFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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
            {initial ? `Edit ${singular.toLowerCase()}` : `New ${singular.toLowerCase()}`}
          </DialogTitle>
          <DialogDescription>
            {initial ? 'Update the details below.' : `Create a new ${singular.toLowerCase()}.`}
          </DialogDescription>
        </DialogHeader>
        <form
          id="master-data-form"
          onSubmit={handleSubmit((values) =>
            onSubmit({ name: values.name, order: Number(values.order) }),
          )}
          className="space-y-4"
        >
          <Input label="Name" required error={errors.name?.message} {...register('name')} />
          <Input
            label="Sort order"
            type="number"
            min={0}
            error={errors.order?.message}
            {...register('order')}
          />
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" form="master-data-form" loading={loading}>
            {initial ? 'Save changes' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
