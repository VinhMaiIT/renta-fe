'use client';

import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FormLabel } from '@/components/ui/form-label';
import { FormErrorMessage } from '@/components/ui/form-error-message';
import { cn } from '@/lib/utils';
import type { SelectOption } from './select-field';

interface SelectMenuProps {
  label?: string;
  required?: boolean;
  error?: string;
  id?: string;
  placeholder?: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
}

/**
 * Controlled select rendered as a custom popup (not a native `<select>`), so the
 * option text stays a normal, readable size on every platform — native select
 * dropdowns ignore CSS font-size on macOS/iOS.
 */
export function SelectMenu({
  label,
  required,
  error,
  id,
  placeholder,
  options,
  value,
  onChange,
  onBlur,
  disabled,
}: SelectMenuProps) {
  const selected = options.find((o) => o.value === value);

  return (
    <div className="w-full">
      {label ? <FormLabel label={label} htmlFor={id} required={required} /> : null}
      <DropdownMenu>
        <DropdownMenuTrigger
          disabled={disabled}
          render={
            <Button
              type="button"
              variant="outline"
              id={id}
              aria-invalid={!!error}
              className="w-full justify-between font-normal aria-invalid:border-destructive aria-invalid:ring-destructive/20"
              onBlur={onBlur}
            >
              <span className={cn('truncate', !selected && 'text-muted-foreground')}>
                {selected?.label ?? placeholder}
              </span>
              <ChevronDown className="size-4 shrink-0 opacity-50" />
            </Button>
          }
        />
        <DropdownMenuContent
          align="start"
          className="max-h-72 w-(--anchor-width) min-w-[var(--anchor-width)] overflow-y-auto"
        >
          {options.map((opt) => (
            <DropdownMenuItem
              key={opt.value}
              className="text-base"
              onClick={() => onChange(opt.value)}
            >
              {opt.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      {error ? <FormErrorMessage error={error} /> : null}
    </div>
  );
}
