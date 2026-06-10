'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, FileText, Send } from 'lucide-react';
import { PageHeader } from '@/components/common/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/lib/toast';
import { useT } from '@/i18n/locale-provider';
import type { CreateRentalOrderInput } from '../use-rental-orders';
import { useCreateRentalOrder } from '../use-rental-orders';
import { fromDateTimeLocal } from '../datetime';
import { Stepper } from './stepper';
import { StepCustomer } from './step-customer';
import { StepInventory } from './step-inventory';
import { StepRentalInfo } from './step-rental-info';
import { StepReview } from './step-review';
import { createInitialState, type WizardState } from './wizard-state';

export function RentalOrderWizard() {
  const { t } = useT();
  const router = useRouter();
  const create = useCreateRentalOrder();
  const [step, setStep] = useState(0);
  const [state, setState] = useState<WizardState>(createInitialState);

  const STEPS = [
    t('rentalOrders.wizard.steps.customer'),
    t('rentalOrders.wizard.steps.inventory'),
    t('rentalOrders.wizard.steps.rentalInfo'),
    t('rentalOrders.wizard.steps.review'),
    t('rentalOrders.wizard.steps.submit'),
  ];

  const update = (patch: Partial<WizardState>) => setState((prev) => ({ ...prev, ...patch }));

  const stepError = validateStep(step, state, t);

  const next = () => {
    if (stepError) {
      toast.warning(t('rentalOrders.wizard.cannotContinue'), stepError);
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const submit = (status: 'DRAFT' | 'RENTING') => {
    const error = validateAll(state, t);
    if (error) {
      toast.warning(t('rentalOrders.wizard.cannotSubmit'), error);
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
        {t('rentalOrders.wizard.backToOrders')}
      </Button>

      <PageHeader
        title={t('rentalOrders.wizard.title')}
        description={t('rentalOrders.wizard.description')}
      />

      <Stepper steps={STEPS} current={step} />

      <Card>
        <CardContent className="pt-2">
          {step === 0 ? <StepCustomer state={state} update={update} /> : null}
          {step === 1 ? <StepInventory state={state} update={update} /> : null}
          {step === 2 ? <StepRentalInfo state={state} update={update} /> : null}
          {step === 3 ? <StepReview state={state} update={update} /> : null}
          {step === 4 ? <SubmitStep state={state} t={t} /> : null}
        </CardContent>
      </Card>

      <div className="bg-background/95 sticky bottom-0 -mx-4 flex items-center justify-between gap-2 border-t p-4 backdrop-blur md:static md:mx-0 md:border-0 md:p-0 md:backdrop-blur-none">
        <Button variant="outline" onClick={back} disabled={step === 0 || create.isPending}>
          <ArrowLeft className="size-4" />
          {t('rentalOrders.wizard.back')}
        </Button>

        {step < STEPS.length - 1 ? (
          <Button onClick={next}>
            {t('rentalOrders.wizard.next')}
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
              {t('rentalOrders.wizard.saveDraft')}
            </Button>
            <Button
              onClick={() => submit('RENTING')}
              loading={create.isPending && create.variables?.status === 'RENTING'}
              disabled={create.isPending}
            >
              <Send className="size-4" />
              {t('rentalOrders.wizard.confirmRent')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function SubmitStep({ state, t }: { state: WizardState; t: (key: string, vars?: Record<string, string | number>) => string }) {
  const count = state.items.length;
  return (
    <div className="space-y-3 text-sm">
      <p className="font-medium">{t('rentalOrders.wizard.readyToSubmit')}</p>
      <p className="text-muted-foreground">
        {count === 1
          ? t('rentalOrders.wizard.readyDesc', { orderCode: state.orderCode, count })
          : t('rentalOrders.wizard.readyDescPlural', { orderCode: state.orderCode, count })}
      </p>
      <ul className="text-muted-foreground list-disc space-y-1 pl-5">
        <li>
          <strong>{t('rentalOrders.wizard.saveDraft')}</strong>{' '}
          {t('rentalOrders.wizard.saveDraftDesc', { saveDraft: '' }).replace(/ $/, '')}
        </li>
        <li>
          <strong>{t('rentalOrders.wizard.confirmRent')}</strong>{' '}
          {t('rentalOrders.wizard.confirmRentDesc', { confirmRent: '' }).replace(/ $/, '')}
        </li>
      </ul>
    </div>
  );
}

function validateStep(step: number, state: WizardState, t: (key: string) => string): string | null {
  switch (step) {
    case 0:
      if (state.customerMode === 'EXISTING') {
        return state.customerId ? null : t('rentalOrders.wizard.validationSelectCustomer');
      }
      if (!state.newCustomer.name.trim()) return t('rentalOrders.wizard.validationCustomerName');
      if (!state.newCustomer.phone.trim()) return t('rentalOrders.wizard.validationCustomerPhone');
      return null;
    case 1:
      return state.items.length > 0 ? null : t('rentalOrders.wizard.validationSelectItems');
    case 2:
      if (!state.orderCode.trim()) return t('rentalOrders.wizard.validationOrderCode');
      if (!state.rentDate) return t('rentalOrders.wizard.validationRentDate');
      if (!state.expectedReturnDate) return t('rentalOrders.wizard.validationExpectedReturn');
      return null;
    default:
      return null;
  }
}

function validateAll(state: WizardState, t: (key: string) => string): string | null {
  return validateStep(0, state, t) ?? validateStep(1, state, t) ?? validateStep(2, state, t);
}
