'use client';

import { useState, type ReactNode } from 'react';
import { ArrowRight, ArrowUpCircle, Check, Clock, CreditCard, Lock, Sparkles } from 'lucide-react';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { PaymentDialog } from './payment-dialog';
import { StatusBadge } from '@/components/common/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { PAYMENT_CYCLE_META, SUBSCRIPTION_STATUS_META } from '@/constants/enum-labels';
import { formatCurrency, formatDate, formatNumber } from '@/lib/format';
import { useT } from '@/i18n/locale-provider';
import { useSession } from '@/stores/auth-store';
import { cn } from '@/lib/utils';
import type { Package } from '@/types/billing';
import { useAvailablePackages, useTenantProfile, useUpgradePlan } from './use-tenant-settings';

export function SubscriptionSettings() {
  const { t } = useT();
  const session = useSession();
  const isAdmin = Boolean(session?.isAdmin);

  const tenantQuery = useTenantProfile();
  const packagesQuery = useAvailablePackages();
  const upgrade = useUpgradePlan();

  const [target, setTarget] = useState<Package | null>(null);
  const [payOpen, setPayOpen] = useState(false);

  const current = tenantQuery.data?.subscription ?? null;
  const isPending = current?.status === 'PENDING_PAYMENT';
  const cycle = current?.paymentCycle ?? 'MONTHLY';
  const packages = packagesQuery.data ?? [];
  const priceFor = (pkg: Package) => (cycle === 'YEARLY' ? pkg.priceYearly : pkg.priceMonthly);

  const currentPkg = current ? packages.find((p) => p.id === current.packageId) : undefined;
  const currentPrice = currentPkg ? priceFor(currentPkg) : -Infinity;

  // Higher plans only — strictly more expensive than the current one (same cycle).
  const upgradeable = [...packages]
    .filter((p) => p.status === 'ACTIVE')
    .filter((p) => priceFor(p) > currentPrice && p.id !== current?.packageId)
    .sort((a, b) => priceFor(a) - priceFor(b));

  if (tenantQuery.isLoading || packagesQuery.isLoading) return <SubscriptionSkeleton />;

  function confirmUpgrade() {
    if (!target) return;
    upgrade.mutate(
      { packageId: target.id, paymentCycle: cycle },
      { onSuccess: () => setTarget(null) },
    );
  }

  return (
    <div className="space-y-6">
      {/* Current plan ------------------------------------------------------ */}
      {current ? (
        <Card>
          <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
            <div className="space-y-1">
              <p className="text-muted-foreground text-xs">{t('settings.subscription.currentPlan')}</p>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="text-primary size-4" />
                {currentPkg?.name ?? current.packageName}
              </CardTitle>
            </div>
            <StatusBadge meta={SUBSCRIPTION_STATUS_META[current.status]} />
          </CardHeader>
          <Separator />
          <CardContent className="space-y-5 pt-5">
            {isPending ? (
              <div className="flex flex-col gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-amber-500/30 dark:bg-amber-500/10">
                <div className="flex items-start gap-2 text-amber-900 dark:text-amber-200">
                  <Clock className="mt-0.5 size-4 shrink-0" />
                  <p className="text-sm">{t('settings.subscription.pendingNotice')}</p>
                </div>
                {isAdmin ? (
                  <Button size="sm" className="shrink-0" onClick={() => setPayOpen(true)}>
                    <CreditCard className="size-4" />
                    {t('settings.subscription.payNow')}
                  </Button>
                ) : null}
              </div>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Field
                label={t('settings.subscription.cycle')}
                value={<StatusBadge meta={PAYMENT_CYCLE_META[current.paymentCycle]} />}
              />
              {currentPkg ? (
                <Field
                  label={t('settings.subscription.price')}
                  value={
                    <span className="whitespace-nowrap">
                      {formatCurrency(priceFor(currentPkg))}
                      <span className="text-muted-foreground font-normal">
                        {' '}
                        {t(`settings.subscription.per.${cycle}`)}
                      </span>
                    </span>
                  }
                />
              ) : null}
              <Field label={t('settings.subscription.startDate')} value={formatDate(current.startDate)} />
              <Field label={t('settings.subscription.endDate')} value={formatDate(current.endDate)} />
            </div>

            {currentPkg ? <PlanDetails pkg={currentPkg} wide /> : null}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="text-muted-foreground py-8 text-center text-sm">
            {t('settings.subscription.none')}
          </CardContent>
        </Card>
      )}

      {/* Upgrade options --------------------------------------------------- */}
      {isPending ? (
        <p className="text-muted-foreground rounded-lg border border-dashed p-6 text-center text-sm">
          {t('settings.subscription.upgradeLockedPending')}
        </p>
      ) : (
        <div className="space-y-3">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold">{t('settings.subscription.upgradeTitle')}</h3>
            <p className="text-muted-foreground text-sm">{t('settings.subscription.upgradeDesc')}</p>
          </div>

          {upgradeable.length === 0 ? (
            <p className="text-muted-foreground rounded-lg border border-dashed p-6 text-center text-sm">
              {t('settings.subscription.upgradeEmpty')}
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {upgradeable.map((pkg) => (
              <Card key={pkg.id} className="flex flex-col border-primary/30">
                <CardHeader className="space-y-1">
                  <CardTitle className="text-base">{pkg.name}</CardTitle>
                  <p className="text-foreground text-xl font-bold whitespace-nowrap">
                    {formatCurrency(priceFor(pkg))}
                    <span className="text-muted-foreground text-sm font-normal">
                      {' '}
                      {t(`settings.subscription.per.${cycle}`)}
                    </span>
                  </p>
                  {pkg.description ? (
                    <p className="text-muted-foreground text-xs">{pkg.description}</p>
                  ) : null}
                </CardHeader>
                <Separator />
                <CardContent className="flex flex-1 flex-col gap-4 pt-4">
                  <PlanDetails pkg={pkg} comparedTo={currentPkg} className="flex-1" />
                  <Button
                    className="w-full"
                    disabled={!isAdmin || upgrade.isPending}
                    onClick={() => setTarget(pkg)}
                  >
                    {isAdmin ? <ArrowUpCircle className="size-4" /> : <Lock className="size-4" />}
                    {t('settings.subscription.upgrade')}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

          {!isAdmin ? (
            <p className="text-muted-foreground flex items-center gap-1.5 text-sm">
              <Lock className="size-3.5" />
              {t('settings.general.readonlyNote')}
            </p>
          ) : null}
        </div>
      )}

      <ConfirmDialog
        open={target !== null}
        onOpenChange={(open) => !open && setTarget(null)}
        title={t('settings.subscription.confirmTitle')}
        description={
          target
            ? t('settings.subscription.confirmDesc', {
                name: target.name,
                price: `${formatCurrency(priceFor(target))} ${t(`settings.subscription.per.${cycle}`)}`,
              })
            : undefined
        }
        confirmText={t('settings.subscription.upgrade')}
        cancelText={t('common.action.cancel')}
        loading={upgrade.isPending}
        onConfirm={confirmUpgrade}
      />

      <PaymentDialog open={payOpen} onOpenChange={setPayOpen} />
    </div>
  );
}

interface PlanDetailsProps {
  pkg: Package;
  /** When set, limits/features are shown relative to this (the current) plan. */
  comparedTo?: Package;
  /** Spread limit boxes to 4 columns on wider layouts (current-plan card). */
  wide?: boolean;
  className?: string;
}

/** Limits + features block shared by the current plan and each upgrade card. */
function PlanDetails({ pkg, comparedTo, wide = false, className }: PlanDetailsProps) {
  const { t } = useT();

  const limits = [
    { label: t('settings.subscription.limits.branches'), value: pkg.maxBranches, prev: comparedTo?.maxBranches },
    { label: t('settings.subscription.limits.users'), value: pkg.maxUsers, prev: comparedTo?.maxUsers },
    { label: t('settings.subscription.limits.products'), value: pkg.maxProducts, prev: comparedTo?.maxProducts },
    { label: t('settings.subscription.limits.inventoryItems'), value: pkg.maxInventoryItems, prev: comparedTo?.maxInventoryItems },
  ];

  // Features the current plan doesn't have come first and are highlighted.
  // The catalog response may omit `features` or send a non-array, so coerce.
  const baseFeatures = Array.isArray(comparedTo?.features) ? comparedTo.features : [];
  const ownFeatures = Array.isArray(pkg.features) ? pkg.features : [];
  const isNewFeature = (f: string) => Boolean(comparedTo) && !baseFeatures.includes(f);
  const features = comparedTo
    ? [...ownFeatures].sort((a, b) => Number(isNewFeature(b)) - Number(isNewFeature(a)))
    : ownFeatures;

  return (
    <div className={cn('space-y-4', className)}>
      {comparedTo ? (
        <p className="text-muted-foreground text-xs font-medium">
          {t('settings.subscription.vsCurrent')}
        </p>
      ) : null}

      <dl className={cn('grid grid-cols-2 gap-2', wide && 'sm:grid-cols-4')}>
        {limits.map((limit) => {
          const improved = limit.prev !== undefined && limit.value > limit.prev;
          return (
            <div key={limit.label} className="bg-muted/40 rounded-lg border px-3 py-2">
              <dt className="text-muted-foreground truncate text-xs">{limit.label}</dt>
              <dd className="mt-0.5 flex items-baseline gap-1 text-sm font-semibold whitespace-nowrap">
                {improved ? (
                  <>
                    <span className="text-muted-foreground/60 text-xs font-normal line-through">
                      {formatNumber(limit.prev)}
                    </span>
                    <ArrowRight className="text-primary size-3 shrink-0 self-center" />
                    <span className="text-primary">{formatNumber(limit.value)}</span>
                  </>
                ) : (
                  <span>{formatNumber(limit.value)}</span>
                )}
              </dd>
            </div>
          );
        })}
      </dl>

      {features.length > 0 ? (
        <ul className="space-y-1.5">
          {features.map((feature) => {
            const isNew = isNewFeature(feature);
            return (
              <li key={feature} className="flex items-start gap-2 text-sm">
                {isNew ? (
                  <Sparkles className="text-primary mt-0.5 size-4 shrink-0" />
                ) : (
                  <Check className="text-muted-foreground mt-0.5 size-4 shrink-0" />
                )}
                <span className={cn('min-w-0', isNew && 'font-medium')}>{feature}</span>
                {isNew ? (
                  <span className="bg-primary/10 text-primary ml-auto shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium">
                    {t('settings.subscription.featureNew')}
                  </span>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : null}
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

function SubscriptionSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-40 w-full" />
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    </div>
  );
}
