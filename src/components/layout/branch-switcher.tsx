'use client';

import { useEffect } from 'react';
import { Building2, Check, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { useBranchContext } from '@/features/branches/use-branches';
import { toast } from '@/lib/toast';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n/locale-provider';

/** Header control to switch the active working branch. */
export function BranchSwitcher() {
  const { branches, activeBranch, activeBranchId, isLoading, setBranch } = useBranchContext();
  const { t } = useT();

  // Default the working branch when none/an invalid one is selected (e.g. a
  // tenant with a single branch) — pick the main branch, else the first.
  useEffect(() => {
    if (isLoading || branches.length === 0) return;
    const valid = activeBranchId && branches.some((b) => b.id === activeBranchId);
    if (!valid) {
      setBranch(branches.find((b) => b.isMain)?.id ?? branches[0].id);
    }
  }, [isLoading, branches, activeBranchId, setBranch]);

  if (isLoading) return <Skeleton className="h-9 w-40" />;
  if (branches.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" size="sm" className="max-w-[200px] justify-start gap-2">
            <Building2 className="size-4 shrink-0" />
            <span className="truncate">
              {activeBranch?.name ?? t('common.action.selectPlaceholder')}
            </span>
            <ChevronsUpDown className="text-muted-foreground ml-auto size-4 shrink-0" />
          </Button>
        }
      />
      <DropdownMenuContent align="start" className="w-56">
        <div className="text-muted-foreground px-2 py-1.5 text-xs font-medium">
          {t('settings.branch.title')}
        </div>
        <DropdownMenuSeparator />
        {branches.map((branch) => (
          <DropdownMenuItem
            key={branch.id}
            onClick={() => {
              setBranch(branch.id);
              toast.success(t('common.toast.updated'), branch.name);
            }}
          >
            <Building2 className="size-4" />
            <span className="truncate">{branch.name}</span>
            <Check
              className={cn(
                'ml-auto size-4',
                branch.id === activeBranchId ? 'opacity-100' : 'opacity-0',
              )}
            />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
