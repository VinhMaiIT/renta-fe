'use client';

import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor } from 'lucide-react';
import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useTenantContext } from '@/hooks/use-tenant-context';
import { BranchSettings } from './branch-settings';
import { ChangePasswordForm } from './change-password-form';

function ProfileSection() {
  const { tenantId, username } = useTenantContext();
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <p className="text-muted-foreground text-sm font-medium">Username</p>
          <p className="font-medium">{username || '—'}</p>
        </div>
        <div className="space-y-1">
          <p className="text-muted-foreground text-sm font-medium">Tenant ID</p>
          <p className="font-mono text-sm">{tenantId || '—'}</p>
        </div>
      </div>
    </div>
  );
}

function AppearanceSection() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="space-y-3">
      <p className="text-muted-foreground text-sm">Choose your preferred color theme.</p>
      <div className="flex flex-wrap gap-2">
        <Button
          variant={theme === 'light' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTheme('light')}
        >
          <Sun className="size-4" />
          Light
        </Button>
        <Button
          variant={theme === 'dark' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTheme('dark')}
        >
          <Moon className="size-4" />
          Dark
        </Button>
        <Button
          variant={theme === 'system' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTheme('system')}
        >
          <Monitor className="size-4" />
          System
        </Button>
      </div>
    </div>
  );
}

export function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your profile, appearance, and account settings."
      />

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="branch">Branch</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Your account information (read-only).</CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6">
              <ProfileSection />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize how RENTA looks for you.</CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6">
              <AppearanceSection />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branch">
          <Card>
            <CardHeader>
              <CardTitle>Active Branch</CardTitle>
              <CardDescription>Switch the branch you are currently working in.</CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6">
              <BranchSettings />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>Update your password to keep your account safe.</CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="max-w-sm pt-6">
              <ChangePasswordForm />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
