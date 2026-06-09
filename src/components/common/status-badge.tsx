import { cn } from '@/lib/utils';
import type { StatusMeta } from '@/constants/enum-labels';

/** Renders a colored status pill from a {@link StatusMeta} entry. */
export function StatusBadge({ meta, className }: { meta: StatusMeta; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex h-5 w-fit shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium',
        meta.className,
        className,
      )}
    >
      {meta.label}
    </span>
  );
}
