import { KeyRound } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * The QLT 365 brand mark. The gradient tile and the "365" in the wordmark are
 * driven by the `--primary` token, so they re-skin automatically with the
 * tenant brand color.
 *
 * The wordmark hides in the sidebar's collapsed (icon) state via the
 * `group-data-[collapsible=icon]` modifier exposed by the Sidebar wrapper,
 * leaving just the square mark.
 */
export function BrandLogo({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex items-center gap-2.5 group-data-[collapsible=icon]:gap-0',
        className,
      )}
    >
      <span className="from-primary to-primary/75 text-primary-foreground shadow-primary/30 relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br shadow-sm ring-1 ring-white/15">
        {/* Soft highlight for a glossier, more premium feel. */}
        <span className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/25 to-transparent" />
        <KeyRound className="relative size-[1.15rem]" strokeWidth={2.5} />
      </span>

      <span className="flex flex-col leading-none group-data-[collapsible=icon]:hidden">
        <span className="text-[1.35rem] font-extrabold tracking-tight">
          <span className="text-sidebar-foreground">QLT</span>
          <span className="text-primary">365</span>
        </span>
        <span className="text-sidebar-foreground/45 mt-1 text-[0.6rem] font-semibold tracking-[0.16em] uppercase">
          Quản lý thuê
        </span>
      </span>
    </div>
  );
}
