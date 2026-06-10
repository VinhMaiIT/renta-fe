import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { cookies } from 'next/headers';
import './globals.css';
import { AppProviders } from '@/providers/app-providers';
import { APP_NAME, APP_TAGLINE } from '@/constants/config';
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale } from '@/i18n/config';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: { default: `${APP_NAME} — ${APP_TAGLINE}`, template: `%s · ${APP_NAME}` },
  description: 'Admin portal for the RENTA rental management platform.',
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value;
  const locale = isLocale(cookieLocale) ? cookieLocale : DEFAULT_LOCALE;

  return (
    <html lang={locale} suppressHydrationWarning className={`${inter.variable} h-full`}>
      <body className="bg-background text-foreground flex min-h-full flex-col font-sans antialiased">
        <AppProviders locale={locale}>{children}</AppProviders>
      </body>
    </html>
  );
}
