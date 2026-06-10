'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { DEFAULT_LOCALE, LOCALE_COOKIE, type Locale } from './config';
import { MESSAGES, type MessageTree } from './messages';

export type TranslateVars = Record<string, string | number>;
export type TranslateFn = (key: string, vars?: TranslateVars) => string;

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: TranslateFn;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

function resolve(tree: MessageTree, key: string): string | undefined {
  const value = key.split('.').reduce<string | MessageTree | undefined>((acc, part) => {
    if (acc && typeof acc === 'object') return acc[part];
    return undefined;
  }, tree);
  return typeof value === 'string' ? value : undefined;
}

function interpolate(template: string, vars?: TranslateVars): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, name: string) =>
    name in vars ? String(vars[name]) : `{${name}}`,
  );
}

export function LocaleProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale;
  children: ReactNode;
}) {
  const router = useRouter();
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  const setLocale = useCallback(
    (next: Locale) => {
      setLocaleState(next);
      // Persist for SSR so the server renders the right language + <html lang>.
      document.cookie = `${LOCALE_COOKIE}=${next};path=/;max-age=31536000;samesite=lax`;
      router.refresh();
    },
    [router],
  );

  const t = useCallback<TranslateFn>(
    (key, vars) => {
      const message =
        resolve(MESSAGES[locale], key) ?? resolve(MESSAGES[DEFAULT_LOCALE], key) ?? key;
      return interpolate(message, vars);
    },
    [locale],
  );

  const value = useMemo<LocaleContextValue>(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

/** Access the active locale, a setter, and the `t()` translate function. */
export function useT(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useT must be used within a LocaleProvider');
  return ctx;
}
