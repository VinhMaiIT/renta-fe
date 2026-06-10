'use client';

import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor } from 'lucide-react';
import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useTenantContext } from '@/hooks/use-tenant-context';
import { useT } from '@/i18n/locale-provider';
import { LOCALES, LOCALE_LABELS } from '@/i18n/config';
import { BranchSettings } from './branch-settings';
import { ChangePasswordForm } from './change-password-form';

function ProfileSection() {
  const { tenantId, username } = useTenantContext();
  const { t } = useT();
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <p className="text-muted-foreground text-sm font-medium">{t('settings.profile.username')}</p>
          <p className="font-medium">{username || '—'}</p>
        </div>
        <div className="space-y-1">
          <p className="text-muted-foreground text-sm font-medium">{t('settings.profile.tenant')}</p>
          <p className="font-mono text-sm">{tenantId || '—'}</p>
        </div>
      </div>
    </div>
  );
}

function AppearanceSection() {
  const { theme, setTheme } = useTheme();
  const { t, locale, setLocale } = useT();
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <p className="text-muted-foreground text-sm font-medium">{t('settings.appearance.themeLabel')}</p>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={theme === 'light' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTheme('light')}
          >
            <Sun className="size-4" />
            {t('settings.appearance.light')}
          </Button>
          <Button
            variant={theme === 'dark' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTheme('dark')}
          >
            <Moon className="size-4" />
            {t('settings.appearance.dark')}
          </Button>
          <Button
            variant={theme === 'system' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTheme('system')}
          >
            <Monitor className="size-4" />
            {t('settings.appearance.system')}
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-muted-foreground text-sm font-medium">{t('settings.appearance.languageLabel')}</p>
        <div className="flex flex-wrap gap-2">
          {LOCALES.map((code) => (
            <Button
              key={code}
              variant={locale === code ? 'default' : 'outline'}
              size="sm"
              onClick={() => setLocale(code)}
            >
              {LOCALE_LABELS[code]}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SettingsPage() {
  const { t } = useT();
  return (
    <div className="space-y-6">
      <PageHeader
        title={t('settings.title')}
        description={t('settings.subtitle')}
      />

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">{t('settings.tabs.profile')}</TabsTrigger>
          <TabsTrigger value="appearance">{t('settings.tabs.appearance')}</TabsTrigger>
          <TabsTrigger value="branch">{t('settings.tabs.branch')}</TabsTrigger>
          <TabsTrigger value="security">{t('settings.tabs.security')}</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.profile.title')}</CardTitle>
              <CardDescription>{t('settings.profile.desc')}</CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6">
              <ProfileSection />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.appearance.title')}</CardTitle>
              <CardDescription>{t('settings.appearance.desc')}</CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6">
              <AppearanceSection />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branch">
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.branch.activeBranch')}</CardTitle>
              <CardDescription>{t('settings.branch.switchDesc')}</CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6">
              <BranchSettings />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.security.title')}</CardTitle>
              <CardDescription>{t('settings.security.desc')}</CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="max-w-sm pt-6">
              <ChangePasswordForm />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
