import { MasterDataPage } from '@/features/master-data/master-data-page';

export const metadata = { title: 'Sizes' };

export default function SizesPage() {
  return (
    <MasterDataPage
      resource="sizes"
      title="Sizes"
      singular="Size"
      description="Manage the sizes products can be offered in."
    />
  );
}
