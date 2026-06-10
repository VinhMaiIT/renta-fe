'use client';

import { Construction } from 'lucide-react';
import { PageHeader } from './page-header';
import { useT } from '@/i18n/locale-provider';

/** Placeholder for routes whose feature isn't built yet (keeps the menu navigable). */
export function ComingSoon({ titleKey }: { titleKey: string }) {
  const { t } = useT();
  return (
    <div className="space-y-6">
      <PageHeader title={t(titleKey)} />
      <div className="border-border bg-card text-muted-foreground flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-16 text-center">
        <Construction className="size-10" />
        <p className="text-sm">{t('common.comingSoon')}</p>
      </div>
    </div>
  );
}
