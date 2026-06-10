const tenants = {
  title: 'Tenant Management',
  subtitle: 'Manage tenants across the platform.',
  countSummary: 'All ({count}/{total})',
  searchPlaceholder: 'Search by code or name…',
  emptyTitle: 'No tenants yet',
  back: 'Back to tenants',
  code: 'Code',
  phone: 'Phone',
  email: 'Email',
  address: 'Address',
  branchCount: 'Branches',
  package: 'Package',
  startDate: 'Start date',
  endDate: 'End date',
  detail: {
    tenantInfo: 'Tenant information',
    packageInfo: 'Current package',
    summary: 'Summary',
    branches: 'Branches & addresses',
    cycle: 'Billing cycle',
    nextBilling: 'Next billing',
    noPackage: 'No active package.',
    noBranches: 'This tenant has no branches yet.',
    mainBranch: 'Main',
  },
} as const;

export default tenants;
