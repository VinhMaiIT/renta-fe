'use client';

import { Fragment } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { NAV_LOOKUP } from '@/constants/navigation';
import { useT } from '@/i18n/locale-provider';

/** Action route segments → breadcrumb phrase key (combined with the resource name). */
const ACTION_LABELS: Record<string, string> = {
  new: 'common.breadcrumb.create',
  edit: 'common.breadcrumb.edit',
};

function humanize(segment: string): string {
  if (/^\d+$/.test(segment)) return `#${segment}`;
  return segment
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ');
}

export function Breadcrumbs() {
  const pathname = usePathname();
  const { t } = useT();
  const segments = pathname.split('/').filter(Boolean);

  /** Label of the nearest ancestor segment that maps to a nav entry. */
  const ancestorResourceLabel = (index: number): string => {
    for (let i = index - 1; i >= 0; i--) {
      const aHref = `/${segments.slice(0, i + 1).join('/')}`;
      if (NAV_LOOKUP[aHref]) return t(NAV_LOOKUP[aHref]);
    }
    return '';
  };

  const crumbs = segments.map((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join('/')}`;
    const navKey = NAV_LOOKUP[href];
    const actionKey = ACTION_LABELS[segment];

    let label: string;
    if (navKey) {
      label = t(navKey);
    } else if (actionKey) {
      // e.g. "Create" + "Products" → "Tạo mới sản phẩm" / "Create product".
      label = t(actionKey, { item: ancestorResourceLabel(index).toLowerCase() }).trim();
    } else {
      label = humanize(segment);
    }

    return { href, label, isLast: index === segments.length - 1 };
  });

  return (
    <Breadcrumb className="hidden sm:block">
      <BreadcrumbList>
        {crumbs.map((crumb) => (
          <Fragment key={crumb.href}>
            <BreadcrumbItem>
              {crumb.isLast ? (
                <BreadcrumbPage className="text-base font-semibold sm:text-lg">
                  {crumb.label}
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink render={<Link href={crumb.href} />}>{crumb.label}</BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {!crumb.isLast ? <BreadcrumbSeparator /> : null}
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
