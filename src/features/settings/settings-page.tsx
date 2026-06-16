'use client';

import { useTheme } from 'next-themes';
import {
  Sun,
  Moon,
  Monitor,
  Building2,
  Palette,
  CreditCard,
  Store,
  UserCog,
  ShieldCheck,
  Construction,
} from 'lucide-react';
import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useT } from '@/i18n/locale-provider';
import { LOCALES, LOCALE_LABELS } from '@/i18n/config';
import { TenantProfileSettings } from './tenant-profile-settings';
import { BrandSettings } from './brand-settings';
import { SubscriptionSettings } from './subscription-settings';
import { BranchesScreen } from '@/features/branches/branches-screen';

function AppearanceSection() {
  const { theme, setTheme } = useTheme();
  const { t, locale, setLocale } = useT();
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <p className="text-muted-foreground text-sm font-medium">
          {t('settings.appearance.themeLabel')}
        </p>
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
        <p className="text-muted-foreground text-sm font-medium">
          {t('settings.appearance.languageLabel')}
        </p>
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

      <Separator />

      <div className="space-y-3">
        <p className="text-muted-foreground text-sm font-medium">
          {t('settings.appearance.brandLabel')}
        </p>
        <BrandSettings />
      </div>
    </div>
  );
}

const TRIGGER_CLASS =
  'relative h-auto w-full flex-none justify-start gap-2 px-3 py-2 before:absolute before:top-1/2 before:left-0.5 before:h-5 before:w-1 before:-translate-y-1/2 before:rounded-full before:bg-primary before:opacity-0 data-active:bg-primary/10 data-active:font-semibold data-active:text-primary data-active:shadow-none data-active:before:opacity-100 dark:data-active:bg-primary/15 dark:data-active:text-primary';

/** Placeholder body for tabs whose feature isn't built yet. */
function ComingSoonBlock() {
  const { t } = useT();
  return (
    <div className="text-muted-foreground flex flex-col items-center justify-center gap-3 py-12 text-center">
      <Construction className="size-10" />
      <p className="text-sm">{t('common.comingSoon')}</p>
    </div>
  );
}

export function SettingsPage() {
  const { t } = useT();

  // Order: org identity → structure → people/permissions → billing → personal UI.
  const tabs = [
    {
      value: 'general',
      icon: Building2,
      label: t('settings.tabs.general'),
      title: t('settings.general.title'),
      desc: t('settings.general.desc'),
      content: <TenantProfileSettings />,
    },
    {
      value: 'branches',
      icon: Store,
      label: t('settings.tabs.branches'),
      title: t('settings.branches.title'),
      desc: t('settings.branches.desc'),
      content: <BranchesScreen />,
    },
    {
      value: 'staff',
      icon: UserCog,
      label: t('settings.tabs.staff'),
      title: t('settings.staff.title'),
      desc: t('settings.staff.desc'),
      content: <ComingSoonBlock />,
    },
    {
      value: 'roles',
      icon: ShieldCheck,
      label: t('settings.tabs.roles'),
      title: t('settings.roles.title'),
      desc: t('settings.roles.desc'),
      content: <ComingSoonBlock />,
    },
    {
      value: 'subscription',
      icon: CreditCard,
      label: t('settings.tabs.subscription'),
      title: t('settings.subscription.title'),
      desc: t('settings.subscription.cardDesc'),
      content: <SubscriptionSettings />,
    },
    {
      value: 'appearance',
      icon: Palette,
      label: t('settings.tabs.appearance'),
      title: t('settings.appearance.title'),
      desc: t('settings.appearance.desc'),
      content: <AppearanceSection />,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title={t('settings.title')} description={t('settings.subtitle')} />

      <Tabs
        defaultValue="general"
        orientation="vertical"
        className="gap-6 max-md:flex-col max-md:gap-3"
      >
        <TabsList className="bg-muted/50 h-fit flex-col gap-1 rounded-xl p-1.5 max-md:w-full md:w-56">
          {tabs.map(({ value, icon: Icon, label }) => (
            <TabsTrigger key={value} value={value} className={TRIGGER_CLASS}>
              <Icon />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="min-w-0 flex-1">
          {tabs.map(({ value, title, desc, content }) => (
            <TabsContent key={value} value={value}>
              <Card className="gap-4">
                <CardHeader>
                  <CardTitle>{title}</CardTitle>
                  <CardDescription>{desc}</CardDescription>
                </CardHeader>
                <Separator />
                <CardContent>{content}</CardContent>
              </Card>
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  );
}
