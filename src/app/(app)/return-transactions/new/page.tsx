'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ReturnCreate } from '@/features/return-transactions/return-create';

function NewReturn() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId') ?? undefined;
  return <ReturnCreate initialOrderId={orderId} />;
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <NewReturn />
    </Suspense>
  );
}
