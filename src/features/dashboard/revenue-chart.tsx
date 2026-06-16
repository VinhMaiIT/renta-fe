'use client';

import { useState } from 'react';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/format';
import { useT } from '@/i18n/locale-provider';
import { buildRevenueSeries } from './use-dashboard';
import type { RentalOrder } from '@/types/models';

const PERIODS = [7, 14, 30] as const;
type Period = (typeof PERIODS)[number];

const chartConfig = {
  revenue: { label: 'Revenue', color: 'var(--primary)' },
} satisfies ChartConfig;

interface RevenueChartProps {
  orders: RentalOrder[];
  isLoading?: boolean;
}

export function RevenueChart({ orders, isLoading = false }: RevenueChartProps) {
  const { t } = useT();
  const [period, setPeriod] = useState<Period>(14);
  const series = buildRevenueSeries(orders, period);
  const total = series.reduce((sum, p) => sum + p.revenue, 0);

  return (
    <Card className="gap-0 overflow-hidden">
      <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
        <div className="space-y-1">
          <p className="text-muted-foreground flex items-center gap-1.5 text-sm font-medium">
            <TrendingUp className="text-primary size-4" />
            {t('dashboard.revenue')}
          </p>
          {isLoading ? (
            <Skeleton className="mt-1 h-8 w-40" />
          ) : (
            <p className="text-2xl font-bold tracking-tight tabular-nums">{formatCurrency(total)}</p>
          )}
          <p className="text-muted-foreground text-xs">
            {t('dashboard.revenuePeriod', { days: period })}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {PERIODS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              aria-pressed={period === p}
              className={cn(
                'border-b-2 px-2.5 py-1 text-xs font-medium transition-colors',
                period === p
                  ? 'border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground border-transparent',
              )}
            >
              {t(`dashboard.period.d${p}`)}
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        {isLoading ? (
          <Skeleton className="h-[240px] w-full" />
        ) : total === 0 ? (
          <div className="text-muted-foreground flex h-[240px] flex-col items-center justify-center gap-2 text-sm">
            <TrendingUp className="size-8 opacity-30" />
            <p>{t('dashboard.noRevenue')}</p>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="aspect-auto h-[240px] w-full">
            <AreaChart data={series} margin={{ left: 4, right: 8, top: 8 }}>
              <defs>
                <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-revenue)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--color-revenue)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={24}
              />
              <ChartTooltip
                cursor={{ strokeDasharray: '4 4' }}
                content={
                  <ChartTooltipContent
                    formatter={(value) => formatCurrency(Number(value))}
                    labelKey="label"
                  />
                }
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="var(--color-revenue)"
                strokeWidth={2.5}
                fill="url(#fillRevenue)"
                dot={false}
                activeDot={{ r: 4 }}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
