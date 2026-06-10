'use client';

import { Package2 } from 'lucide-react';
import { APP_NAME, APP_VERSION } from '@/constants/config';
import { useT } from '@/i18n/locale-provider';

export function AppFooter() {
  const { t } = useT();
  const year = new Date().getFullYear();

  return (
    <footer className="border-border/60 text-muted-foreground mt-auto border-t px-4 py-4 text-xs sm:px-6">
      <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
        <div className="flex items-center gap-2">
          <span className="bg-primary text-primary-foreground flex size-5 items-center justify-center rounded-md">
            <Package2 className="size-3" />
          </span>
          <span>
            © {year} <span className="text-foreground font-medium">{APP_NAME}</span> ·{' '}
            {t('common.app.tagline')}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5">
            {t('common.footer.version')} {APP_VERSION}
          </span>
          <span className="hidden sm:inline">{t('common.footer.rights')}</span>
        </div>
      </div>
    </footer>
  );
}
