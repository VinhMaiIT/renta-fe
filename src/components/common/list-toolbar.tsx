'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface ListToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  /** Filter controls rendered to the right of the search box. */
  filters?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

/**
 * Search + filters + actions bar for list pages. The search input is debounced
 * before propagating to avoid a request per keystroke.
 */
export function ListToolbar({
  search,
  onSearchChange,
  searchPlaceholder = 'Search…',
  filters,
  actions,
  className,
}: ListToolbarProps) {
  const [value, setValue] = useState(search);

  useEffect(() => {
    setValue(search);
  }, [search]);

  useEffect(() => {
    const id = setTimeout(() => {
      if (value !== search) onSearchChange(value);
    }, 350);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className={cn('flex flex-col gap-3 lg:flex-row lg:items-center', className)}>
      <div className="relative w-full lg:max-w-xs">
        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={searchPlaceholder}
          className="pl-8"
        />
      </div>
      {filters ? <div className="flex flex-wrap items-center gap-2">{filters}</div> : null}
      {actions ? <div className="flex items-center gap-2 lg:ml-auto">{actions}</div> : null}
    </div>
  );
}
