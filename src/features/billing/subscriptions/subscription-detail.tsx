'use client';

import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/common/page-header';
import { StatusBadge } from '@/components/common/status-badge';
import { ErrorState } from '@/components/common/states';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PAYMENT_CYCLE_META, SUBSCRIPTION_STATUS_META } from '@/constants/enum-labels';
import { formatDate } from '@/lib/format';
import { useT } from '@/i18n/locale-provider';
import type { Subscription } from '@/types/billing';
import { useSubscription } from '../use-subscriptions';

interface SubscriptionDetailProps {
  id: string;
}

export function SubscriptionDetail({ id }: SubscriptionDetailProps) {
  const { t } = useT();
  const router = useRouter();
  const query = useSubscription(id);

  if (query.isLoading) return <DetailSkeleton />;

  if (query.isError || !query.data) {
    return (
      <div className="space-y-5">
        <BackButton onClick={() => router.push('/billing/subscriptions')} label={t('billing.subscriptions.back')} />
        <ErrorState
          description={query.error instanceof Error ? query.error.message : undefined}
          onRetry={() => query.refetch()}
        />
      </div>
    );
  }

  const sub: Subscription = query.data;

  return (
    <div className="space-y-5 pb-20 md:pb-0">
      <BackButton onClick={() => router.push('/billing/subscriptions')} label={t('billing.subscriptions.back')} />

      <PageHeader
        title={sub.tenantName || '—'}
        description={sub.packageName || undefined}
        actions={<StatusBadge meta={SUBSCRIPTION_STATUS_META[sub.status]} />}
      />

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Tenant */}
        <Card>
          <CardHeader>
            <CardTitle>{t('billing.subscriptions.tenantInfo')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Field label={t('billing.subscriptions.tenant')} value={sub.tenantName} />
            <Field
              label="ID"
              value={<span className="font-mono text-xs">{sub.tenantId}</span>}
            />
          </CardContent>
        </Card>

        {/* Package / billing */}
        <Card>
          <CardHeader>
            <CardTitle>{t('billing.subscriptions.currentPackage')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Field label={t('billing.subscriptions.package')} value={sub.packageName} />
            <Field
              label={t('billing.subscriptions.cycle')}
              value={<StatusBadge meta={PAYMENT_CYCLE_META[sub.paymentCycle]} />}
            />
            <Field
              label={t('common.table.status')}
              value={<StatusBadge meta={SUBSCRIPTION_STATUS_META[sub.status]} />}
            />
            <Field label={t('billing.subscriptions.startDate')} value={formatDate(sub.startDate)} />
            <Field label={t('billing.subscriptions.endDate')} value={formatDate(sub.endDate)} />
            <Field
              label={t('billing.subscriptions.nextBilling')}
              value={formatDate(sub.nextBillingDate)}
            />
            <Field
              label={t('billing.subscriptions.autoRenew')}
              value={
                typeof sub.autoRenew === 'boolean'
                  ? t(sub.autoRenew ? 'common.yes' : 'common.no')
                  : '—'
              }
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function BackButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <Button variant="ghost" size="sm" onClick={onClick}>
      <ArrowLeft className="size-4" />
      {label}
    </Button>
  );
}

function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="space-y-0.5">
      <p className="text-muted-foreground text-xs">{label}</p>
      <div className="text-sm font-medium break-words">{value || '—'}</div>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-10 w-64" />
      <div className="grid gap-5 lg:grid-cols-2">
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
      </div>
    </div>
  );
}
