'use client';

import type { ReactNode } from 'react';
import { AlertTriangle, Inbox, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n/locale-provider';

/** Centered empty placeholder. */
export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: {
  title?: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  const { t } = useT();
  return (
    <div
      className={cn(
        'border-border flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-10 text-center',
        className,
      )}
    >
      <div className="bg-muted text-muted-foreground flex size-11 items-center justify-center rounded-full">
        {icon ?? <Inbox className="size-5" />}
      </div>
      <div className="space-y-1">
        <p className="font-medium">{title ?? t('common.state.empty')}</p>
        {description ? <p className="text-muted-foreground text-sm">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

/** Error placeholder with optional retry. */
export function ErrorState({
  title,
  description,
  onRetry,
  className,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}) {
  const { t } = useT();
  return (
    <div
      className={cn(
        'border-destructive/30 bg-destructive/5 flex flex-col items-center justify-center gap-3 rounded-lg border p-10 text-center',
        className,
      )}
    >
      <div className="bg-destructive/10 text-destructive flex size-11 items-center justify-center rounded-full">
        <AlertTriangle className="size-5" />
      </div>
      <div className="space-y-1">
        <p className="font-medium">{title ?? t('common.state.error')}</p>
        {description ? <p className="text-muted-foreground text-sm">{description}</p> : null}
      </div>
      {onRetry ? (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw className="size-4" />
          {t('common.action.retry')}
        </Button>
      ) : null}
    </div>
  );
}
