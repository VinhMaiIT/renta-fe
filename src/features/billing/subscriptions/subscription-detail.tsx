'use client';

import { useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ExternalLink, RotateCcw, Repeat, XCircle } from 'lucide-react';
import { PageHeader } from '@/components/common/page-header';
import { StatusBadge } from '@/components/common/status-badge';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { WarningBanner } from '@/components/common/warning-banner';
import { ErrorState } from '@/components/common/states';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SelectField } from '@/components/forms/select-field';
import {
  INVOICE_STATUS_META,
  PAYMENT_CYCLE_META,
  SUBSCRIPTION_STATUS_META,
} from '@/constants/enum-labels';
import { formatCurrency, formatDate } from '@/lib/format';
import { useT } from '@/i18n/locale-provider';
import type { Subscription } from '@/types/billing';
import {
  useSubscription,
  useSubscriptionInvoices,
  useSubscriptionMutations,
  useBillingLookups,
} from '../use-subscriptions';

interface SubscriptionDetailProps {
  id: string;
}

export function SubscriptionDetail({ id }: SubscriptionDetailProps) {
  const { t } = useT();
  const router = useRouter();
  const query = useSubscription(id);
  const invoicesQuery = useSubscriptionInvoices(id);
  const { renew, changePackage, cancel } = useSubscriptionMutations();
  const { packages } = useBillingLookups();

  const [renewOpen, setRenewOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [changeOpen, setChangeOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState('');

  if (query.isLoading) return <DetailSkeleton />;

  if (query.isError || !query.data) {
    return (
      <div className="space-y-5">
        <Button variant="ghost" size="sm" onClick={() => router.push('/billing/subscriptions')}>
          <ArrowLeft className="size-4" />
          {t('billing.subscriptions.back')}
        </Button>
        <ErrorState
          description={query.error instanceof Error ? query.error.message : undefined}
          onRetry={() => query.refetch()}
        />
      </div>
    );
  }

  const sub: Subscription = query.data;
  const invoices = invoicesQuery.data ?? [];
  const isCancelled = sub.status === 'CANCELLED';
  const cycleLabel = t(`enums.paymentCycle.${sub.paymentCycle}`);

  const openChange = () => {
    setSelectedPackage(sub.packageId);
    setChangeOpen(true);
  };

  return (
    <div className="space-y-5 pb-20 md:pb-0">
      <Button variant="ghost" size="sm" onClick={() => router.push('/billing/subscriptions')}>
        <ArrowLeft className="size-4" />
        {t('billing.subscriptions.back')}
      </Button>

      <PageHeader
        title={sub.tenantName}
        actions={
          <div className="flex flex-wrap items-center justify-end gap-2">
            <StatusBadge meta={SUBSCRIPTION_STATUS_META[sub.status]} />
            <Button variant="outline" onClick={openChange}>
              <Repeat className="size-4" />
              {t('billing.subscriptions.changePackage')}
            </Button>
            {!isCancelled ? (
              <>
                <Button onClick={() => setRenewOpen(true)}>
                  <RotateCcw className="size-4" />
                  {t('billing.subscriptions.renew')}
                </Button>
                <Button variant="destructive" onClick={() => setCancelOpen(true)}>
                  <XCircle className="size-4" />
                  {t('billing.subscriptions.cancel')}
                </Button>
              </>
            ) : null}
          </div>
        }
      />

      {sub.status === 'EXPIRED' ? (
        <WarningBanner tone="destructive">{t('billing.subscriptions.expiredBanner')}</WarningBanner>
      ) : null}
      {sub.status === 'PENDING_PAYMENT' ? (
        <WarningBanner tone="warning">{t('billing.subscriptions.pendingBanner')}</WarningBanner>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-3">
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
            <Field label={t('billing.subscriptions.startDate')} value={formatDate(sub.startDate)} />
            <Field label={t('billing.subscriptions.endDate')} value={formatDate(sub.endDate)} />
            <Field
              label={t('billing.subscriptions.nextBilling')}
              value={formatDate(sub.nextBillingDate)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('billing.subscriptions.timeline')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <TimelineRow
              label={t('billing.subscriptions.startDate')}
              value={formatDate(sub.startDate)}
            />
            <TimelineRow
              label={t('billing.subscriptions.endDate')}
              value={formatDate(sub.endDate)}
            />
            <TimelineRow
              label={t('billing.subscriptions.nextBilling')}
              value={formatDate(sub.nextBillingDate)}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('billing.subscriptions.invoices')}</CardTitle>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <p className="text-muted-foreground text-sm">{t('billing.subscriptions.noInvoices')}</p>
          ) : (
            <ul className="divide-border divide-y">
              {invoices.map((invoice) => (
                <li key={invoice.id}>
                  <button
                    type="button"
                    onClick={() => router.push(`/billing/invoices/${invoice.id}`)}
                    className="hover:bg-muted/50 flex w-full items-center justify-between gap-3 rounded-md px-2 py-2.5 text-left text-sm transition-colors"
                  >
                    <span className="flex items-center gap-2 font-medium">
                      {invoice.code}
                      <ExternalLink className="text-muted-foreground size-3.5" />
                    </span>
                    <span className="flex items-center gap-3">
                      <span>{formatCurrency(invoice.amount)}</span>
                      <StatusBadge meta={INVOICE_STATUS_META[invoice.status]} />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('billing.subscriptions.statusHistory')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {sub.statusHistory.map((event, index) => (
              <li key={`${event.at}-${index}`} className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                <StatusBadge meta={SUBSCRIPTION_STATUS_META[event.status]} />
                <span className="text-muted-foreground">{formatDate(event.at)}</span>
                {event.note ? <span>{event.note}</span> : null}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={renewOpen}
        onOpenChange={setRenewOpen}
        title={t('billing.subscriptions.renewTitle')}
        description={t('billing.subscriptions.renewDesc', {
          tenant: sub.tenantName,
          cycle: cycleLabel,
        })}
        confirmText={t('billing.subscriptions.renewConfirm')}
        loading={renew.isPending}
        onConfirm={() => renew.mutate(sub, { onSuccess: () => setRenewOpen(false) })}
      />

      <ConfirmDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title={t('billing.subscriptions.cancelTitle')}
        description={t('billing.subscriptions.cancelDesc', { tenant: sub.tenantName })}
        destructive
        confirmText={t('billing.subscriptions.cancelConfirm')}
        loading={cancel.isPending}
        onConfirm={() => cancel.mutate(sub.id, { onSuccess: () => setCancelOpen(false) })}
      />

      <Dialog open={changeOpen} onOpenChange={setChangeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('billing.subscriptions.changeTitle')}</DialogTitle>
            <DialogDescription>
              {t('billing.subscriptions.changeDesc', { tenant: sub.tenantName })}
            </DialogDescription>
          </DialogHeader>
          <SelectField
            label={t('billing.subscriptions.package')}
            value={selectedPackage}
            onChange={(e) => setSelectedPackage(e.target.value)}
            placeholder={t('billing.subscriptions.selectPackage')}
            options={packages.map((pkg) => ({ value: pkg.id, label: pkg.name }))}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setChangeOpen(false)}>
              {t('common.action.cancel')}
            </Button>
            <Button
              loading={changePackage.isPending}
              disabled={!selectedPackage}
              onClick={() =>
                changePackage.mutate(
                  { sub, packageId: selectedPackage },
                  { onSuccess: () => setChangeOpen(false) },
                )
              }
            >
              {t('billing.subscriptions.changeConfirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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

function TimelineRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-10 w-64" />
      <div className="grid gap-5 lg:grid-cols-3">
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
      </div>
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
