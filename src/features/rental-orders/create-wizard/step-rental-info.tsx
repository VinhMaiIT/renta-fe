'use client';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { WizardState } from './wizard-state';

interface StepRentalInfoProps {
  state: WizardState;
  update: (patch: Partial<WizardState>) => void;
}

export function StepRentalInfo({ state, update }: StepRentalInfoProps) {
  return (
    <div className="space-y-4">
      <Input
        label="Order code"
        value={state.orderCode}
        onChange={(e) => update({ orderCode: e.target.value })}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Rent date"
          type="datetime-local"
          value={state.rentDate}
          onChange={(e) => update({ rentDate: e.target.value })}
        />
        <Input
          label="Expected return date"
          type="datetime-local"
          value={state.expectedReturnDate}
          onChange={(e) => update({ expectedReturnDate: e.target.value })}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Deposit amount"
          type="number"
          min={0}
          value={state.depositAmount}
          onChange={(e) => update({ depositAmount: Number(e.target.value) || 0 })}
        />
        <Input
          label="Discount amount"
          type="number"
          min={0}
          value={state.discountAmount}
          onChange={(e) => update({ discountAmount: Number(e.target.value) || 0 })}
        />
      </div>
      <Textarea
        label="Note"
        value={state.note}
        onChange={(e) => update({ note: e.target.value })}
      />
    </div>
  );
}
