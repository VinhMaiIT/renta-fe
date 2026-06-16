'use client';

import { useRef, useState } from 'react';
import { Check, Clock, Copy, ImageUp } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/common/states';
import { formatCurrency } from '@/lib/format';
import { mediaUrl } from '@/lib/media';
import { useT } from '@/i18n/locale-provider';
import { useSubscriptionPayment, useSubmitPaymentProof } from './use-tenant-settings';

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PaymentDialog({ open, onOpenChange }: PaymentDialogProps) {
  const { t } = useT();
  const query = useSubscriptionPayment(open);
  const submit = useSubmitPaymentProof();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [reference, setReference] = useState('');

  const info = query.data;
  // Proof already attached → awaiting a SaaS admin to confirm the payment.
  const awaiting = Boolean(info?.paymentProofUrl);

  function pickFile(list: FileList | null) {
    const next = list?.[0] ?? null;
    if (preview) URL.revokeObjectURL(preview);
    setFile(next);
    setPreview(next ? URL.createObjectURL(next) : null);
  }

  function close(next: boolean) {
    if (!next) {
      if (preview) URL.revokeObjectURL(preview);
      setFile(null);
      setPreview(null);
      setReference('');
    }
    onOpenChange(next);
  }

  function handleSubmit() {
    if (!info || !file) return;
    submit.mutate(
      { invoiceId: info.invoiceId, file, paymentReference: reference.trim() || undefined },
      {
        onSuccess: () => {
          if (preview) URL.revokeObjectURL(preview);
          setFile(null);
          setPreview(null);
          setReference('');
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('settings.subscription.payment.title')}</DialogTitle>
          <DialogDescription>{t('settings.subscription.payment.desc')}</DialogDescription>
        </DialogHeader>

        {query.isLoading ? (
          <div className="space-y-4">
            <Skeleton className="mx-auto h-48 w-48" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : query.isError || !info ? (
          <ErrorState
            description={query.error instanceof Error ? query.error.message : undefined}
            onRetry={() => query.refetch()}
          />
        ) : awaiting ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <Clock className="size-10 text-amber-500" />
            <p className="font-medium">{t('settings.subscription.payment.awaitingTitle')}</p>
            <p className="text-muted-foreground text-sm">
              {t('settings.subscription.payment.awaitingDesc')}
            </p>
            {info.paymentProofUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={mediaUrl(info.paymentProofUrl)}
                alt={t('settings.subscription.payment.proof')}
                className="mt-2 max-h-44 rounded-lg border object-contain"
              />
            ) : null}
          </div>
        ) : (
          <div className="space-y-5">
            <div className="text-center">
              <p className="text-muted-foreground text-xs">
                {t('settings.subscription.payment.amount')}
              </p>
              <p className="text-2xl font-bold">{formatCurrency(info.amount)}</p>
            </div>

            {info.qrImageUrl ? (
              <div className="flex justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={mediaUrl(info.qrImageUrl)}
                  alt="QR"
                  className="size-48 rounded-lg border bg-white p-2"
                />
              </div>
            ) : null}

            <div className="space-y-2 rounded-lg border p-3">
              <CopyRow label={t('settings.subscription.payment.bank')} value={info.bank.name} />
              <CopyRow
                label={t('settings.subscription.payment.accountNumber')}
                value={info.bank.accountNumber}
              />
              <CopyRow
                label={t('settings.subscription.payment.accountHolder')}
                value={info.bank.accountHolder}
              />
              <CopyRow
                label={t('settings.subscription.payment.memo')}
                value={info.transferMemo}
                highlight
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">
                {t('settings.subscription.payment.uploadProof')}
              </p>
              <p className="text-muted-foreground text-xs">
                {t('settings.subscription.payment.uploadHint')}
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => pickFile(e.target.files)}
              />
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={preview}
                  alt={t('settings.subscription.payment.proof')}
                  className="max-h-40 rounded-lg border object-contain"
                />
              ) : null}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImageUp className="size-4" />
                {file
                  ? t('settings.subscription.payment.changeImage')
                  : t('settings.subscription.payment.chooseImage')}
              </Button>
              <Input
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder={t('settings.subscription.payment.referencePlaceholder')}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="secondary" onClick={() => close(false)}>
            {t('common.action.close')}
          </Button>
          {info && !awaiting ? (
            <Button onClick={handleSubmit} disabled={!file} loading={submit.isPending}>
              {t('settings.subscription.payment.submitProof')}
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** A label + value row with a one-click copy button. */
function CopyRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard?.writeText(value).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    });
  }
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="flex min-w-0 items-center gap-1.5">
        <span className={highlight ? 'text-primary font-semibold' : 'font-medium'}>{value}</span>
        <button
          type="button"
          onClick={copy}
          className="text-muted-foreground hover:text-foreground shrink-0"
          aria-label="copy"
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
        </button>
      </span>
    </div>
  );
}
