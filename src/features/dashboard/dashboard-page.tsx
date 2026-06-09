'use client';

import Link from 'next/link';
import {
  ActivitySquare,
  AlertTriangle,
  Users,
  Package,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { PageHeader } from '@/components/common/page-header';
import { StatusBadge } from '@/components/common/status-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { RENTAL_ORDER_STATUS_META } from '@/constants/enum-labels';
import { formatCurrency, formatDate } from '@/lib/format';
import { useDashboardStats } from './use-dashboard';
import { StatCard } from './stat-card';

export function DashboardPage() {
  const {
    activeRentals,
    overdueRentals,
    totalCustomers,
    totalInventory,
    availableInventory,
    recentOrders,
    isLoading,
    isError,
    refetch,
  } = useDashboardStats();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        actions={
          <Button variant="outline" size="sm" onClick={refetch} disabled={isLoading}>
            <RefreshCw className={isLoading ? 'size-4 animate-spin' : 'size-4'} />
            Refresh
          </Button>
        }
      />

      {isError ? (
        <div className="border-destructive/30 bg-destructive/5 flex flex-col items-center justify-center gap-3 rounded-lg border p-10 text-center">
          <div className="bg-destructive/10 text-destructive flex size-11 items-center justify-center rounded-full">
            <AlertTriangle className="size-5" />
          </div>
          <div className="space-y-1">
            <p className="font-medium">Failed to load dashboard data</p>
            <p className="text-muted-foreground text-sm">Please try again.</p>
          </div>
          <Button variant="outline" size="sm" onClick={refetch}>
            <RefreshCw className="size-4" />
            Try again
          </Button>
        </div>
      ) : (
        <>
          {/* Stats grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              label="Active Rentals"
              value={activeRentals}
              icon={<ActivitySquare className="size-5" />}
              accentClassName="bg-primary/10 text-primary"
              isLoading={isLoading}
            />
            <StatCard
              label="Overdue Rentals"
              value={overdueRentals}
              icon={<AlertTriangle className="size-5" />}
              accentClassName="bg-destructive/10 text-destructive"
              isLoading={isLoading}
            />
            <StatCard
              label="Total Customers"
              value={totalCustomers}
              icon={<Users className="size-5" />}
              accentClassName="bg-blue-500/10 text-blue-600 dark:text-blue-400"
              isLoading={isLoading}
            />
            <StatCard
              label="Total Inventory"
              value={totalInventory}
              icon={<Package className="size-5" />}
              accentClassName="bg-purple-500/10 text-purple-600 dark:text-purple-400"
              isLoading={isLoading}
            />
            <StatCard
              label="Available Inventory"
              value={availableInventory}
              icon={<CheckCircle2 className="size-5" />}
              accentClassName="bg-success/10 text-success"
              isLoading={isLoading}
            />
          </div>

          {/* Recent Rental Orders */}
          <Card>
            <CardHeader className="border-b pb-4">
              <CardTitle>Recent Rental Orders</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="divide-border divide-y">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between gap-4 px-6 py-3">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-5 w-20 rounded-full" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  ))}
                </div>
              ) : recentOrders.length === 0 ? (
                <div className="text-muted-foreground flex flex-col items-center justify-center gap-2 py-12 text-sm">
                  <ActivitySquare className="size-8 opacity-40" />
                  <p>No rental orders yet</p>
                </div>
              ) : (
                <div className="divide-border divide-y">
                  {recentOrders.map((order) => (
                    <Link
                      key={order.id}
                      href={`/rental-orders/${order.id}`}
                      className="hover:bg-muted/50 flex items-center justify-between gap-4 px-6 py-3 transition-colors"
                    >
                      <span className="min-w-0 shrink-0 font-medium">{order.orderCode}</span>
                      <StatusBadge meta={RENTAL_ORDER_STATUS_META[order.status]} />
                      <span className="text-muted-foreground hidden shrink-0 text-sm sm:block">
                        {formatDate(order.rentDate)}
                      </span>
                      <span className="shrink-0 text-sm font-medium">
                        {formatCurrency(order.totalAmount)}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
