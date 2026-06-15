'use client';

import { useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useSession } from '@/stores/auth-store';
import { brandToCssVars, tenantBrand } from '@/lib/theme/tenant-brand';

/**
 * Side-effect component: paints the current tenant's brand colour onto `<html>`
 * as CSS custom properties. The colour comes from the tenant's `brandColor`
 * (loaded via `/auth/me`); it re-applies when the tenant or the active
 * light/dark mode changes, and tears the overrides down on unmount so the
 * static defaults in `globals.css` take over again (e.g. on the login screen).
 */
export function TenantTheme() {
  const session = useSession();
  const tenantId = session?.tenantId ?? null;
  const brandColor = session?.brandColor ?? null;
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const mode = resolvedTheme === 'dark' ? 'dark' : 'light';
    const brand = tenantBrand(tenantId, brandColor);
    const vars = brandToCssVars(brand, mode);
    const root = document.documentElement;

    for (const [token, value] of Object.entries(vars)) {
      root.style.setProperty(token, value);
    }
    root.dataset.brand = brand.key;

    return () => {
      for (const token of Object.keys(vars)) {
        root.style.removeProperty(token);
      }
      delete root.dataset.brand;
    };
  }, [tenantId, brandColor, resolvedTheme]);

  return null;
}
