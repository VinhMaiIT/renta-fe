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
import type { Customer } from '@/types/models';
import type { CustomerFormInput } from './use-customers';

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  phone: z.string().min(1, 'Phone is required').max(50),
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
          <DialogTitle>{initial ? 'Edit customer' : 'New customer'}</DialogTitle>
          <DialogDescription>
            {initial ? 'Update the customer details below.' : 'Create a new customer.'}
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
          <Input label="Name" required error={errors.name?.message} {...register('name')} />
          <Input label="Phone" required error={errors.phone?.message} {...register('phone')} />
          <Input label="Address" error={errors.address?.message} {...register('address')} />
          <Textarea label="Note" error={errors.note?.message} {...register('note')} />
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" form="customer-form" loading={loading}>
            {initial ? 'Save changes' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
