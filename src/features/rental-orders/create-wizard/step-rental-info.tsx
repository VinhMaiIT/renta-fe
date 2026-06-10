'use client';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useT } from '@/i18n/locale-provider';
import type { WizardState } from './wizard-state';

interface StepRentalInfoProps {
  state: WizardState;
  update: (patch: Partial<WizardState>) => void;
}

export function StepRentalInfo({ state, update }: StepRentalInfoProps) {
  const { t } = useT();
  return (
    <div className="space-y-4">
      <Input
        label={t('rentalOrders.wizard.orderCode')}
        value={state.orderCode}
        onChange={(e) => update({ orderCode: e.target.value })}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label={t('rentalOrders.wizard.rentDate')}
          type="datetime-local"
          value={state.rentDate}
          onChange={(e) => update({ rentDate: e.target.value })}
        />
        <Input
          label={t('rentalOrders.wizard.expectedReturnDate')}
          type="datetime-local"
          value={state.expectedReturnDate}
          onChange={(e) => update({ expectedReturnDate: e.target.value })}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label={t('rentalOrders.wizard.depositAmount')}
          type="number"
          min={0}
          value={state.depositAmount}
          onChange={(e) => update({ depositAmount: Number(e.target.value) || 0 })}
        />
        <Input
          label={t('rentalOrders.wizard.discountAmount')}
          type="number"
          min={0}
          value={state.discountAmount}
          onChange={(e) => update({ discountAmount: Number(e.target.value) || 0 })}
        />
      </div>
      <Textarea
        label={t('rentalOrders.wizard.note')}
        value={state.note}
        onChange={(e) => update({ note: e.target.value })}
      />
    </div>
  );
}
