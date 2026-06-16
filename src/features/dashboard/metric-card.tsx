'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  label: string;
  value: ReactNode;
  icon: ReactNode;
  /** Tailwind classes for the icon tile (bg + text color). */
  accentClassName?: string;
  hint?: ReactNode;
  /** Optional sparkline series (rendered as a soft area line). */
  sparkline?: number[];
  sparklineClassName?: string;
  href?: string;
  isLoading?: boolean;
}

export function MetricCard({
  label,
  value,
  icon,
  accentClassName = 'bg-primary/10 text-primary',
  hint,
  sparkline,
  sparklineClassName = 'text-primary',
  href,
  isLoading = false,
}: MetricCardProps) {
  const body = (
    <div
      className={cn(
        'group bg-card relative flex h-full flex-col overflow-hidden rounded-2xl border p-5 ring-1 ring-foreground/5 transition-all',
        href && 'hover:border-primary/40 hover:-translate-y-0.5 hover:shadow-md',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-muted-foreground text-sm font-medium">{label}</p>
        <span
          className={cn(
            'flex size-10 shrink-0 items-center justify-center rounded-xl',
            accentClassName,
          )}
        >
          {icon}
        </span>
      </div>

      <div className="mt-2 flex items-end justify-between gap-3">
        {isLoading ? (
          <Skeleton className="h-9 w-24" />
        ) : (
          <p className="text-3xl font-bold tracking-tight tabular-nums">{value}</p>
        )}
        {sparkline && sparkline.length > 1 && !isLoading ? (
          <Sparkline data={sparkline} className={sparklineClassName} />
        ) : null}
      </div>

      {hint ? (
        <div className="text-muted-foreground mt-2 flex items-center gap-1 text-xs">{hint}</div>
      ) : null}

      {href ? (
        <ArrowUpRight className="text-muted-foreground/0 group-hover:text-muted-foreground absolute right-4 bottom-4 size-4 transition-colors" />
      ) : null}
    </div>
  );

  return href ? (
    <Link href={href} className="block h-full">
      {body}
    </Link>
  ) : (
    body
  );
}

/** Lightweight, dependency-free area sparkline. */
function Sparkline({ data, className }: { data: number[]; className?: string }) {
  const width = 72;
  const height = 32;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const step = data.length > 1 ? width / (data.length - 1) : width;
  const points = data.map((v, i) => {
    const x = i * step;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return [x, y] as const;
  });
  const line = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const area = `${line} L${width},${height} L0,${height} Z`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={cn('shrink-0 overflow-visible', className)}
      aria-hidden
    >
      <path d={area} fill="currentColor" opacity={0.12} />
      <path
        d={line}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
