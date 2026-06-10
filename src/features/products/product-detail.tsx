'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Edit } from 'lucide-react';
import { PageHeader } from '@/components/common/page-header';
import { StatusBadge } from '@/components/common/status-badge';
import { ErrorState } from '@/components/common/states';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { ACTIVE_STATUS_META } from '@/constants/enum-labels';
import { formatCurrency, formatDateTime } from '@/lib/format';
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

  return (
    <div className="space-y-6">
      <PageHeader
        title={product.name}
        description={product.code}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="size-4" />
              {t('common.action.back')}
            </Button>
            <Button onClick={() => router.push(`/products/${product.id}/edit`)}>
              <Edit className="size-4" />
              {t('common.action.edit')}
            </Button>
          </div>
        }
      />

      {/* Images gallery */}
      {product.images.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {product.images.map((img) => (
            <div
              key={img.id}
              className="border-border bg-muted relative h-32 w-32 overflow-hidden rounded-lg border"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
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

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">{t('products.detail.title')}</CardTitle>
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
              <CardTitle className="text-base">{t('products.detail.pricing')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <DetailField label={t('products.rentalPrice')} value={formatCurrency(product.rentalPrice)} />
              <DetailField label={t('products.depositPrice')} value={formatCurrency(product.depositPrice)} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('products.detail.timestamps')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <DetailField label={t('common.table.created')} value={formatDateTime(product.createdAt)} />
              <DetailField label={t('common.table.updated')} value={formatDateTime(product.updatedAt)} />
            </CardContent>
          </Card>
        </div>
      </div>
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
