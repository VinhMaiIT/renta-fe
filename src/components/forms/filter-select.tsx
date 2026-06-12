'use client';

import { SelectMenu } from './select-menu';
import type { SelectOption } from './select-field';

interface FilterSelectProps {
  /** Current filter value; `undefined`/empty means "all". */
  value?: string;
  onChange: (value: string | undefined) => void;
  options: SelectOption[];
  /** Label for the "all" entry (also shown when nothing is selected). */
  allLabel: string;
  ariaLabel?: string;
  className?: string;
}

/**
 * List-page filter dropdown. Custom popup (readable options on every platform)
 * with a built-in "all" option that maps back to `undefined`.
 */
export function FilterSelect({
  value,
  onChange,
  options,
  allLabel,
  ariaLabel,
  className,
}: FilterSelectProps) {
  return (
    <SelectMenu
      options={[{ value: '', label: allLabel }, ...options]}
      value={value ?? ''}
      onChange={(v) => onChange(v || undefined)}
      ariaLabel={ariaLabel}
      triggerClassName={className}
    />
  );
}
