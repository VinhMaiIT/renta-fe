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
import {
  ACTIVE_STATUS_META,
  PAYMENT_CYCLE_META,
  SUBSCRIPTION_STATUS_META,
} from '@/constants/enum-labels';
import { formatDate } from '@/lib/format';
import { useT } from '@/i18n/locale-provider';
import type { Tenant } from '@/types/models';
import { useTenant, useTenantBranches } from './use-tenants';

interface TenantDetailProps {
  id: string;
}

export function TenantDetail({ id }: TenantDetailProps) {
  const { t } = useT();
  const router = useRouter();
  const query = useTenant(id);
  const branchesQuery = useTenantBranches(id);

  if (query.isLoading) return <DetailSkeleton />;

  if (query.isError || !query.data) {
    return (
      <div className="space-y-5">
        <BackButton />
        <ErrorState
          description={query.error instanceof Error ? query.error.message : undefined}
          onRetry={() => query.refetch()}
        />
      </div>
    );
  }

  const tenant: Tenant = query.data;
  const branches = branchesQuery.data?.items ?? [];
  const sub = tenant.subscription;

  function BackButton() {
    return (
      <Button variant="ghost" size="sm" onClick={() => router.push('/tenants')}>
        <ArrowLeft className="size-4" />
        {t('tenants.back')}
      </Button>
    );
  }

  return (
    <div className="space-y-5 pb-20 md:pb-0">
      <BackButton />

      <PageHeader
        title={tenant.name}
        description={tenant.code}
        actions={<StatusBadge meta={ACTIVE_STATUS_META[tenant.status]} />}
      />

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Tenant info */}
        <Card>
          <CardHeader>
            <CardTitle>{t('tenants.detail.tenantInfo')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Field label={t('tenants.code')} value={<span className="font-mono text-xs">{tenant.code}</span>} />
            <Field label={t('common.table.name')} value={tenant.name} />
            <Field label={t('tenants.phone')} value={tenant.phone} />
            <Field label={t('tenants.email')} value={tenant.email} />
            <Field label={t('tenants.address')} value={tenant.address} />
            <Field
              label={t('common.table.status')}
              value={<StatusBadge meta={ACTIVE_STATUS_META[tenant.status]} />}
            />
          </CardContent>
        </Card>

        {/* Current package / billing */}
        <Card>
          <CardHeader>
            <CardTitle>{t('tenants.detail.packageInfo')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {sub ? (
              <>
                <Field label={t('tenants.package')} value={sub.packageName} />
                <Field
                  label={t('tenants.detail.cycle')}
                  value={<StatusBadge meta={PAYMENT_CYCLE_META[sub.paymentCycle]} />}
                />
                <Field
                  label={t('common.table.status')}
                  value={<StatusBadge meta={SUBSCRIPTION_STATUS_META[sub.status]} />}
                />
                <Field label={t('tenants.startDate')} value={formatDate(sub.startDate)} />
                <Field label={t('tenants.endDate')} value={formatDate(sub.endDate)} />
                <Field
                  label={t('tenants.detail.nextBilling')}
                  value={sub.nextBillingDate ? formatDate(sub.nextBillingDate) : '—'}
                />
              </>
            ) : (
              <p className="text-muted-foreground text-sm">{t('tenants.detail.noPackage')}</p>
            )}
          </CardContent>
        </Card>

        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle>{t('tenants.detail.summary')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Field
              label={t('tenants.branchCount')}
              value={tenant.branchCount ?? branches.length}
            />
            <Field label={t('common.table.created')} value={formatDate(tenant.createdAt)} />
            <Field label={t('common.table.updated')} value={formatDate(tenant.updatedAt)} />
          </CardContent>
        </Card>
      </div>

      {/* Branches / addresses */}
      <Card>
        <CardHeader>
          <CardTitle>{t('tenants.detail.branches')}</CardTitle>
        </CardHeader>
        <CardContent>
          {branchesQuery.isLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : branches.length === 0 ? (
            <p className="text-muted-foreground text-sm">{t('tenants.detail.noBranches')}</p>
          ) : (
            <ul className="divide-border divide-y">
              {branches.map((branch) => (
                <li key={branch.id} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-0.5">
                    <p className="flex items-center gap-2 text-sm font-medium">
                      {branch.name}
                      {branch.isMain ? (
                        <span className="bg-primary/15 text-primary rounded-full px-2 py-0.5 text-xs font-medium">
                          {t('tenants.detail.mainBranch')}
                        </span>
                      ) : null}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {branch.address ?? '—'}
                      {branch.phone ? ` · ${branch.phone}` : ''}
                    </p>
                  </div>
                  <StatusBadge meta={ACTIVE_STATUS_META[branch.status]} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
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
      <div className="grid gap-5 lg:grid-cols-3">
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
      <Skeleton className="h-48 w-full" />
    </div>
  );
}
