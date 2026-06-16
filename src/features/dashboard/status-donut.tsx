'use client';

import { Cell, Pie, PieChart } from 'recharts';
import { PieChart as PieIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { formatNumber } from '@/lib/format';
import { useT } from '@/i18n/locale-provider';
import { RENTAL_ORDER_STATUS_VALUES, type RentalOrderStatus } from '@/types/enums';

/** Raw color per status (matches the status-badge tones where possible). */
const STATUS_COLOR: Record<RentalOrderStatus, string> = {
  DRAFT: 'var(--muted-foreground)',
  RENTING: 'var(--primary)',
  PARTIALLY_RETURNED: 'var(--chart-4)',
  RETURNED: 'var(--success)',
  OVERDUE: 'var(--destructive)',
  CANCELLED: 'var(--border)',
};

interface StatusDonutProps {
  statusCounts: Record<RentalOrderStatus, number>;
  totalOrders: number;
  isLoading?: boolean;
}

export function StatusDonut({ statusCounts, totalOrders, isLoading = false }: StatusDonutProps) {
  const { t } = useT();

  const data = RENTAL_ORDER_STATUS_VALUES.filter((s) => statusCounts[s] > 0).map((status) => ({
    status,
    label: t(`enums.orderStatus.${status}`),
    value: statusCounts[status],
    fill: STATUS_COLOR[status],
  }));

  const chartConfig = data.reduce(
    (acc, d) => ({ ...acc, [d.status]: { label: d.label, color: d.fill } }),
    {} as ChartConfig,
  );

  return (
    <Card className="gap-0">
      <CardHeader className="pb-0">
        <CardTitle className="text-muted-foreground flex items-center gap-1.5 text-sm font-medium">
          <PieIcon className="text-primary size-4" />
          {t('dashboard.ordersByStatus')}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {isLoading ? (
          <Skeleton className="mx-auto h-[180px] w-[180px] rounded-full" />
        ) : totalOrders === 0 ? (
          <div className="text-muted-foreground flex h-[180px] flex-col items-center justify-center gap-2 text-sm">
            <PieIcon className="size-8 opacity-30" />
            <p>{t('dashboard.noRecentOrders')}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-2">
            <div className="relative shrink-0">
              <ChartContainer config={chartConfig} className="aspect-square h-[180px]">
                <PieChart>
                  <ChartTooltip
                    content={<ChartTooltipContent nameKey="label" hideLabel />}
                  />
                  <Pie
                    data={data}
                    dataKey="value"
                    nameKey="label"
                    innerRadius={58}
                    outerRadius={84}
                    paddingAngle={2}
                    strokeWidth={2}
                  >
                    {data.map((d) => (
                      <Cell key={d.status} fill={d.fill} className="stroke-card" />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold tabular-nums">{formatNumber(totalOrders)}</span>
                <span className="text-muted-foreground text-xs">{t('dashboard.ordersUnit')}</span>
              </div>
            </div>

            <ul className="grid w-full grid-cols-2 gap-x-4 gap-y-1.5 sm:grid-cols-1">
              {data.map((d) => (
                <li key={d.status} className="flex items-center justify-between gap-2 text-sm">
                  <span className="flex min-w-0 items-center gap-2">
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: d.fill }}
                    />
                    <span className="truncate">{d.label}</span>
                  </span>
                  <span className="font-medium tabular-nums">{formatNumber(d.value)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
