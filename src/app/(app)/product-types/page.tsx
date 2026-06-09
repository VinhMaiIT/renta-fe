import { MasterDataPage } from '@/features/master-data/master-data-page';

export const metadata = { title: 'Product Types' };

export default function ProductTypesPage() {
  return (
    <MasterDataPage
      resource="product-types"
      title="Product Types"
      singular="Product type"
      description="Categorize products by type."
    />
  );
}
