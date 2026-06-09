'use client';

import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { SelectField } from '@/components/forms/select-field';
import { FormLabel } from '@/components/ui/form-label';
import { FormErrorMessage } from '@/components/ui/form-error-message';
import type { Product } from '@/types/models';
import type { ProductFormInput } from './use-products';
import type { ProductLookups } from './use-products';

const imageSchema = z.object({
  url: z.string().min(1, 'URL is required'),
  sortOrder: z.coerce.number().int().min(0).optional(),
  isPrimary: z.boolean().optional(),
});

const schema = z.object({
  productTypeId: z.string().min(1, 'Product type is required'),
  productGroupId: z.string().min(1, 'Product group is required'),
  unitId: z.string().min(1, 'Unit is required'),
  code: z.string().min(1, 'Code is required').max(100),
  name: z.string().min(1, 'Name is required').max(255),
  description: z.string().max(2000).optional(),
  rentalPrice: z.coerce.number().min(0, 'Rental price must be ≥ 0'),
  depositPrice: z.coerce.number().min(0, 'Deposit price must be ≥ 0'),
  sizeIds: z.array(z.string()).optional(),
  images: z.array(imageSchema).optional(),
});

type FormValues = z.input<typeof schema>;

interface ProductFormProps {
  initial?: Product | null;
  lookups: ProductLookups;
  loading?: boolean;
  onSubmit: (input: ProductFormInput) => void;
  onCancel?: () => void;
}

export function ProductForm({ initial, lookups, loading, onSubmit, onCancel }: ProductFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    getValues,
    formState: { errors },
    control,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      productTypeId: '',
      productGroupId: '',
      unitId: '',
      code: '',
      name: '',
      description: '',
      rentalPrice: 0,
      depositPrice: 0,
      sizeIds: [],
      images: [],
    },
  });

  const {
    fields: imageFields,
    append: appendImage,
    remove: removeImage,
  } = useFieldArray({
    control,
    name: 'images',
  });

  useEffect(() => {
    reset({
      productTypeId: initial?.productTypeId ?? '',
      productGroupId: initial?.productGroupId ?? '',
      unitId: initial?.unitId ?? '',
      code: initial?.code ?? '',
      name: initial?.name ?? '',
      description: initial?.description ?? '',
      rentalPrice: initial?.rentalPrice ?? 0,
      depositPrice: initial?.depositPrice ?? 0,
      sizeIds: initial?.sizeIds ?? [],
      images:
        initial?.images?.map((img) => ({
          url: img.url,
          sortOrder: img.sortOrder,
          isPrimary: img.isPrimary,
        })) ?? [],
    });
  }, [initial, reset]);

  const watchedSizeIds = watch('sizeIds') ?? [];
  const watchedImages = watch('images') ?? [];

  function toggleSize(sizeId: string) {
    const current = getValues('sizeIds') ?? [];
    if (current.includes(sizeId)) {
      setValue(
        'sizeIds',
        current.filter((id) => id !== sizeId),
      );
    } else {
      setValue('sizeIds', [...current, sizeId]);
    }
  }

  function handleAddImage() {
    appendImage({ url: '', sortOrder: imageFields.length, isPrimary: imageFields.length === 0 });
  }

  function handleSubmitForm(values: FormValues) {
    onSubmit({
      productTypeId: values.productTypeId,
      productGroupId: values.productGroupId,
      unitId: values.unitId,
      code: values.code,
      name: values.name,
      description: values.description || undefined,
      rentalPrice: Number(values.rentalPrice),
      depositPrice: Number(values.depositPrice),
      sizeIds: values.sizeIds && values.sizeIds.length > 0 ? values.sizeIds : undefined,
      images:
        values.images && values.images.length > 0
          ? values.images.map((img, idx) => ({
              url: img.url,
              sortOrder: typeof img.sortOrder === 'number' ? img.sortOrder : idx,
              isPrimary: img.isPrimary ?? idx === 0,
            }))
          : undefined,
    });
  }

  return (
    <form id="product-form" onSubmit={handleSubmit(handleSubmitForm)} className="space-y-6">
      {/* Classification */}
      <div className="grid gap-4 sm:grid-cols-3">
        <SelectField
          label="Product type"
          required
          id="productTypeId"
          options={lookups.productTypeOptions}
          placeholder="Select type…"
          error={errors.productTypeId?.message}
          {...register('productTypeId')}
        />
        <SelectField
          label="Product group"
          required
          id="productGroupId"
          options={lookups.productGroupOptions}
          placeholder="Select group…"
          error={errors.productGroupId?.message}
          {...register('productGroupId')}
        />
        <SelectField
          label="Unit"
          required
          id="unitId"
          options={lookups.unitOptions}
          placeholder="Select unit…"
          error={errors.unitId?.message}
          {...register('unitId')}
        />
      </div>

      {/* Identity */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Code" required id="code" error={errors.code?.message} {...register('code')} />
        <Input label="Name" required id="name" error={errors.name?.message} {...register('name')} />
      </div>

      <Textarea
        label="Description"
        id="description"
        rows={3}
        error={errors.description?.message}
        {...register('description')}
      />

      {/* Pricing */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Rental price (VND)"
          required
          id="rentalPrice"
          type="number"
          min={0}
          error={errors.rentalPrice?.message}
          {...register('rentalPrice')}
        />
        <Input
          label="Deposit price (VND)"
          required
          id="depositPrice"
          type="number"
          min={0}
          error={errors.depositPrice?.message}
          {...register('depositPrice')}
        />
      </div>

      {/* Sizes */}
      {lookups.sizeOptions.length > 0 && (
        <div>
          <FormLabel label="Sizes" htmlFor={undefined} />
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-2">
            {lookups.sizeOptions.map((opt) => (
              <label key={opt.value} className="flex cursor-pointer items-center gap-2 text-sm">
                <Checkbox
                  checked={watchedSizeIds.includes(opt.value)}
                  onCheckedChange={() => toggleSize(opt.value)}
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Images */}
      <div>
        <div className="flex items-center justify-between">
          <FormLabel label="Images" htmlFor={undefined} />
          <Button type="button" variant="outline" size="sm" onClick={handleAddImage}>
            <Plus className="size-3.5" />
            Add image
          </Button>
        </div>
        {imageFields.length === 0 && (
          <p className="text-muted-foreground mt-1 text-sm">No images added yet.</p>
        )}
        <div className="mt-2 space-y-3">
          {imageFields.map((field, index) => {
            const urlValue = watchedImages[index]?.url ?? '';
            return (
              <div key={field.id} className="flex items-start gap-3">
                <div className="flex-1 space-y-2">
                  <Input
                    placeholder="https://example.com/image.jpg"
                    error={errors.images?.[index]?.url?.message}
                    {...register(`images.${index}.url`)}
                  />
                  {urlValue && (
                    <div className="border-border bg-muted h-20 w-20 overflow-hidden rounded-md border">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={urlValue}
                        alt={`Image ${index + 1}`}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="text-destructive hover:text-destructive mt-1"
                  onClick={() => removeImage(index)}
                  aria-label="Remove image"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            );
          })}
        </div>
        {errors.images?.message && <FormErrorMessage error={errors.images.message} />}
      </div>

      {/* Actions */}
      <div className="border-border flex justify-end gap-3 border-t pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
        )}
        <Button type="submit" loading={loading}>
          {initial ? 'Save changes' : 'Create product'}
        </Button>
      </div>
    </form>
  );
}
