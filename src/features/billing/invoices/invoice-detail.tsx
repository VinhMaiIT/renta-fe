'use client';

import { useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import { PageHeader } from '@/components/common/page-header';
import { StatusBadge } from '@/components/common/status-badge';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { WarningBanner } from '@/components/common/warning-banner';
import { ErrorState } from '@/components/common/states';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { INVOICE_STATUS_META } from '@/constants/enum-labels';
import { formatCurrency, formatDate } from '@/lib/format';
import { useT } from '@/i18n/locale-provider';
import type { Invoice } from '@/types/billing';
import { useInvoice, useInvoiceMutations } from '../use-invoices';

interface InvoiceDetailProps {
  id: string;
}

export function InvoiceDetail({ id }: InvoiceDetailProps) {
  const { t } = useT();
  const router = useRouter();
  const query = useInvoice(id);
  const { markPaid, cancel } = useInvoiceMutations();

  const [paidOpen, setPaidOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [approvalNote, setApprovalNote] = useState('');

  if (query.isLoading) return <DetailSkeleton />;

  if (query.isError || !query.data) {
    return (
      <div className="space-y-5">
        <Button variant="ghost" size="sm" onClick={() => router.push('/billing/invoices')}>
          <ArrowLeft className="size-4" />
          {t('billing.invoices.back')}
        </Button>
        <ErrorState
          description={query.error instanceof Error ? query.error.message : undefined}
          onRetry={() => query.refetch()}
        />
      </div>
    );
  }

  const invoice: Invoice = query.data;
  const isPaid = invoice.status === 'PAID';
  const isCancelled = invoice.status === 'CANCELLED';
  const isOverdue = invoice.status === 'OVERDUE';
  const isFinal = isPaid || isCancelled;

  return (
    <div className="space-y-5 pb-20 md:pb-0">
      <Button variant="ghost" size="sm" onClick={() => router.push('/billing/invoices')}>
        <ArrowLeft className="size-4" />
        {t('billing.invoices.back')}
      </Button>

      <PageHeader
        title={invoice.code}
        actions={<StatusBadge meta={INVOICE_STATUS_META[invoice.status]} />}
      />

      {isOverdue ? (
        <WarningBanner tone="destructive">{t('billing.invoices.overdueBanner')}</WarningBanner>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {!isFinal ? (
          <Button onClick={() => setPaidOpen(true)}>
            <CheckCircle2 className="size-4" />
            {t('billing.invoices.markPaid')}
          </Button>
        ) : null}
        {!isFinal ? (
          <Button variant="destructive" onClick={() => setCancelOpen(true)}>
            <XCircle className="size-4" />
            {t('billing.invoices.markCancelled')}
          </Button>
        ) : null}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('billing.invoices.info')}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
            <Field label={t('billing.invoices.code')} value={invoice.code} />
            <Field label={t('billing.invoices.tenant')} value={invoice.tenantName} />
            <Field label={t('billing.invoices.package')} value={invoice.packageName} />
            <Field label={t('billing.invoices.amount')} value={formatCurrency(invoice.amount)} />
            <Field label={t('billing.invoices.dueDate')} value={formatDate(invoice.dueDate)} />
            <Field
              label={t('billing.invoices.paidDate')}
              value={invoice.paidDate ? formatDate(invoice.paidDate) : '—'}
            />
            <Field label={t('billing.invoices.method')} value={invoice.paymentMethod} />
            <div className="space-y-0.5">
              <p className="text-muted-foreground text-xs">{t('billing.invoices.status')}</p>
              <StatusBadge meta={INVOICE_STATUS_META[invoice.status]} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('billing.invoices.payment')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label={t('billing.invoices.bankRef')} value={invoice.bankTransferRef || '—'} />
            <div className="space-y-1.5">
              <p className="text-muted-foreground text-xs">{t('billing.invoices.paymentProof')}</p>
              {invoice.paymentProofUrl ? (
                <div className="space-y-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={invoice.paymentProofUrl}
                    alt={t('billing.invoices.paymentProof')}
                    className="max-h-80 rounded-lg border"
                  />
                  <a
                    href={invoice.paymentProofUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary text-sm underline underline-offset-3"
                  >
                    {t('billing.invoices.viewProof')}
                  </a>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">{t('billing.invoices.noProof')}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('billing.invoices.note')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm break-words">{invoice.note || '—'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('billing.invoices.approvalNote')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm break-words">{invoice.approvalNote || '—'}</p>
          </CardContent>
        </Card>
      </div>

      <Dialog
        open={paidOpen}
        onOpenChange={(open) => {
          setPaidOpen(open);
          if (!open) setApprovalNote('');
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('billing.invoices.markPaidTitle')}</DialogTitle>
            <DialogDescription>
              {t('billing.invoices.markPaidDesc', {
                code: invoice.code,
                amount: formatCurrency(invoice.amount),
              })}
            </DialogDescription>
          </DialogHeader>
          <Textarea
            label={t('billing.invoices.approvalNote')}
            placeholder={t('billing.invoices.approvalNotePlaceholder')}
            value={approvalNote}
            onChange={(e) => setApprovalNote(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaidOpen(false)} disabled={markPaid.isPending}>
              {t('common.action.cancel')}
            </Button>
            <Button
              loading={markPaid.isPending}
              onClick={() =>
                markPaid.mutate(
                  { id: invoice.id, note: approvalNote.trim() || undefined },
                  {
                    onSuccess: () => {
                      setPaidOpen(false);
                      setApprovalNote('');
                    },
                  },
                )
              }
            >
              {t('billing.invoices.markPaid')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title={t('billing.invoices.markCancelledTitle')}
        description={t('billing.invoices.markCancelledDesc', { code: invoice.code })}
        destructive
        confirmText={t('billing.invoices.markCancelled')}
        loading={cancel.isPending}
        onConfirm={() => cancel.mutate(invoice.id, { onSuccess: () => setCancelOpen(false) })}
      />
    </div>
  );
}

function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="space-y-0.5">
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="text-sm font-medium break-words">{value || '—'}</p>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-10 w-64" />
      <div className="grid gap-5 lg:grid-cols-2">
        <Skeleton className="h-56" />
        <Skeleton className="h-56" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    </div>
  );
}
