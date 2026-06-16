/**
 * Per-tenant brand theming.
 *
 * A tenant's brand is a single base colour expressed in the OKLCh space
 * (`{ l, c, h }`). Every UI accent (primary buttons, focus ring, active menu
 * item, brand tint, chart-1) is *derived* from that one colour so a tenant only
 * has to pick one value to re-skin the whole app.
 *
 * The colour is injected at runtime as CSS custom properties on `<html>` (see
 * `TenantTheme`), so it composes with the existing light/dark tokens in
 * `globals.css` without a rebuild.
 *
 * NOTE: the resolution below (preset registry + deterministic fallback) is a
 * mock standing in for a future `GET /tenant/branding` endpoint. Swap
 * `resolveTenantBrand` for the API result once the backend exposes it.
 */

export interface BrandColor {
  /** Lightness 0–1 */
  l: number;
  /** Chroma (≈0–0.37) */
  c: number;
  /** Hue 0–360 */
  h: number;
}

export interface TenantBrand {
  /** Stable key used in pickers. */
  key: string;
  /** Human label. */
  name: string;
  /** Canonical hex (what gets persisted to the tenant). */
  hex: string;
  /** Base brand colour (OKLCh), derived from `hex`. */
  base: BrandColor;
}

export type ThemeMode = 'light' | 'dark';

/**
 * Curated SaaS-grade palettes. Each is defined by its persisted hex; the OKLCh
 * `base` is derived from that same hex so a saved colour round-trips back to the
 * identical swatch after `/auth/me` returns it. First entry is the default.
 */
const PRESET_DEFS: ReadonlyArray<{ key: string; name: string; hex: string }> = [
  { key: 'indigo', name: 'Indigo', hex: '#4F46E5' },
  { key: 'violet', name: 'Violet', hex: '#7C3AED' },
  { key: 'blue', name: 'Ocean Blue', hex: '#2563EB' },
  { key: 'teal', name: 'Teal', hex: '#0D9488' },
  { key: 'emerald', name: 'Emerald', hex: '#059669' },
  { key: 'amber', name: 'Amber', hex: '#D97706' },
  { key: 'rose', name: 'Rose', hex: '#E11D48' },
  { key: 'crimson', name: 'Crimson', hex: '#DC2626' },
];

export const BRAND_PRESETS: readonly TenantBrand[] = PRESET_DEFS.map((d) => ({
  ...d,
  // hexToBrandColor is a hoisted function declaration; every preset hex is valid.
  base: hexToBrandColor(d.hex) as BrandColor,
}));

export const DEFAULT_BRAND = BRAND_PRESETS[0];

/**
 * Explicit tenant → brand overrides. Real tenant ids map to a chosen palette
 * here; anything not listed falls back to a deterministic pick so every tenant
 * still gets a stable, distinct colour out of the box.
 */
const TENANT_BRAND_MAP: Record<string, string> = {
  // 'tenant-uuid-here': 'emerald',
};

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function round(n: number, digits = 3): number {
  const f = 10 ** digits;
  return Math.round(n * f) / f;
}

function oklch({ l, c, h }: BrandColor): string {
  return `oklch(${round(l)} ${round(c)} ${round(h, 1)})`;
}

/** Pick light or dark foreground based on the background's lightness. */
function foregroundFor(l: number): string {
  return l >= 0.68 ? 'oklch(0.205 0 0)' : 'oklch(0.985 0 0)';
}

/** Adapt a light-tuned base colour to dark mode (lighter, slightly calmer). */
function toDark(base: BrandColor): BrandColor {
  return { l: clamp(base.l + 0.13, 0, 0.82), c: base.c * 0.92, h: base.h };
}

/**
 * Derive the full set of CSS custom properties for a brand in the given mode.
 * Returns `--token -> value` pairs ready for `style.setProperty`.
 */
