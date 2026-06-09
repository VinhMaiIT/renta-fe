import { redirect } from 'next/navigation';

export default function RootPage() {
  // Auth state lives client-side; the dashboard route guard redirects to /login
  // when there is no session.
  redirect('/dashboard');
}
