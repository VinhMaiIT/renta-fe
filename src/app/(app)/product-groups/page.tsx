import { MasterDataPage } from '@/features/master-data/master-data-page';

export const metadata = { title: 'Product Groups' };

export default function ProductGroupsPage() {
  return (
    <MasterDataPage
      resource="product-groups"
      title="Product Groups"
      singular="Product group"
      description="Group related products together."
    />
  );
}
