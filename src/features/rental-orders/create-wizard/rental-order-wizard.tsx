'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, FileText, Send } from 'lucide-react';
import { PageHeader } from '@/components/common/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/lib/toast';
import type { CreateRentalOrderInput } from '../use-rental-orders';
import { useCreateRentalOrder } from '../use-rental-orders';
import { fromDateTimeLocal } from '../datetime';
import { Stepper } from './stepper';
import { StepCustomer } from './step-customer';
import { StepInventory } from './step-inventory';
import { StepRentalInfo } from './step-rental-info';
import { StepReview } from './step-review';
import { createInitialState, type WizardState } from './wizard-state';

const STEPS = ['Customer', 'Inventory', 'Rental info', 'Review', 'Submit'];

export function RentalOrderWizard() {
  const router = useRouter();
  const create = useCreateRentalOrder();
  const [step, setStep] = useState(0);
  const [state, setState] = useState<WizardState>(createInitialState);

  const update = (patch: Partial<WizardState>) => setState((prev) => ({ ...prev, ...patch }));

  const stepError = validateStep(step, state);

  const next = () => {
    if (stepError) {
      toast.warning('Cannot continue', stepError);
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const submit = (status: 'DRAFT' | 'RENTING') => {
    const error = validateAll(state);
    if (error) {
      toast.warning('Cannot submit', error);
      return;
    }

    const input: CreateRentalOrderInput = {
      orderCode: state.orderCode.trim(),
      rentDate: fromDateTimeLocal(state.rentDate),
      expectedReturnDate: fromDateTimeLocal(state.expectedReturnDate),
      depositAmount: state.depositAmount,
      discountAmount: state.discountAmount,
      note: state.note.trim() ? state.note.trim() : undefined,
      status,
      items: state.items.map((i) => ({ inventoryItemId: i.inventoryItemId, price: i.price })),
      ...(state.customerMode === 'EXISTING'
        ? { customerId: state.customerId }
        : {
            customer: {
              name: state.newCustomer.name.trim(),
              phone: state.newCustomer.phone.trim(),
              address: state.newCustomer.address?.trim() || undefined,
              note: state.newCustomer.note?.trim() || undefined,
            },
          }),
    };

    create.mutate(input, {
      onSuccess: (created) => router.push(`/rental-orders/${created.id}`),
    });
  };

  return (
    <div className="space-y-5 pb-24 md:pb-0">
      <Button variant="ghost" size="sm" onClick={() => router.push('/rental-orders')}>
        <ArrowLeft className="size-4" />
        Back to orders
      </Button>

      <PageHeader title="New rental order" description="Follow the steps to create an order." />

      <Stepper steps={STEPS} current={step} />

      <Card>
        <CardContent className="pt-2">
          {step === 0 ? <StepCustomer state={state} update={update} /> : null}
          {step === 1 ? <StepInventory state={state} update={update} /> : null}
          {step === 2 ? <StepRentalInfo state={state} update={update} /> : null}
          {step === 3 ? <StepReview state={state} update={update} /> : null}
          {step === 4 ? <SubmitStep state={state} /> : null}
        </CardContent>
      </Card>

      <div className="bg-background/95 sticky bottom-0 -mx-4 flex items-center justify-between gap-2 border-t p-4 backdrop-blur md:static md:mx-0 md:border-0 md:p-0 md:backdrop-blur-none">
        <Button variant="outline" onClick={back} disabled={step === 0 || create.isPending}>
          <ArrowLeft className="size-4" />
          Back
        </Button>

        {step < STEPS.length - 1 ? (
          <Button onClick={next}>
            Next
            <ArrowRight className="size-4" />
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => submit('DRAFT')}
              loading={create.isPending && create.variables?.status === 'DRAFT'}
              disabled={create.isPending}
            >
              <FileText className="size-4" />
              Save as draft
            </Button>
            <Button
              onClick={() => submit('RENTING')}
              loading={create.isPending && create.variables?.status === 'RENTING'}
              disabled={create.isPending}
            >
              <Send className="size-4" />
              Confirm &amp; rent
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function SubmitStep({ state }: { state: WizardState }) {
  return (
    <div className="space-y-3 text-sm">
      <p className="font-medium">Ready to submit</p>
      <p className="text-muted-foreground">
        Order <strong>{state.orderCode}</strong> with {state.items.length} item
        {state.items.length === 1 ? '' : 's'}. Choose how to save it below:
      </p>
      <ul className="text-muted-foreground list-disc space-y-1 pl-5">
        <li>
          <strong>Save as draft</strong> keeps the order editable and does not reserve items yet.
        </li>
        <li>
          <strong>Confirm &amp; rent</strong> immediately marks the order as renting.
        </li>
      </ul>
    </div>
  );
}

function validateStep(step: number, state: WizardState): string | null {
  switch (step) {
    case 0:
      if (state.customerMode === 'EXISTING') {
        return state.customerId ? null : 'Select an existing customer.';
      }
      if (!state.newCustomer.name.trim()) return 'Enter the customer name.';
      if (!state.newCustomer.phone.trim()) return 'Enter the customer phone.';
      return null;
    case 1:
      return state.items.length > 0 ? null : 'Select at least one inventory item.';
    case 2:
      if (!state.orderCode.trim()) return 'Enter an order code.';
      if (!state.rentDate) return 'Select a rent date.';
      if (!state.expectedReturnDate) return 'Select an expected return date.';
      return null;
    default:
      return null;
  }
}

function validateAll(state: WizardState): string | null {
  return validateStep(0, state) ?? validateStep(1, state) ?? validateStep(2, state);
}
