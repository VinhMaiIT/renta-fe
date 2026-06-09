import { RentalOrderDetail } from '@/features/rental-orders/rental-order-detail';

export const metadata = { title: 'Rental Order' };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <RentalOrderDetail id={id} />;
}
