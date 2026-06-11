'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Palette, Plus, Ruler, Trash2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { SelectField } from '@/components/forms/select-field';
import { MoneyInput } from '@/components/forms/money-input';
import { FormErrorMessage } from '@/components/ui/form-error-message';
import { ColorForm } from '@/features/colors/color-form';
import { useColorOptions, useCreateColor } from '@/features/colors/use-colors';
import { useBranches } from '@/features/branches/use-branches';
import { mediaUrl } from '@/lib/media';
import { useT } from '@/i18n/locale-provider';
import type { Product } from '@/types/models';
import { useUploadProductImages, type ProductFormInput, type ProductLookups } from './use-products';
import { AddVariantDialog } from './add-variant-dialog';
import { AddSizeDialog } from './add-size-dialog';
import { ProductInventorySection } from './product-inventory-section';

// Static schema used only for type inference — messages are overridden inside the component.
const _staticSchema = z.object({
  productTypeId: z.string().min(1),
  productGroupId: z.string().min(1),
  unitId: z.string().min(1),
  code: z.string().min(1).max(100),
  name: z.string().min(1).max(255),
  description: z.string().max(2000).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']),
  rentalPrice: z.coerce.number().min(0),
  depositPrice: z.coerce.number().min(0),
  variants: z
    .array(
      z.object({
        colorId: z.string().min(1),
        sizeId: z.string().min(1),
        branchId: z.string().min(1),
        quantity: z.coerce.number().int().min(0),
      }),
    )
    .min(1),
  images: z
    .array(
      z.object({
        url: z.string().min(1),
        storedName: z.string().optional(),
        originalName: z.string().optional(),
        mimeType: z.string().optional(),
        size: z.coerce.number().optional(),
        sortOrder: z.coerce.number().int().min(0).optional(),
        isPrimary: z.boolean().optional(),
      }),
    )
    .optional(),
});

type FormValues = z.input<typeof _staticSchema>;

interface ProductFormProps {
  initial?: Product | null;
  lookups: ProductLookups;
  loading?: boolean;
  onSubmit: (input: ProductFormInput) => void;
  onCancel?: () => void;
}

