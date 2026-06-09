import { MasterDataPage } from '@/features/master-data/master-data-page';

export const metadata = { title: 'Units' };

export default function UnitsPage() {
  return (
    <MasterDataPage
      resource="units"
      title="Units"
      singular="Unit"
      description="Manage units of measurement for products."
    />
  );
}
