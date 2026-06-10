'use client';

import { LogOut, User } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSession } from '@/stores/auth-store';
import { useLogout } from '@/features/auth/use-auth';
import { useT } from '@/i18n/locale-provider';

function initials(name: string): string {
  return name.slice(0, 2).toUpperCase() || 'U';
}

export function UserMenu() {
  const session = useSession();
  const logout = useLogout();
  const { t } = useT();
  const name = session?.fullName || session?.username || 'User';
  const subtitle = session?.isAdmin
    ? (session?.userType ?? 'Admin')
    : session?.tenantId
      ? `${t('settings.profile.tenant')} #${session.tenantId}`
      : (session?.userType ?? '');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" className="rounded-full">
            <Avatar className="size-8">
              <AvatarFallback>{initials(name)}</AvatarFallback>
            </Avatar>
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span className="font-medium">{name}</span>
            {subtitle ? <span className="text-muted-foreground text-xs">{subtitle}</span> : null}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<a href="/settings" />}>
          <User className="size-4" />
          {t('nav.item.settings')}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout} className="text-destructive">
          <LogOut className="size-4" />
          {t('common.action.signOut')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