export function ProductForm({ initial, lookups, loading, onSubmit, onCancel }: ProductFormProps) {
  const { t } = useT();
  const isEdit = Boolean(initial);

  const variantsSchema = z.array(
    z.object({
      colorId: z.string().min(1, t('products.form.colorRequired')),
      sizeId: z.string().min(1),
      branchId: z.string().min(1),
      quantity: z.coerce.number().int().min(0),
    }),
  );

  const schema = z.object({
    productTypeId: z.string().min(1, t('products.form.typeRequired')),
    productGroupId: z.string().min(1, t('products.form.groupRequired')),
    unitId: z.string().min(1, t('products.form.unitRequired')),
    code: z.string().min(1, t('products.form.codeRequired')).max(100),
    name: z.string().min(1, t('products.form.nameRequired')).max(255),
    description: z.string().max(2000).optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']),
    rentalPrice: z.coerce.number().min(0, t('products.form.rentalPriceMin')),
    depositPrice: z.coerce.number().min(0, t('products.form.depositPriceMin')),
    // On edit, stock is managed live by ProductInventorySection, so the form
    // grid (and its required rule) only applies when creating.
    variants: isEdit ? variantsSchema : variantsSchema.min(1, t('products.form.variantsRequired')),
    images: z
      .array(
        z.object({
          url: z.string().min(1, t('products.form.urlRequired')),
          storedName: z.string().optional(),
          originalName: z.string().optional(),
          mimeType: z.string().optional(),
          size: z.coerce.number().optional(),
          sortOrder: z.coerce.number().int().min(0).optional(),
          isPrimary: z.boolean().optional(),
        }),
      )
      .optional(),
  });

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
      status: 'ACTIVE',
      rentalPrice: 0,
      depositPrice: 0,
      variants: [],
      images: [],
    },
  });

  const {
    fields: imageFields,
    append: appendImage,
    remove: removeImage,
  } = useFieldArray({ control, name: 'images' });

  const {
    fields: variantFields,
    append: appendVariants,
    remove: removeVariant,
  } = useFieldArray({ control, name: 'variants' });

  const uploadImages = useUploadProductImages();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const MAX_IMAGES = 3;

  const colorOptions = useColorOptions();
  const createColor = useCreateColor();
  const branchesQuery = useBranches();
  const branches = branchesQuery.data?.items ?? [];
  const branchOptions = branches.map((b) => ({ value: b.id, label: b.name }));
  const branchNameById = new Map(branches.map((b) => [b.id, b.name]));
  const [colorFormOpen, setColorFormOpen] = useState(false);
  const [sizeFormOpen, setSizeFormOpen] = useState(false);
  const [addVariantOpen, setAddVariantOpen] = useState(false);
  const colorById = new Map(colorOptions.map((c) => [c.id, c]));

  useEffect(() => {
    reset({
      productTypeId: initial?.productTypeId ?? '',
      productGroupId: initial?.productGroupId ?? '',
      unitId: initial?.unitId ?? '',
      code: initial?.code ?? '',
      name: initial?.name ?? '',
      description: initial?.description ?? '',
      status: initial?.status ?? 'ACTIVE',
      rentalPrice: initial?.rentalPrice ?? 0,
      depositPrice: initial?.depositPrice ?? 0,
      variants: [],
      images:
        initial?.images?.map((img) => ({
          url: img.url,
          storedName: img.storedName,
          originalName: img.originalName,
          mimeType: img.mimeType,
          size: img.size,
          sortOrder: img.sortOrder,
          isPrimary: img.isPrimary,
        })) ?? [],
    });
  }, [initial, reset]);

  const watchedImages = watch('images') ?? [];
  const watchedVariants = watch('variants') ?? [];
  const variantsError = errors.variants?.root?.message ?? errors.variants?.message;

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const remaining = MAX_IMAGES - imageFields.length;
    if (remaining <= 0) return;
    const files = Array.from(fileList).slice(0, remaining);
    try {
      const uploaded = await uploadImages.mutateAsync(files);
      uploaded.forEach((file, i) =>
        appendImage({
          url: file.url,
          storedName: file.storedName,
          originalName: file.originalName,
          mimeType: file.mimeType,
          size: file.size,
          sortOrder: imageFields.length + i,
          isPrimary: imageFields.length === 0 && i === 0,
        }),
      );
    } catch {
      // error toast is handled by the upload mutation
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function setPrimaryImage(index: number) {
    const imgs = getValues('images') ?? [];
    imgs.forEach((_, i) => setValue(`images.${i}.isPrimary`, i === index));
  }

  function handleSubmitForm(values: FormValues) {
    const inventoryItems = (values.variants ?? [])
      .filter((v) => v.colorId && v.sizeId && v.branchId)
      .map((v) => ({
        branchId: v.branchId,
        colorId: v.colorId,
        sizeId: v.sizeId,
        quantity: Number(v.quantity) || 0,
      }));

    const images = (values.images ?? [])
      .filter((img) => img.url)
      .map((img, idx) => ({
        url: img.url,
        storedName: img.storedName,
        originalName: img.originalName,
        mimeType: img.mimeType,
        size: typeof img.size === 'number' ? img.size : undefined,
        sortOrder: typeof img.sortOrder === 'number' ? img.sortOrder : idx,
        isPrimary: img.isPrimary ?? idx === 0,
      }));

    onSubmit({
      product: {
        productTypeId: values.productTypeId,
        productGroupId: values.productGroupId,
        unitId: values.unitId,
        code: values.code,
        name: values.name,
        description: values.description || undefined,
        status: values.status,
        rentalPrice: Number(values.rentalPrice),
        depositPrice: Number(values.depositPrice),
        images: images.length > 0 ? images : undefined,
      },
      inventoryItems,
    });
  }

  return (
    <form id="product-form" onSubmit={handleSubmit(handleSubmitForm)} className="space-y-5">
      {/* Section 1 — product info + pricing */}
      <div className="grid gap-5 lg:grid-cols-3">
        {/* Basic info — spans two columns */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-primary">{t('products.form.basicInfo')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <Input
                label={t('products.code')}
                required
                id="code"
                error={errors.code?.message}
                {...register('code')}
              />
              <div className="sm:col-span-2">
                <Input
                  label={t('products.name')}
                  required
                  id="name"
                  error={errors.name?.message}
                  {...register('name')}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <SelectField
                label={t('products.productGroup')}
                required
                id="productGroupId"
                options={lookups.productGroupOptions}
                placeholder={t('products.form.selectGroup')}
                error={errors.productGroupId?.message}
                {...register('productGroupId')}
              />
              <SelectField
                label={t('products.productType')}
                required
                id="productTypeId"
                options={lookups.productTypeOptions}
                placeholder={t('products.form.selectType')}
                error={errors.productTypeId?.message}
                {...register('productTypeId')}
              />
              <SelectField
                label={t('products.unit')}
                required
                id="unitId"
                options={lookups.unitOptions}
                placeholder={t('products.form.selectUnit')}
                error={errors.unitId?.message}
                {...register('unitId')}
              />
              <SelectField
                label={t('common.table.status')}
                required
                id="status"
                options={[
                  { value: 'ACTIVE', label: t('enums.activeStatus.ACTIVE') },
                  { value: 'INACTIVE', label: t('enums.activeStatus.INACTIVE') },
                ]}
                error={errors.status?.message}
                {...register('status')}
              />
            </div>
            <Textarea
              label={t('products.description')}
              id="description"
              rows={3}
              error={errors.description?.message}
              {...register('description')}
            />
          </CardContent>
        </Card>

        {/* Pricing + images — stacked beside general info */}
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="text-primary">{t('products.detail.pricing')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Controller
                control={control}
                name="rentalPrice"
                render={({ field }) => (
                  <MoneyInput
                    label={t('products.rentalPriceVnd')}
                    required
                    id="rentalPrice"
                    error={errors.rentalPrice?.message}
                    value={Number(field.value) || 0}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                  />
                )}
              />
              <Controller
                control={control}
                name="depositPrice"
                render={({ field }) => (
                  <MoneyInput
                    label={t('products.depositPriceVnd')}
                    required
                    id="depositPrice"
                    error={errors.depositPrice?.message}
                    value={Number(field.value) || 0}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                  />
                )}
              />
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
              <CardTitle className="text-primary">
                {t('products.images')}{' '}
                <span className="text-muted-foreground text-xs font-normal">
                  ({imageFields.length}/{MAX_IMAGES})
                </span>
              </CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                loading={uploadImages.isPending}
                disabled={imageFields.length >= MAX_IMAGES || uploadImages.isPending}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="size-3.5" />
                {t('products.uploadImage')}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
            </CardHeader>
            <CardContent className="space-y-3">
              {imageFields.length === 0 ? (
                <p className="text-muted-foreground text-sm">{t('products.noImages')}</p>
              ) : null}
              {imageFields.map((field, index) => {
                const img = watchedImages[index];
                const isPrimary = img?.isPrimary ?? false;
                return (
                  <div
                    key={field.id}
                    className="border-border flex items-center gap-3 rounded-md border p-2"
                  >
                    <div className="border-border bg-muted size-14 shrink-0 overflow-hidden rounded-md border">
                      {img?.url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={mediaUrl(img.url)}
                          alt={img.originalName ?? `${index + 1}`}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.visibility = 'hidden';
                          }}
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {img?.originalName ?? `${t('products.images')} ${index + 1}`}
                      </p>
                      <label className="text-muted-foreground mt-1 flex w-fit cursor-pointer items-center gap-2 text-xs">
                        <Checkbox
                          checked={isPrimary}
                          onCheckedChange={() => setPrimaryImage(index)}
                        />
                        {t('products.primary')}
                      </label>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="text-destructive hover:text-destructive shrink-0"
                      onClick={() => removeImage(index)}
                      aria-label={t('common.action.remove')}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                );
              })}
              {errors.images?.message && <FormErrorMessage error={errors.images.message} />}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Section 2 — colors & sizes. Create: in-form grid. Edit: live stock manager. */}
      {isEdit && initial ? (
        <ProductInventorySection
          productId={initial.id}
          items={initial.inventoryItems ?? []}
          colorList={colorOptions}
          sizeOptions={lookups.sizeOptions}
          branchOptions={branchOptions}
        />
      ) : (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
            <CardTitle className="text-primary">
              {t('products.form.colorsSizes')} <span className="text-destructive">*</span>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setColorFormOpen(true)}
              >
                <Palette className="size-3.5" />
                {t('products.form.newColor')}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSizeFormOpen(true)}
              >
                <Ruler className="size-3.5" />
                {t('products.form.newSize')}
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={
                  colorOptions.length === 0 ||
                  lookups.sizeOptions.length === 0 ||
                  branchOptions.length === 0
                }
                onClick={() => setAddVariantOpen(true)}
              >
                <Plus className="size-3.5" />
                {t('products.form.addVariant')}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {variantFields.length === 0 ? (
              <p className="text-muted-foreground text-sm">{t('products.form.variantsEmpty')}</p>
            ) : (
              <div className="border-border overflow-hidden rounded-md border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">
                        {t('products.form.colorColumn')}
                      </th>
                      <th className="px-3 py-2 text-left font-medium">
                        {t('products.form.sizeColumn')}
                      </th>
                      <th className="px-3 py-2 text-left font-medium">
                        {t('products.form.branchColumn')}
                      </th>
                      <th className="w-28 px-3 py-2 text-left font-medium">
                        {t('products.form.quantityColumn')}
                      </th>
                      <th className="w-10 px-3 py-2" />
                    </tr>
                  </thead>
                  <tbody className="divide-border divide-y">
                    {variantFields.map((field, index) => {
                      const row = watchedVariants[index];
                      const color = colorById.get(row?.colorId ?? '');
                      return (
                        <tr key={field.id}>
                          <td className="px-3 py-2">
                            <span className="flex items-center gap-2 font-medium">
                              <span
                                className="border-border size-4 shrink-0 rounded-full border"
                                style={color?.hex ? { backgroundColor: color.hex } : undefined}
                              />
                              {color?.name ?? '—'}
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            {lookups.sizeMap[row?.sizeId ?? ''] ?? row?.sizeId}
                          </td>
                          <td className="px-3 py-2">
                            {branchNameById.get(row?.branchId ?? '') ?? '—'}
                          </td>
                          <td className="px-3 py-2">
                            <Input
                              type="number"
                              min={0}
                              className="h-8 w-20"
                              {...register(`variants.${index}.quantity`)}
                            />
                          </td>
                          <td className="px-2 py-2 text-right">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => removeVariant(index)}
                              aria-label={t('common.action.remove')}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            {variantsError && <FormErrorMessage error={variantsError} />}
          </CardContent>
        </Card>
      )}

      {/* Actions — at the bottom */}
      <div className="flex items-center justify-end gap-3">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            {t('common.action.cancel')}
          </Button>
        )}
        <Button type="submit" loading={loading}>
          {initial ? t('common.action.saveChanges') : t('products.form.createProduct')}
        </Button>
      </div>

      {/* Create-only dialogs — the edit screen's stock manager has its own. */}
      {!isEdit && (
        <>
          {/* Pick a color + sizes + branches + quantity, then add one row per size×branch. */}
          <AddVariantDialog
            open={addVariantOpen}
            onOpenChange={setAddVariantOpen}
            colorOptions={colorOptions.map((c) => ({ value: c.id, label: c.name }))}
            sizeOptions={lookups.sizeOptions}
            branchOptions={branchOptions}
            existingKeys={watchedVariants.map((v) => `${v.colorId}::${v.sizeId}::${v.branchId}`)}
            onAdd={(rows) => appendVariants(rows)}
          />

          {/* Quick-create a color without leaving the product screen. */}
          <ColorForm
            open={colorFormOpen}
            onOpenChange={setColorFormOpen}
            loading={createColor.isPending}
            onSubmit={(input) =>
              createColor.mutate(input, {
                onSuccess: () => setColorFormOpen(false),
              })
            }
          />

          {/* Quick-create a size without leaving the product screen. */}
          <AddSizeDialog open={sizeFormOpen} onOpenChange={setSizeFormOpen} />
        </>
      )}
    </form>
  );
}
