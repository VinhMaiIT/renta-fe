import type { Metadata } from 'next';
import { Package2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoginForm } from '@/features/auth/login-form';
import { APP_NAME, APP_TAGLINE, USE_MOCKS } from '@/constants/config';

export const metadata: Metadata = { title: 'Sign in' };

export default function LoginPage() {
  return (
    <div className="bg-muted/30 flex min-h-screen flex-1 items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="bg-primary text-primary-foreground flex size-11 items-center justify-center rounded-xl">
            <Package2 className="size-6" />
          </span>
          <div>
            <h1 className="text-xl font-semibold">{APP_NAME}</h1>
            <p className="text-muted-foreground text-sm">{APP_TAGLINE}</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign in to your account</CardTitle>
            <CardDescription>Enter your tenant credentials to continue.</CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
            {USE_MOCKS ? (
              <p className="text-muted-foreground mt-4 rounded-md border border-dashed p-2.5 text-center text-xs">
                Demo mode — sign in with tenant <strong>1</strong>, username{' '}
                <strong>staff01</strong>, any password.
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
