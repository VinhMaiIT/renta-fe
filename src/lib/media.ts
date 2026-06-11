import { MEDIA_BASE_URL } from '@/constants/config';

/**
 * Resolve an image/file URL for display. Absolute URLs (and data URIs) are
 * returned as-is; server-relative paths like `/uploads/...` are prefixed with
 * the media origin so the browser doesn't resolve them against the app origin.
 */
export function mediaUrl(url: string | null | undefined): string {
  if (!url) return '';
  if (/^(https?:|data:|blob:)/i.test(url)) return url;
  return `${MEDIA_BASE_URL}/${url.replace(/^\//, '')}`;
}
