'use client';

import Link from 'next/link';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  PackagePlus,
  Plus,
  RefreshCw,
  UserPlus,
  Wallet,
  Warehouse,
} from 'lucide-react';
import { StatusBadge } from '@/components/common/status-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button, buttonVariants } from '@/components/ui/button';
import { RENTAL_ORDER_STATUS_META } from '@/constants/enum-labels';
import { formatCurrency, formatDate, formatNumber } from '@/lib/format';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n/locale-provider';
import { useSession } from '@/stores/auth-store';
import { buildRevenueSeries, useDashboardData } from './use-dashboard';
import { MetricCard } from './metric-card';
import { RevenueChart } from './revenue-chart';
import { StatusDonut } from './status-donut';

export function DashboardPage() {
  const { t } = useT();
  const session = useSession();
  const {
    statusCounts,
    totalOrders,
    activeRentals,
    overdueRentals,
    totalCustomers,
    totalInventory,
    availableInventory,
    recentOrders,
    isLoading,
    isError,
    refetch,
  } = useDashboardData();

  const hour = new Date().getHours();
  const greetKey = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
  const name = session?.fullName?.trim();
  const greeting = name
    ? `${t(`dashboard.greeting.${greetKey}`)}, ${name}`
    : t(`dashboard.greeting.${greetKey}`);

  const revenueSeries = buildRevenueSeries(recentOrders, 14);
  const periodRevenue = revenueSeries.reduce((sum, p) => sum + p.revenue, 0);
  const availabilityRate =
    totalInventory > 0 ? Math.round((availableInventory / totalInventory) * 100) : 0;
  const inUseInventory = Math.max(totalInventory - availableInventory, 0);

  if (isError) {
    return (
      <div className="space-y-6">
        <Hero
          greeting={greeting}
          subtitle={t('dashboard.welcomeSub')}
          dateLabel={formatDate(new Date())}
          onRefresh={refetch}
          isLoading={isLoading}
        />
        <div className="border-destructive/30 bg-destructive/5 flex flex-col items-center justify-center gap-3 rounded-xl border p-10 text-center">
          <div className="bg-destructive/10 text-destructive flex size-11 items-center justify-center rounded-full">
            <AlertTriangle className="size-5" />
          </div>
          <div className="space-y-1">
            <p className="font-medium">{t('dashboard.errorTitle')}</p>
            <p className="text-muted-foreground text-sm">{t('dashboard.errorDesc')}</p>
          </div>
          <Button variant="outline" size="sm" onClick={refetch}>
            <RefreshCw className="size-4" />
            {t('common.action.retry')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Hero
        greeting={greeting}
        subtitle={t('dashboard.welcomeSub')}
        dateLabel={formatDate(new Date())}
        onRefresh={refetch}
        isLoading={isLoading}
      />

      {/* KPI row -------------------------------------------------------------- */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label={t('dashboard.revenue')}
          value={formatCurrency(periodRevenue)}
          icon={<Wallet className="size-5" />}
          accentClassName="bg-primary/10 text-primary"
          sparkline={revenueSeries.map((p) => p.revenue)}
          sparklineClassName="text-primary"
          hint={t('dashboard.revenuePeriod', { days: 14 })}
          isLoading={isLoading}
        />
        <MetricCard
          label={t('dashboard.activeRentals')}
          value={formatNumber(activeRentals)}
          icon={<Activity className="size-5" />}
          accentClassName="bg-blue-500/10 text-blue-600 dark:text-blue-400"
          hint={t('dashboard.ofTotalOrders', { total: formatNumber(totalOrders) })}
          isLoading={isLoading}
        />
        <MetricCard
          label={t('dashboard.overdueRentals')}
          value={formatNumber(overdueRentals)}
          icon={<AlertTriangle className="size-5" />}
          accentClassName="bg-destructive/10 text-destructive"
          hint={
            <span className="text-destructive font-medium">{t('dashboard.viewOverdue')}</span>
          }
          href="/rental-orders?status=OVERDUE"
          isLoading={isLoading}
        />
        <MetricCard
          label={t('dashboard.availableInventory')}
          value={formatNumber(availableInventory)}
          icon={<CheckCircle2 className="size-5" />}
          accentClassName="bg-success/10 text-success"
          hint={t('dashboard.ofTotalInventory', { total: formatNumber(totalInventory) })}
          isLoading={isLoading}
        />
      </div>

      {/* Charts row ----------------------------------------------------------- */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueChart orders={recentOrders} isLoading={isLoading} />
        </div>
        <StatusDonut statusCounts={statusCounts} totalOrders={totalOrders} isLoading={isLoading} />
      </div>

      {/* Bottom row ----------------------------------------------------------- */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <UtilizationCard
          rate={availabilityRate}
          available={availableInventory}
          inUse={inUseInventory}
          totalCustomers={totalCustomers}
          isLoading={isLoading}
        />
        <div className="lg:col-span-2">
          <RecentOrders orders={recentOrders.slice(0, 6)} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

interface HeroProps {
  greeting: string;
  subtitle: string;
  dateLabel: string;
  onRefresh: () => void;
  isLoading: boolean;
}

function Hero({ greeting, subtitle, dateLabel, onRefresh, isLoading }: HeroProps) {
  const { t } = useT();
  return (
    <section className="from-primary/12 via-primary/5 to-card relative overflow-hidden rounded-2xl border bg-gradient-to-br p-6 ring-1 ring-foreground/5 sm:p-8">
      <div className="bg-primary/10 pointer-events-none absolute -top-24 -right-16 size-64 rounded-full blur-3xl" />
      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1.5">
          <p className="text-muted-foreground text-sm capitalize">{dateLabel}</p>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{greeting}</h1>
          <p className="text-muted-foreground max-w-prose text-sm">{subtitle}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/rental-orders" className={cn(buttonVariants({ variant: 'default' }))}>
            <Plus className="size-4" />
            {t('dashboard.newOrder')}
          </Link>
          <Link href="/customers" className={cn(buttonVariants({ variant: 'outline' }))}>
            <UserPlus className="size-4" />
            {t('dashboard.addCustomer')}
          </Link>
          <Link
            href="/inventory-items"
            className={cn(buttonVariants({ variant: 'outline' }), 'max-sm:hidden')}
          >
            <PackagePlus className="size-4" />
            {t('dashboard.manageInventory')}
          </Link>
          <Button
            variant="outline"
            size="icon"
            onClick={onRefresh}
            aria-label={t('common.action.refresh')}
          >
            <RefreshCw className={isLoading ? 'size-4 animate-spin' : 'size-4'} />
          </Button>
        </div>
      </div>
    </section>
  );
}

interface UtilizationCardProps {
  rate: number;
  available: number;
  inUse: number;
  totalCustomers: number;
  isLoading: boolean;
}

function UtilizationCard({
  rate,
  available,
  inUse,
  totalCustomers,
  isLoading,
}: UtilizationCardProps) {
  const { t } = useT();
  return (
    <Card className="gap-0">
      <CardHeader className="pb-0">
        <CardTitle className="text-muted-foreground flex items-center gap-1.5 text-sm font-medium">
          <Warehouse className="text-primary size-4" />
          {t('dashboard.utilization')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5 pt-4">
        <div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold tracking-tight tabular-nums">
              {isLoading ? '—' : `${rate}%`}
            </span>
            <span className="text-muted-foreground text-xs">{t('dashboard.availableRate')}</span>
          </div>
          <div className="bg-muted mt-3 flex h-2.5 overflow-hidden rounded-full">
            <div
              className="bg-success h-full rounded-full transition-all"
              style={{ width: `${rate}%` }}
            />
          </div>
        </div>

        <ul className="space-y-2 text-sm">
          <li className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2">
              <span className="bg-success size-2.5 rounded-full" />
              {t('dashboard.available')}
            </span>
            <span className="font-medium tabular-nums">{formatNumber(available)}</span>
          </li>
          <li className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2">
              <span className="bg-muted-foreground/40 size-2.5 rounded-full" />
              {t('dashboard.inUse')}
            </span>
            <span className="font-medium tabular-nums">{formatNumber(inUse)}</span>
          </li>
        </ul>

        <Link
          href="/customers"
          className="hover:bg-muted/50 -mx-2 flex items-center justify-between gap-2 rounded-lg px-2 py-2 transition-colors"
        >
          <span className="text-muted-foreground text-sm">{t('dashboard.totalCustomers')}</span>
          <span className="flex items-center gap-1 text-sm font-semibold tabular-nums">
            {formatNumber(totalCustomers)}
            <ArrowRight className="text-muted-foreground size-3.5" />
          </span>
        </Link>
      </CardContent>
    </Card>
  );
}

interface RecentOrdersProps {
  orders: ReturnType<typeof useDashboardData>['recentOrders'];
  isLoading: boolean;
}

function RecentOrders({ orders, isLoading }: RecentOrdersProps) {
  const { t } = useT();
  return (
    <Card className="gap-0">
      <CardHeader className="flex-row items-center justify-between gap-2 pb-3">
        <CardTitle className="text-muted-foreground text-sm font-medium">
          {t('dashboard.recentOrders')}
        </CardTitle>
        <Link
          href="/rental-orders"
          className="text-primary inline-flex items-center gap-1 text-sm font-medium hover:underline"
        >
          {t('dashboard.viewAll')}
          <ArrowRight className="size-3.5" />
        </Link>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        {isLoading ? (
          <div className="divide-border divide-y">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between gap-4 px-6 py-3">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-muted-foreground flex flex-col items-center justify-center gap-2 py-12 text-sm">
            <Activity className="size-8 opacity-30" />
            <p>{t('dashboard.noRecentOrders')}</p>
          </div>
        ) : (
          <ul className="divide-border divide-y">
            {orders.map((order) => (
              <li key={order.id}>
                <Link
                  href={`/rental-orders/${order.id}`}
                  className="hover:bg-muted/50 flex items-center gap-3 px-6 py-3 transition-colors"
                >
                  <span className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-lg text-xs font-semibold">
                    {order.orderCode?.slice(-3) ?? '—'}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{order.orderCode}</p>
                    <p className="text-muted-foreground text-xs">{formatDate(order.rentDate)}</p>
                  </div>
                  <StatusBadge meta={RENTAL_ORDER_STATUS_META[order.status]} />
                  <span className="hidden w-28 shrink-0 text-right text-sm font-semibold tabular-nums sm:block">
                    {formatCurrency(order.totalAmount)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