export function brandToCssVars(brand: TenantBrand, mode: ThemeMode): Record<string, string> {
  const base = mode === 'dark' ? toDark(brand.base) : brand.base;
  const primary = oklch(base);
  const primaryFg = foregroundFor(base.l);

  // Deep brand-coloured sidebar surface (derived from the canonical hue/chroma,
  // not the mode-adjusted base, so it stays a consistent rich tone).
  const sidebarHue = round(brand.base.h, 1);
  const sidebar =
    mode === 'dark'
      ? oklch({ l: 0.25, c: Math.min(brand.base.c * 0.7, 0.09), h: brand.base.h })
      : oklch({ l: 0.37, c: Math.min(brand.base.c * 0.85, 0.12), h: brand.base.h });

  return {
    '--primary': primary,
    '--primary-foreground': primaryFg,
    '--ring': primary,

    // Keep the first chart series on-brand.
    '--chart-1': primary,

    // Sidebar: deep brand fill with white text and translucent-white overlays.
    '--sidebar': sidebar,
    '--sidebar-foreground': `oklch(0.97 0.012 ${sidebarHue})`,
    '--sidebar-primary': primary,
    '--sidebar-primary-foreground': primaryFg,
    '--sidebar-border': 'oklch(1 0 0 / 0.12)',
    '--sidebar-ring': 'oklch(1 0 0 / 0.45)',

    // Hover: subtle white overlay.
    '--sidebar-accent': 'oklch(1 0 0 / 0.1)',
    '--sidebar-accent-foreground': 'oklch(0.99 0 0)',

    // Active: brighter white overlay.
    '--sidebar-active': 'oklch(1 0 0 / 0.18)',
    '--sidebar-active-foreground': 'oklch(1 0 0)',
  };
}

/** Parse `#RRGGBB` / `#RGB` into an OKLCh `BrandColor`, or `null` if invalid. */
export function hexToBrandColor(hex: string | null | undefined): BrandColor | null {
  if (!hex) return null;
  let h = hex.trim().replace(/^#/, '');
  if (h.length === 3) h = h.replace(/(.)/g, '$1$1');
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;

  const toLinear = (v: number) => {
    const s = v / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  const r = toLinear(parseInt(h.slice(0, 2), 16));
  const g = toLinear(parseInt(h.slice(2, 4), 16));
  const b = toLinear(parseInt(h.slice(4, 6), 16));

  // Linear sRGB → OKLab (Björn Ottosson's matrices).
  const l_ = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m_ = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s_ = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);

  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
  const aa = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const bb = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;

  const c = Math.sqrt(aa * aa + bb * bb);
  let hue = (Math.atan2(bb, aa) * 180) / Math.PI;
  if (hue < 0) hue += 360;

  return { l: L, c, h: hue };
}

/** Build a one-off `TenantBrand` from a hex colour (e.g. the value from BE). */
export function brandFromHex(hex: string | null | undefined): TenantBrand | null {
  const color = hexToBrandColor(hex);
  if (!color || !hex) return null;
  return { key: 'custom', name: 'Custom', hex, base: color };
}

/**
 * The effective brand for a tenant: the BE-stored `brandColor` (hex) if present
 * and valid, otherwise the deterministic per-tenant fallback.
 */
export function tenantBrand(
  tenantId: string | null | undefined,
  brandColor: string | null | undefined,
): TenantBrand {
  return brandFromHex(brandColor) ?? resolveTenantBrand(tenantId);
}

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getBrandByKey(key: string | null | undefined): TenantBrand | null {
  if (!key) return null;
  return BRAND_PRESETS.find((b) => b.key === key) ?? null;
}

/** Plain swatch colour for a brand (used by pickers / previews). */
export function brandSwatch(brand: TenantBrand, mode: ThemeMode = 'light'): string {
  return oklch(mode === 'dark' ? toDark(brand.base) : brand.base);
}

/**
 * Resolve the brand assigned to a tenant. Precedence:
 *  1. explicit tenant → preset map
 *  2. deterministic per-tenant fallback (stable distinct colour)
 *  3. product default
 *
 * Prefer `tenantBrand()` which layers the BE-stored `brandColor` on top.
 */
export function resolveTenantBrand(tenantId: string | null | undefined): TenantBrand {
  if (!tenantId) return DEFAULT_BRAND;

  const mapped = getBrandByKey(TENANT_BRAND_MAP[tenantId]);
  if (mapped) return mapped;

  return BRAND_PRESETS[hashString(tenantId) % BRAND_PRESETS.length];
}
