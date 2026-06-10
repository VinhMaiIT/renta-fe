import type { ReactNode } from 'react';
import { AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

type Tone = 'warning' | 'destructive' | 'info';

const TONE: Record<Tone, string> = {
  warning: 'bg-warning/15 text-warning border-warning/30',
  destructive: 'bg-destructive/10 text-destructive border-destructive/30',
  info: 'bg-primary/10 text-primary border-primary/30',
};

/** Inline alert banner for expired / overdue / informational notices. */
export function WarningBanner({
  tone = 'warning',
  children,
  action,
  className,
}: {
  tone?: Tone;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  const Icon = tone === 'info' ? Info : AlertTriangle;
  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-lg border px-4 py-3 text-sm',
        TONE[tone],
        className,
      )}
      role="alert"
    >
      <Icon className="mt-0.5 size-4 shrink-0" />
      <div className="flex-1">{children}</div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
