'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { SelectField } from '@/components/forms/select-field';
import { useT } from '@/i18n/locale-provider';
import type { Package, PackageInput } from '@/types/billing';

const schema = z.object({
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']),
  priceMonthly: z.coerce.number().min(0),
  priceYearly: z.coerce.number().min(0),
  maxBranches: z.coerce.number().int().min(0),
  maxUsers: z.coerce.number().int().min(0),
  maxProducts: z.coerce.number().int().min(0),
  maxInventoryItems: z.coerce.number().int().min(0),
});

type FormValues = z.input<typeof schema>;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold">{title}</h3>
      {children}
    </section>
  );
}

interface PackageFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: Package | null;
  loading?: boolean;
  onSubmit: (input: PackageInput) => void;
}

export function PackageForm({ open, onOpenChange, initial, loading, onSubmit }: PackageFormProps) {
  const { t } = useT();
  const [features, setFeatures] = useState<string[]>([]);
  const [featureDraft, setFeatureDraft] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'ACTIVE' },
  });

  useEffect(() => {
    if (!open) return;
    setFeatures(initial?.features ?? []);
    setFeatureDraft('');
    reset({
      code: initial?.code ?? '',
      name: initial?.name ?? '',
      description: initial?.description ?? '',
      status: initial?.status ?? 'ACTIVE',
      priceMonthly: initial?.priceMonthly ?? 0,
      priceYearly: initial?.priceYearly ?? 0,
      maxBranches: initial?.maxBranches ?? 0,
      maxUsers: initial?.maxUsers ?? 0,
      maxProducts: initial?.maxProducts ?? 0,
      maxInventoryItems: initial?.maxInventoryItems ?? 0,
    });
  }, [open, initial, reset]);

  const addFeature = () => {
    const v = featureDraft.trim();
    if (!v) return;
    setFeatures((prev) => [...prev, v]);
    setFeatureDraft('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {initial ? t('billing.packages.editPackage') : t('billing.packages.newPackage')}
          </DialogTitle>
        </DialogHeader>

        <form
          id="package-form"
          className="space-y-6"
          onSubmit={handleSubmit((values) =>
            onSubmit({
              code: values.code,
              name: values.name,
              description: values.description || null,
              status: values.status,
              priceMonthly: Number(values.priceMonthly),
              priceYearly: Number(values.priceYearly),
              maxBranches: Number(values.maxBranches),
              maxUsers: Number(values.maxUsers),
              maxProducts: Number(values.maxProducts),
              maxInventoryItems: Number(values.maxInventoryItems),
              features,
            }),
          )}
        >
          <Section title={t('billing.packages.basicInfo')}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label={t('billing.packages.code')}
                required
                error={errors.code ? t('common.field.required') : undefined}
                {...register('code')}
              />
              <Input
                label={t('billing.packages.name')}
                required
                error={errors.name ? t('common.field.required') : undefined}
                {...register('name')}
              />
            </div>
            <Textarea label={t('billing.packages.description')} {...register('description')} />
            <SelectField
              label={t('common.table.status')}
              options={[
                { value: 'ACTIVE', label: t('enums.activeStatus.ACTIVE') },
                { value: 'INACTIVE', label: t('enums.activeStatus.INACTIVE') },
              ]}
              {...register('status')}
            />
          </Section>

          <Separator />

          <Section title={t('billing.packages.pricing')}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label={t('billing.packages.priceMonthly')}
                type="number"
                min={0}
                error={errors.priceMonthly?.message}
                {...register('priceMonthly')}
              />
              <Input
                label={t('billing.packages.priceYearly')}
                type="number"
                min={0}
                error={errors.priceYearly?.message}
                {...register('priceYearly')}
              />
            </div>
          </Section>

          <Separator />

          <Section title={t('billing.packages.limits')}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label={t('billing.packages.maxBranches')} type="number" min={0} {...register('maxBranches')} />
              <Input label={t('billing.packages.maxUsers')} type="number" min={0} {...register('maxUsers')} />
              <Input label={t('billing.packages.maxProducts')} type="number" min={0} {...register('maxProducts')} />
              <Input
                label={t('billing.packages.maxInventoryItems')}
                type="number"
                min={0}
                {...register('maxInventoryItems')}
              />
            </div>
          </Section>

          <Separator />

          <Section title={t('billing.packages.features')}>
            <div className="flex flex-wrap gap-2">
              {features.length === 0 ? (
                <p className="text-muted-foreground text-sm">{t('billing.packages.noFeatures')}</p>
              ) : (
                features.map((f, i) => (
                  <span
                    key={`${f}-${i}`}
                    className="bg-muted inline-flex items-center gap-1 rounded-full py-1 pr-1 pl-3 text-sm"
                  >
                    {f}
                    <button
                      type="button"
                      className="hover:bg-background/80 rounded-full p-0.5"
                      onClick={() => setFeatures((prev) => prev.filter((_, idx) => idx !== i))}
                      aria-label={t('common.action.remove')}
                    >
                      <X className="size-3.5" />
                    </button>
                  </span>
                ))
              )}
            </div>
            <div className="flex items-center gap-2">
              <Input
                value={featureDraft}
                onChange={(e) => setFeatureDraft(e.target.value)}
                placeholder={t('billing.packages.featurePlaceholder')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addFeature();
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={addFeature}>
                <Plus className="size-4" />
                {t('billing.packages.addFeature')}
              </Button>
            </div>
          </Section>
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            {t('common.action.cancel')}
          </Button>
          <Button type="submit" form="package-form" loading={loading}>
            {initial ? t('common.action.saveChanges') : t('common.action.create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
