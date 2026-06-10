'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatCurrency, formatDateTime } from '@/lib/format';
import { useT } from '@/i18n/locale-provider';
import { fromDateTimeLocal } from '../datetime';
import { itemsTotal, orderTotal, type WizardState } from './wizard-state';

interface StepReviewProps {
  state: WizardState;
  update: (patch: Partial<WizardState>) => void;
}

export function StepReview({ state, update }: StepReviewProps) {
  const { t } = useT();
  const customerSummary =
    state.customerMode === 'EXISTING'
      ? state.customerLabel || state.customerId
      : `${state.newCustomer.name} · ${state.newCustomer.phone} ${t('rentalOrders.wizard.newCustomerSuffix')}`;

  const safeDate = (value: string) => {
    if (!value) return '—';
    try {
      return formatDateTime(fromDateTimeLocal(value));
    } catch {
      return '—';
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{t('rentalOrders.wizard.reviewSummary')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <Row label={t('rentalOrders.wizard.reviewOrderCode')}>
            <input
              className="border-input w-48 rounded-md border bg-transparent px-2 py-1 text-right text-sm"
              value={state.orderCode}
              onChange={(e) => update({ orderCode: e.target.value })}
              aria-label={t('rentalOrders.wizard.reviewOrderCode')}
            />
          </Row>
          <Row label={t('rentalOrders.wizard.reviewCustomer')}>{customerSummary}</Row>
          <Row label={t('rentalOrders.wizard.reviewRentDate')}>{safeDate(state.rentDate)}</Row>
          <Row label={t('rentalOrders.wizard.reviewExpectedReturn')}>
            {safeDate(state.expectedReturnDate)}
          </Row>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {t('rentalOrders.wizard.reviewItems', { count: state.items.length })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {state.items.map((item) => (
            <div key={item.inventoryItemId} className="flex items-center justify-between">
              <span>{item.serialCode}</span>
              <span>{formatCurrency(item.price)}</span>
            </div>
          ))}
          <Separator className="my-2" />
          <Row label={t('rentalOrders.wizard.itemsSubtotal')}>
            {formatCurrency(itemsTotal(state))}
          </Row>
          <Row label={t('rentalOrders.wizard.discount')}>
            - {formatCurrency(state.discountAmount)}
          </Row>
          <Row label={t('rentalOrders.wizard.depositLabel')}>
            {formatCurrency(state.depositAmount)}
          </Row>
          <Separator className="my-2" />
          <div className="flex items-center justify-between font-semibold">
            <span>{t('rentalOrders.wizard.total')}</span>
            <span>{formatCurrency(orderTotal(state))}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{children}</span>
    </div>
  );
}
