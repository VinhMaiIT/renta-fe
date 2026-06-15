'use client';

import { Check, Lock } from 'lucide-react';
import { useTheme } from 'next-themes';
import { BRAND_PRESETS, brandSwatch, DEFAULT_BRAND, type ThemeMode } from '@/lib/theme/tenant-brand';
import { useAuthStore, useSession } from '@/stores/auth-store';
import { useUpdateTenantProfile } from './use-tenant-settings';
import { useT } from '@/i18n/locale-provider';
import { cn } from '@/lib/utils';

const normHex = (hex: string | null | undefined) => (hex ? hex.toLowerCase() : null);

export function BrandSettings() {
  const { t } = useT();
  const session = useSession();
  const isAdmin = Boolean(session?.isAdmin);
  const currentHex = session?.brandColor ?? null;
  const { resolvedTheme } = useTheme();
  const mode: ThemeMode = resolvedTheme === 'dark' ? 'dark' : 'light';
  const patchSession = useAuthStore((s) => s.patchSession);
  const update = useUpdateTenantProfile();

  const selected = normHex(currentHex);

  function choose(hex: string | null) {
    if (!isAdmin || update.isPending || normHex(hex) === selected) return;
    const previous = currentHex;
    // Optimistic: apply the new colour live, roll back if the save fails.
    patchSession({ brandColor: hex });
    update.mutate({ brandColor: hex }, { onError: () => patchSession({ brandColor: previous }) });
  }

  const swatchClass = (active: boolean) =>
    cn(
      'flex w-[5.5rem] flex-col items-center gap-2 rounded-xl border p-3 text-center transition-colors',
      active ? 'border-primary bg-primary/5' : 'border-border',
      isAdmin && !update.isPending ? 'hover:bg-muted/50 cursor-pointer' : 'cursor-default',
    );

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground text-sm">{t('settings.appearance.brandDesc')}</p>

      <div className="flex flex-wrap gap-3">
        {/* System default (clears brandColor). */}
        <button
          type="button"
          onClick={() => choose(null)}
          disabled={!isAdmin || update.isPending}
          aria-pressed={selected === null}
          className={swatchClass(selected === null)}
        >
          <span
            className="border-border flex size-9 items-center justify-center rounded-full border-2 border-dashed"
            style={{ color: brandSwatch(DEFAULT_BRAND, mode) }}
          >
            {selected === null ? <Check className="size-4" /> : null}
          </span>
          <span className="text-xs leading-tight font-medium">
            {t('settings.appearance.brandAuto')}
          </span>
        </button>

        {BRAND_PRESETS.map((brand) => {
          const active = selected === normHex(brand.hex);
          return (
            <button
              key={brand.key}
              type="button"
              onClick={() => choose(brand.hex)}
              disabled={!isAdmin || update.isPending}
              aria-pressed={active}
              title={brand.name}
              className={swatchClass(active)}
            >
              <span
                className="flex size-9 items-center justify-center rounded-full text-white shadow-sm ring-2 ring-white/40"
                style={{ backgroundColor: brandSwatch(brand, mode) }}
              >
                {active ? <Check className="size-4" /> : null}
              </span>
              <span className="text-xs leading-tight font-medium">{brand.name}</span>
            </button>
          );
        })}
      </div>

      {isAdmin ? (
        <p className="text-muted-foreground text-xs">{t('settings.appearance.brandHint')}</p>
      ) : (
        <p className="text-muted-foreground flex items-center gap-1.5 text-sm">
          <Lock className="size-3.5" />
          {t('settings.general.readonlyNote')}
        </p>
      )}
    </div>
  );
}
