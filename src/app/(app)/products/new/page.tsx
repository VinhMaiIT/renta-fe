'use client';

import { useRouter } from 'next/navigation';
import { ProductForm } from '@/features/products/product-form';
import { useCreateProduct, useProductLookups } from '@/features/products/use-products';

export default function Page() {
  const router = useRouter();
  const create = useCreateProduct();
  const lookups = useProductLookups();

  return (
    <div className="space-y-6">
      <ProductForm
        lookups={lookups}
        loading={create.isPending}
        onSubmit={(input) => {
          create.mutate(input, {
            onSuccess: (product) => {
              router.push(`/products/${product.id}`);
            },
          });
        }}
        onCancel={() => router.push('/products')}
      />
    </div>
  );
}
