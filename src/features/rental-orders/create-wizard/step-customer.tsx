'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Check } from 'lucide-react';
import { http } from '@/lib/api/http';
import { useTenantContext } from '@/hooks/use-tenant-context';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { useT } from '@/i18n/locale-provider';
import { cn } from '@/lib/utils';
import type { Customer } from '@/types/models';
import type { PaginatedResponse } from '@/types/api';
import type { WizardState } from './wizard-state';

interface StepCustomerProps {
  state: WizardState;
  update: (patch: Partial<WizardState>) => void;
}

export function StepCustomer({ state, update }: StepCustomerProps) {
  const { t } = useT();
  const { tenantId } = useTenantContext();
  const [search, setSearch] = useState('');

  const customersQuery = useQuery({
    queryKey: ['wizard-customers', tenantId, search],
    enabled: state.customerMode === 'EXISTING' && Boolean(tenantId),
    queryFn: () =>
      http.get<PaginatedResponse<Customer>>('/customers', {
        params: { tenantId, search: search || undefined, pageSize: 20 },
      }),
  });

  const customers = customersQuery.data?.items ?? [];

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <ModeButton
          active={state.customerMode === 'EXISTING'}
          onClick={() => update({ customerMode: 'EXISTING' })}
        >
          {t('rentalOrders.wizard.existingCustomer')}
        </ModeButton>
        <ModeButton
          active={state.customerMode === 'NEW'}
          onClick={() => update({ customerMode: 'NEW' })}
        >
          {t('rentalOrders.wizard.newCustomer')}
        </ModeButton>
      </div>

      {state.customerMode === 'EXISTING' ? (
        <div className="space-y-3">
          <Input
            placeholder={t('rentalOrders.wizard.searchCustomerPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {customersQuery.isLoading ? (
            <div className="text-muted-foreground flex items-center gap-2 p-4 text-sm">
              <Spinner /> {t('rentalOrders.wizard.loadingCustomers')}
            </div>
          ) : customers.length === 0 ? (
            <p className="text-muted-foreground p-4 text-sm">{t('rentalOrders.wizard.noCustomersFound')}</p>
          ) : (
            <div className="flex max-h-72 flex-col gap-2 overflow-y-auto">
              {customers.map((customer) => {
                const selected = state.customerId === customer.id;
                const label = `${customer.name} · ${customer.phone}`;
                return (
                  <Card
                    key={customer.id}
                    size="sm"
                    onClick={() => update({ customerId: customer.id, customerLabel: label })}
                    className={cn(
                      'cursor-pointer flex-row items-center justify-between px-4 py-3',
                      selected && 'ring-primary ring-2',
                    )}
                  >
                    <div>
                      <p className="font-medium">{customer.name}</p>
                      <p className="text-muted-foreground text-xs">{customer.phone}</p>
                    </div>
                    {selected ? <Check className="text-primary size-4" /> : null}
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <Input
            label={t('rentalOrders.wizard.customerName')}
            required
            value={state.newCustomer.name}
            onChange={(e) =>
              update({ newCustomer: { ...state.newCustomer, name: e.target.value } })
            }
          />
          <Input
            label={t('rentalOrders.wizard.customerPhone')}
            required
            value={state.newCustomer.phone}
            onChange={(e) =>
              update({ newCustomer: { ...state.newCustomer, phone: e.target.value } })
            }
          />
          <Input
            label={t('rentalOrders.wizard.customerAddress')}
            value={state.newCustomer.address ?? ''}
            onChange={(e) =>
              update({ newCustomer: { ...state.newCustomer, address: e.target.value } })
            }
          />
          <Textarea
            label={t('rentalOrders.wizard.customerNote')}
            value={state.newCustomer.note ?? ''}
            onChange={(e) =>
              update({ newCustomer: { ...state.newCustomer, note: e.target.value } })
            }
          />
        </div>
      )}
    </div>
  );
}

function ModeButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex-1 rounded-md border px-4 py-2 text-sm font-medium transition-colors',
        active
          ? 'border-primary bg-primary/10 text-primary'
          : 'border-border text-muted-foreground hover:bg-muted',
      )}
    >
      {children}
    </button>
  );
}
