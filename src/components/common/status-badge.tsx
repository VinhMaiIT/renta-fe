'use client';

import { cn } from '@/lib/utils';
import { useT } from '@/i18n/locale-provider';
import type { StatusMeta } from '@/constants/enum-labels';

/** Renders a colored, translated status pill from a {@link StatusMeta} entry. */
export function StatusBadge({ meta, className }: { meta: StatusMeta; className?: string }) {
  const { t } = useT();
  return (
    <span
      className={cn(
        'inline-flex h-5 w-fit shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium',
        meta.className,
        className,
      )}
    >
      {t(meta.key)}
    </span>
  );
}
