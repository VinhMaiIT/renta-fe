'use client';

import { useQueries } from '@tanstack/react-query';
import { http } from '@/lib/api/http';
import { useTenantContext } from '@/hooks/use-tenant-context';
import type { PaginatedResponse } from '@/types/api';
import type { RentalOrder, Customer, InventoryItem } from '@/types/models';

export interface DashboardStats {
  activeRentals: number;
  overdueRentals: number;
  totalCustomers: number;
  totalInventory: number;
  availableInventory: number;
  recentOrders: RentalOrder[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

export function useDashboardStats(): DashboardStats {
  const { tenantId } = useTenantContext();

  const results = useQueries({
    queries: [
      {
        queryKey: ['dashboard', 'activeRentals', tenantId],
        enabled: Boolean(tenantId),
        queryFn: () =>
          http.get<PaginatedResponse<RentalOrder>>('/tenant/rental-orders', {
            params: { status: 'RENTING', pageSize: 1 },
          }),
      },
      {
        queryKey: ['dashboard', 'overdueRentals', tenantId],
        enabled: Boolean(tenantId),
        queryFn: () =>
          http.get<PaginatedResponse<RentalOrder>>('/tenant/rental-orders', {
            params: { status: 'OVERDUE', pageSize: 1 },
          }),
      },
      {
        queryKey: ['dashboard', 'totalCustomers', tenantId],
        enabled: Boolean(tenantId),
        queryFn: () =>
          http.get<PaginatedResponse<Customer>>('/tenant/customers', {
            params: { pageSize: 1 },
          }),
      },
      {
        queryKey: ['dashboard', 'totalInventory', tenantId],
        enabled: Boolean(tenantId),
        queryFn: () =>
          http.get<PaginatedResponse<InventoryItem>>('/tenant/inventory-items', {
            params: { pageSize: 1 },
          }),
      },
      {
        queryKey: ['dashboard', 'availableInventory', tenantId],
        enabled: Boolean(tenantId),
        queryFn: () =>
          http.get<PaginatedResponse<InventoryItem>>('/tenant/inventory-items', {
            params: { status: 'AVAILABLE', pageSize: 1 },
          }),
      },
      {
        queryKey: ['dashboard', 'recentOrders', tenantId],
        enabled: Boolean(tenantId),
        queryFn: () =>
          http.get<PaginatedResponse<RentalOrder>>('/tenant/rental-orders', {
            params: { pageSize: 5, order: 'DESC' },
          }),
      },
    ],
  });

  const [
    activeRentalsQ,
    overdueRentalsQ,
    customersQ,
    totalInventoryQ,
    availableInventoryQ,
    recentOrdersQ,
  ] = results;

  const isLoading = results.some((r) => r.isLoading);
  const isError = results.some((r) => r.isError);

  const refetch = () => {
    results.forEach((r) => {
      void r.refetch();
    });
  };

  return {
    activeRentals: activeRentalsQ.data?.total ?? 0,
    overdueRentals: overdueRentalsQ.data?.total ?? 0,
    totalCustomers: customersQ.data?.total ?? 0,
    totalInventory: totalInventoryQ.data?.total ?? 0,
    availableInventory: availableInventoryQ.data?.total ?? 0,
    recentOrders: recentOrdersQ.data?.items ?? [],
    isLoading,
    isError,
    refetch,
  };
}
