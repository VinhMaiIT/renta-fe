import { ReturnDetail } from '@/features/return-transactions/return-detail';

export const metadata = { title: 'Return detail' };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ReturnDetail id={id} />;
}
