'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { ErrorState } from '@/components/common/states';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductForm } from '@/features/products/product-form';
import { useProduct, useUpdateProduct, useProductLookups } from '@/features/products/use-products';

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: product, isLoading, isError, error, refetch } = useProduct(id);
  const update = useUpdateProduct();
  const lookups = useProductLookups();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-3">
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
        </div>
        <Skeleton className="h-24" />
      </div>
    );
  }

  if (isError || !product) {
    const msg = error instanceof Error ? error.message : undefined;
    return <ErrorState description={msg} onRetry={() => refetch()} />;
  }

  return (
    <div className="space-y-6">
      <ProductForm
        initial={product}
        lookups={lookups}
        loading={update.isPending}
        onSubmit={(input) => {
          update.mutate(
            { id: product.id, input },
            {
              onSuccess: () => {
                router.push(`/products/${product.id}`);
              },
            },
          );
        }}
        onCancel={() => router.push('/products')}
      />
    </div>
  );
}
