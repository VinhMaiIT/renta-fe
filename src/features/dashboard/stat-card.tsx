import type { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: number;
  icon: ReactNode;
  hint?: string;
  accentClassName?: string;
  isLoading?: boolean;
}

export function StatCard({
  label,
  value,
  icon,
  hint,
  accentClassName,
  isLoading = false,
}: StatCardProps) {
  return (
    <Card className="gap-0 py-5">
      <CardContent className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-muted-foreground text-sm font-medium">{label}</p>
          {isLoading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <p className="text-3xl font-bold tracking-tight">{value.toLocaleString()}</p>
          )}
          {hint ? <p className="text-muted-foreground text-xs">{hint}</p> : null}
        </div>
        <div
          className={cn(
            'flex size-10 shrink-0 items-center justify-center rounded-lg',
            accentClassName ?? 'bg-primary/10 text-primary',
          )}
        >
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}
