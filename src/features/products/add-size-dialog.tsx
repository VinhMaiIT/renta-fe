'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormErrorMessage } from '@/components/ui/form-error-message';
import { useMasterData } from '@/features/master-data/use-master-data';
import { useT } from '@/i18n/locale-provider';

interface AddSizeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called with the new size id after it's created. */
  onCreated?: (sizeId: string) => void;
}

/** Quick-create a size without leaving the product screen. */
export function AddSizeDialog({ open, onOpenChange, onCreated }: AddSizeDialogProps) {
  const { t } = useT();
  const { useCreate } = useMasterData('sizes');
  const create = useCreate();
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setName('');
      setError(null);
    }
  }, [open]);

  function handleCreate() {
    if (!name.trim()) {
      setError(t('products.form.sizeNameRequired'));
      return;
    }
    create.mutate(
      { name: name.trim() },
      {
        onSuccess: (size) => {
          onCreated?.(size.id);
          onOpenChange(false);
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('products.form.newSize')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            label={t('products.form.sizeName')}
            required
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError(null);
            }}
          />
          {error && <FormErrorMessage error={error} />}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.action.cancel')}
          </Button>
          <Button type="button" onClick={handleCreate} loading={create.isPending}>
            {t('common.action.create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
