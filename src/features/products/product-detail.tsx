'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Edit } from 'lucide-react';
import { StatusBadge } from '@/components/common/status-badge';
import { ErrorState } from '@/components/common/states';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { ACTIVE_STATUS_META } from '@/constants/enum-labels';
import { formatCurrency } from '@/lib/format';
import { mediaUrl } from '@/lib/media';
import { useColorOptions } from '@/features/colors/use-colors';
import { useT } from '@/i18n/locale-provider';
import { useProduct, useProductLookups } from './use-products';

interface ProductDetailProps {
  id: string;
}

export function ProductDetail({ id }: ProductDetailProps) {
  const router = useRouter();
  const { t } = useT();
  const { data: product, isLoading, isError, error, refetch } = useProduct(id);
  const lookups = useProductLookups();
  const colorOptions = useColorOptions();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-7 w-48" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError || !product) {
    const msg = error instanceof Error ? error.message : undefined;
    return <ErrorState description={msg} onRetry={() => refetch()} />;
  }

  const typeName = lookups.productTypeMap[product.productTypeId] ?? product.productTypeId;
  const groupName = lookups.productGroupMap[product.productGroupId] ?? product.productGroupId;
  const unitName = lookups.unitMap[product.unitId] ?? product.unitId;
  const sizeNames = product.sizeIds.map((sid) => lookups.sizeMap[sid] ?? sid).filter(Boolean);

  const colorHexById = new Map(colorOptions.map((c) => [c.id, c.hex]));
  const inventoryGroups = Array.from(
    (product.inventoryItems ?? []).reduce((map, item) => {
      const colorId = item.color?.id ?? '';
      const sizeId = item.size?.id ?? '';
      const branchId = item.branch?.id ?? '';
      if (!colorId || !sizeId || !branchId) return map;
      const key = `${colorId}::${sizeId}::${branchId}`;
      const group = map.get(key) ?? {
        key,
        colorId,
        colorName: item.color?.name ?? '',
        sizeName: item.size?.name ?? '',
        branchName: item.branch?.name ?? '',
        quantity: 0,
      };
      group.quantity += 1;
      map.set(key, group);
      return map;
    }, new Map<string, { key: string; colorId: string; colorName: string; sizeName: string; branchName: string; quantity: number }>()).values(),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" onClick={() => router.push('/products')}>
          <ArrowLeft className="size-4" />
          {t('common.action.back')}
        </Button>
        <Button onClick={() => router.push(`/products/${product.id}/edit`)}>
          <Edit className="size-4" />
          {t('common.action.edit')}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-primary text-base">{t('products.detail.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <DetailField label={t('products.code')} value={product.code} />
              <DetailField label={t('products.name')} value={product.name} />
              <DetailField label={t('products.productType')} value={typeName} />
              <DetailField label={t('products.productGroup')} value={groupName} />
              <DetailField label={t('products.unit')} value={unitName} />
              <DetailField
                label={t('common.table.status')}
                value={<StatusBadge meta={ACTIVE_STATUS_META[product.status]} />}
              />
            </div>
            {product.description && (
              <>
                <Separator />
                <DetailField label={t('products.description')} value={product.description} />
              </>
            )}
            {sizeNames.length > 0 && (
              <>
                <Separator />
                <DetailField
                  label={t('products.sizes')}
                  value={
                    <div className="flex flex-wrap gap-1.5">
                      {sizeNames.map((name) => (
                        <span
                          key={name}
                          className="border-border bg-muted rounded-full border px-2 py-0.5 text-xs"
                        >
                          {name}
                        </span>
                      ))}
                    </div>
                  }
                />
              </>
            )}
          </CardContent>
        </Card>

        {/* Pricing + meta */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-primary text-base">
                {t('products.detail.pricing')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <DetailField
                label={t('products.rentalPrice')}
                value={formatCurrency(product.rentalPrice)}
              />
              <DetailField
                label={t('products.depositPrice')}
                value={formatCurrency(product.depositPrice)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-primary text-base">{t('products.images')}</CardTitle>
            </CardHeader>
            <CardContent>
              {product.images.length === 0 ? (
                <p className="text-muted-foreground text-sm">{t('products.noImages')}</p>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {product.images.map((img, index) => (
                    <div
                      key={img.url || index}
                      className="border-border bg-muted relative h-28 w-28 overflow-hidden rounded-lg border"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={mediaUrl(img.url)}
                        alt={product.name}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      {img.isPrimary && (
                        <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
                          {t('products.primary')}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Colors & sizes — full stock breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-primary text-base">
            {t('products.form.colorsSizes')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {inventoryGroups.length === 0 ? (
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
                    <th className="px-3 py-2 text-center font-medium">
                      {t('products.form.quantityColumn')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-border divide-y">
                  {inventoryGroups.map((g) => {
                    const hex = colorHexById.get(g.colorId);
                    return (
                      <tr key={g.key}>
                        <td className="px-3 py-2">
                          <span className="flex items-center gap-2 font-medium">
                            <span
                              className="border-border size-4 shrink-0 rounded-full border"
                              style={hex ? { backgroundColor: hex } : undefined}
                            />
                            {g.colorName}
                          </span>
                        </td>
                        <td className="px-3 py-2">{g.sizeName}</td>
                        <td className="px-3 py-2">{g.branchName}</td>
                        <td className="px-3 py-2 text-center font-medium tabular-nums">
                          {g.quantity}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function DetailField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-0.5">
      <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">{label}</p>
      <div className="text-sm font-medium">{value ?? '—'}</div>
    </div>
  );
}
