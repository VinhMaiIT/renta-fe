'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepperProps {
  steps: string[];
  current: number;
}

/** Numbered horizontal stepper; highlights the current step. */
export function Stepper({ steps, current }: StepperProps) {
  return (
    <ol className="flex flex-wrap items-center gap-x-2 gap-y-3">
      {steps.map((label, index) => {
        const isDone = index < current;
        const isCurrent = index === current;
        return (
          <li key={label} className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-medium',
                  isCurrent && 'border-primary bg-primary text-primary-foreground',
                  isDone && 'border-primary bg-primary/10 text-primary',
                  !isCurrent && !isDone && 'border-border text-muted-foreground',
                )}
              >
                {isDone ? <Check className="size-4" /> : index + 1}
              </span>
              <span
                className={cn(
                  'text-sm',
                  isCurrent ? 'text-foreground font-medium' : 'text-muted-foreground',
                )}
              >
                {label}
              </span>
            </div>
            {index < steps.length - 1 ? (
              <span className="bg-border hidden h-px w-6 sm:inline-block" aria-hidden="true" />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
