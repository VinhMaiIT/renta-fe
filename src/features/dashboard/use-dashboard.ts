'use client';

import { useQueries } from '@tanstack/react-query';
import { eachDayOfInterval, format, isSameDay, subDays } from 'date-fns';
import { http } from '@/lib/api/http';
import { useTenantContext } from '@/hooks/use-tenant-context';
import { RENTAL_ORDER_STATUS_VALUES, type RentalOrderStatus } from '@/types/enums';
import type { PaginatedResponse } from '@/types/api';
import type { RentalOrder, Customer, InventoryItem } from '@/types/models';

export interface DashboardData {
  statusCounts: Record<RentalOrderStatus, number>;
  totalOrders: number;
  activeRentals: number;
  overdueRentals: number;
  totalCustomers: number;
  totalInventory: number;
  availableInventory: number;
  /** Most recent orders (a window used for the revenue trend + recent list). */
  recentOrders: RentalOrder[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

const emptyCounts = () =>
  RENTAL_ORDER_STATUS_VALUES.reduce(
    (acc, s) => ({ ...acc, [s]: 0 }),
    {} as Record<RentalOrderStatus, number>,
  );

export function useDashboardData(): DashboardData {
  const { tenantId } = useTenantContext();
  const enabled = Boolean(tenantId);

  // One lightweight count per status (pageSize 1 → exact `total`), plus the
  // customer/inventory counts and a recent-orders window for the trend.
  const statusQueries = RENTAL_ORDER_STATUS_VALUES.map((status) => ({
    queryKey: ['dashboard', 'orderStatus', status, tenantId],
    enabled,
    queryFn: () =>
      http.get<PaginatedResponse<RentalOrder>>('/tenant/rental-orders', {
        params: { status, pageSize: 1 },
      }),
  }));

  const results = useQueries({
    queries: [
      ...statusQueries,
      {
        queryKey: ['dashboard', 'customers', tenantId],
        enabled,
        queryFn: () =>
          http.get<PaginatedResponse<Customer>>('/tenant/customers', { params: { pageSize: 1 } }),
      },
      {
        queryKey: ['dashboard', 'inventoryTotal', tenantId],
        enabled,
        queryFn: () =>
          http.get<PaginatedResponse<InventoryItem>>('/tenant/inventory-items', {
            params: { pageSize: 1 },
          }),
      },
      {
        queryKey: ['dashboard', 'inventoryAvailable', tenantId],
        enabled,
        queryFn: () =>
          http.get<PaginatedResponse<InventoryItem>>('/tenant/inventory-items', {
            params: { status: 'AVAILABLE', pageSize: 1 },
          }),
      },
      {
        queryKey: ['dashboard', 'recentWindow', tenantId],
        enabled,
        queryFn: () =>
          http.get<PaginatedResponse<RentalOrder>>('/tenant/rental-orders', {
            params: { pageSize: 100, order: 'DESC' },
          }),
      },
    ],
  });

  const statusCount = RENTAL_ORDER_STATUS_VALUES.length;
  const statusResults = results.slice(0, statusCount);
  const [customersQ, invTotalQ, invAvailQ, recentQ] = results.slice(statusCount);

  const statusCounts = emptyCounts();
  RENTAL_ORDER_STATUS_VALUES.forEach((s, i) => {
    statusCounts[s] = statusResults[i]?.data?.total ?? 0;
  });
  const totalOrders = Object.values(statusCounts).reduce((a, b) => a + b, 0);

  const isLoading = results.some((r) => r.isLoading);
  const isError = results.some((r) => r.isError);
  const refetch = () =>
    results.forEach((r) => {
      void r.refetch();
    });

  return {
    statusCounts,
    totalOrders,
    activeRentals: statusCounts.RENTING ?? 0,
    overdueRentals: statusCounts.OVERDUE ?? 0,
    totalCustomers: customersQ?.data?.total ?? 0,
    totalInventory: invTotalQ?.data?.total ?? 0,
    availableInventory: invAvailQ?.data?.total ?? 0,
    recentOrders: (recentQ?.data?.items as RentalOrder[] | undefined) ?? [],
    isLoading,
    isError,
    refetch,
  };
}

export interface RevenuePoint {
  date: string;
  label: string;
  revenue: number;
}

/** Bucket order totals by day for the last `days` days (oldest → newest). */
export function buildRevenueSeries(orders: RentalOrder[], days: number): RevenuePoint[] {
  const today = new Date();
  const span = eachDayOfInterval({ start: subDays(today, days - 1), end: today });
  return span.map((day) => {
    const revenue = orders.reduce((sum, order) => {
      if (!order.rentDate) return sum;
      return isSameDay(new Date(order.rentDate), day) ? sum + (order.totalAmount ?? 0) : sum;
    }, 0);
    return { date: format(day, 'yyyy-MM-dd'), label: format(day, 'dd/MM'), revenue };
  });
}
