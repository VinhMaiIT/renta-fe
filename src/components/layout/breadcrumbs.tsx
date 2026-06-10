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

  const crumbs = segments.map((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join('/')}`;
    const key = NAV_LOOKUP[href];
    return {
      href,
      label: key ? t(key) : humanize(segment),
      isLast: index === segments.length - 1,
    };
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
