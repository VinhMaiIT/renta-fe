'use client';

import { CheckCircle2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/common/status-badge';
import { ACTIVE_STATUS_META } from '@/constants/enum-labels';
import { useBranchContext } from '@/features/branches/use-branches';
import { cn } from '@/lib/utils';
import type { Branch } from '@/types/models';

function BranchItem({
  branch,
  isActive,
  onSelect,
}: {
  branch: Branch;
  isActive: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(branch.id)}
      className={cn(
        'flex w-full items-start gap-3 rounded-lg border p-4 text-left transition-colors',
        isActive
          ? 'border-primary bg-primary/5 ring-primary/30 ring-1'
          : 'border-border hover:bg-muted/50',
      )}
    >
      <div className="mt-0.5 shrink-0">
        {isActive ? (
          <CheckCircle2 className="text-primary size-5" />
        ) : (
          <div className="border-border size-5 rounded-full border-2" />
        )}
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium">{branch.name}</span>
          <span className="text-muted-foreground text-xs">({branch.code})</span>
          {branch.isMain ? (
            <span className="bg-primary/10 text-primary rounded px-1.5 py-0.5 text-xs font-medium">
              Main
            </span>
          ) : null}
          <StatusBadge meta={ACTIVE_STATUS_META[branch.status]} />
        </div>
        {branch.address ? <p className="text-muted-foreground text-sm">{branch.address}</p> : null}
      </div>
    </button>
  );
}

export function BranchSettings() {
  const { branches, activeBranchId, isLoading, setBranch } = useBranchContext();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (branches.length === 0) {
    return <p className="text-muted-foreground text-sm">No branches found for your account.</p>;
  }

  return (
    <div className="space-y-3">
      <p className="text-muted-foreground text-sm">
        Select the branch you want to work in. Your active branch affects which data you see.
      </p>
      <div className="space-y-2">
        {branches.map((branch) => (
          <BranchItem
            key={branch.id}
            branch={branch}
            isActive={branch.id === activeBranchId}
            onSelect={setBranch}
          />
        ))}
      </div>
    </div>
  );
}
