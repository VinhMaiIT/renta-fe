'use client';

import { useT } from '@/i18n/locale-provider';
import type { StatusMeta } from '@/constants/enum-labels';

export interface EnumOption<T extends string> {
  value: T;
  label: string;
}

/**
 * Build translated `{ value, label }` options from a status-meta map (for
 * selects/filters). Replaces the old static `toOptions` so labels follow the
 * active locale.
 */
export function useEnumOptions<T extends string>(meta: Record<T, StatusMeta>): EnumOption<T>[] {
  const { t } = useT();
  return (Object.keys(meta) as T[]).map((value) => ({ value, label: t(meta[value].key) }));
}
