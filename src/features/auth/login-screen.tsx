'use client';

import { BadgeCheck, Boxes, Package2, Receipt, ShieldCheck } from 'lucide-react';
import { LoginForm } from '@/features/auth/login-form';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { LanguageSwitcher } from '@/components/layout/language-switcher';
import { APP_NAME } from '@/constants/config';
import { useT } from '@/i18n/locale-provider';

// High-impact editorial photo (boutique / fashion rental vibe).
const HERO_IMAGE =
  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=2070&q=85';

export function LoginScreen() {
  const { t } = useT();

  const highlights = [
    { icon: Boxes, label: t('auth.highlight.inventory'), desc: t('auth.highlight.inventoryDesc') },
    { icon: Receipt, label: t('auth.highlight.orders'), desc: t('auth.highlight.ordersDesc') },
    { icon: BadgeCheck, label: t('auth.highlight.returns'), desc: t('auth.highlight.returnsDesc') },
  ];

  return (
    <div className="grid min-h-screen lg:grid-cols-10">
      {/* Left — image / brand panel (desktop), 70% width */}
      <div className="relative hidden overflow-hidden lg:col-span-7 lg:block">
        <div
          className="absolute inset-0 scale-105 bg-cover bg-center"
          style={{ backgroundImage: `url(${HERO_IMAGE})` }}
        />
        {/* Layered overlays for depth + legibility */}
        <div className="from-primary/90 via-primary/55 absolute inset-0 bg-gradient-to-tr to-black/80" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

        <div className="relative flex h-full flex-col justify-between p-12 text-white xl:p-16">
          <div className="flex items-center gap-3">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25 backdrop-blur">
              <Package2 className="size-6" />
            </span>
            <div className="leading-tight">
              <p className="text-xl font-bold tracking-tight">{APP_NAME}</p>
              <p className="text-sm text-white/70">{t('common.app.tagline')}</p>
            </div>
          </div>

          <div className="max-w-2xl space-y-10">
            <div className="space-y-5">
              <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-semibold tracking-[0.2em] uppercase ring-1 ring-white/25 backdrop-blur">
                {t('auth.heroEyebrow')}
              </span>
              <h2 className="text-4xl leading-[1.05] font-bold tracking-tight text-balance sm:text-5xl xl:text-6xl">
                {t('auth.heroHeadline')}
              </h2>
              <p className="max-w-xl text-lg leading-relaxed text-white/85">
                {t('auth.heroSubtitle')}
              </p>
            </div>

            <ul className="grid gap-4 sm:grid-cols-3">
              {highlights.map((item) => (
                <li
                  key={item.label}
                  className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15 backdrop-blur"
                >
                  <span className="mb-3 flex size-10 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20">
                    <item.icon className="size-5" />
                  </span>
                  <p className="font-semibold">{item.label}</p>
                  <p className="mt-1 text-sm text-white/70">{item.desc}</p>
                </li>
              ))}
            </ul>
          </div>

          <p className="flex items-center gap-2 text-sm text-white/60">
            <ShieldCheck className="size-4" />
            {t('auth.secureAccess')} · {new Date().getFullYear()} {APP_NAME}
          </p>
        </div>
      </div>

      {/* Right — login form, 30% width */}
      <div className="bg-background relative flex items-center justify-center p-6 sm:p-10 lg:col-span-3 lg:p-8">
        <div className="absolute top-5 right-5 flex items-center gap-1">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>

        <div className="bg-primary/10 pointer-events-none absolute -top-24 left-1/2 size-72 -translate-x-1/2 rounded-full blur-3xl lg:hidden" />

        <div className="relative w-full max-w-sm space-y-8">
          <div className="space-y-3">
            <span className="bg-primary text-primary-foreground inline-flex size-12 items-center justify-center rounded-xl shadow-sm lg:hidden">
              <Package2 className="size-6" />
            </span>
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold tracking-tight">{t('auth.welcomeBack')}</h1>
              <p className="text-muted-foreground text-sm">
                {t('auth.subtitle', { app: APP_NAME })}
              </p>
            </div>
          </div>

          <LoginForm />

          <p className="text-muted-foreground text-center text-xs">{t('auth.terms')}</p>
        </div>
      </div>
    </div>
  );
}
