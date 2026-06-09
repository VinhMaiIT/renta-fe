import { InventoryDetail } from '@/features/inventory-items/inventory-detail';

export const metadata = { title: 'Inventory Item' };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <InventoryDetail id={id} />;
}
