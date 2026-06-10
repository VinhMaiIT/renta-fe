'use client';

import { Check, Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useT } from '@/i18n/locale-provider';
import { LOCALES, LOCALE_LABELS } from '@/i18n/config';
import { cn } from '@/lib/utils';

/** Header control to switch between supported languages (vi / en). */
export function LanguageSwitcher() {
  const { locale, setLocale } = useT();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" aria-label="Language">
            <Languages className="size-[1.1rem]" />
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-40">
        {LOCALES.map((code) => (
          <DropdownMenuItem key={code} onClick={() => setLocale(code)}>
            <span className="uppercase">{code}</span>
            <span className="text-muted-foreground">{LOCALE_LABELS[code]}</span>
            <Check
              className={cn('ml-auto size-4', code === locale ? 'opacity-100' : 'opacity-0')}
            />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
