import { SubscriptionDetail } from '@/features/billing/subscriptions/subscription-detail';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SubscriptionDetail id={id} />;
}
