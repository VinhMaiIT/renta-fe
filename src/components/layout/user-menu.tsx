'use client';

import { useRouter } from 'next/navigation';
import { LogOut, Settings as SettingsIcon } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
  const router = useRouter();
  const { t } = useT();

  const name = session?.fullName || session?.username || 'User';
  const role = session?.isAdmin
    ? (session?.userType ?? 'SAAS_ADMIN')
    : (session?.userType ?? 'TENANT');

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
      <DropdownMenuContent align="end" className="w-64">
        <div className="flex flex-col gap-0.5 px-2 py-1.5">
          <span className="text-sm font-medium">{name}</span>
          {session?.username ? (
            <span className="text-muted-foreground text-xs">@{session.username}</span>
          ) : null}
        </div>
        <DropdownMenuSeparator />

        {/* Account info (read-only) */}
        <div className="space-y-1.5 px-2 py-1.5 text-xs">
          <InfoRow label={t('settings.profile.role')} value={role} />
          {session?.tenantId ? (
            <InfoRow label={t('settings.profile.tenant')} value={`#${session.tenantId}`} />
          ) : null}
        </div>

        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push('/settings')}>
          <SettingsIcon className="size-4" />
          {t('nav.item.settings')}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout} variant="destructive">
          <LogOut className="size-4" />
          {t('common.action.signOut')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium break-all">{value}</span>
    </div>
  );
}
