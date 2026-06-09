import { ProductDetail } from '@/features/products/product-detail';

export const metadata = { title: 'Product' };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProductDetail id={id} />;
}
