'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n/locale-provider';

interface ListPageHeaderProps {
  title: string;
  /** Override the default title styling (e.g. to render a smaller heading). */
  titleClassName?: string;
  description?: string;
  /** When provided, renders a debounced search box on the right. */
  search?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  /** Filter controls (selects, etc.). */
  filters?: ReactNode;
  /** Primary actions (e.g. a "New …" button). */
  actions?: ReactNode;
}

/**
 * List-page header: title/description on the left half, and search + filters +
 * actions grouped on the right half (a 6/6 split on desktop, stacked on mobile).
 */
export function ListPageHeader({
  title,
  titleClassName,
  description,
  search,
  onSearchChange,
  searchPlaceholder,
  filters,
  actions,
}: ListPageHeaderProps) {
  const { t } = useT();
  const [value, setValue] = useState(search ?? '');

  useEffect(() => {
    setValue(search ?? '');
  }, [search]);

  useEffect(() => {
    if (!onSearchChange) return;
    const id = setTimeout(() => {
      if (value !== (search ?? '')) onSearchChange(value);
    }, 350);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="min-w-0 space-y-1">
        <h1 className={cn('text-2xl font-bold tracking-tight sm:text-3xl', titleClassName)}>
          {title}
        </h1>
        {description ? <p className="text-muted-foreground text-sm">{description}</p> : null}
      </div>

      <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center md:w-auto md:justify-end">
        {onSearchChange ? (
          <div className="relative w-full sm:w-64 md:w-72">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={searchPlaceholder ?? t('common.action.searchPlaceholder')}
              className="bg-card pl-8"
            />
          </div>
        ) : null}
        {/* Filters: full-width stacked on phones, inline & wrapping from sm up. */}
        {filters ? (
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center [&>*]:w-full sm:[&>*]:w-auto">
            {filters}
          </div>
        ) : null}
        {/* Actions: full-width buttons on phones for a comfortable tap target. */}
        {actions ? (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center [&>*]:w-full sm:[&>*]:w-auto">
            {actions}
          </div>
        ) : null}
      </div>
    </div>
  );
}
