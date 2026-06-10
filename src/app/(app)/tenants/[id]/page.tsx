import { TenantDetail } from '@/features/tenants/tenant-detail';

export const metadata = { title: 'Tenant Detail' };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TenantDetail id={id} />;
}
