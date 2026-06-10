const branches = {
  title: 'Branches',
  countSummary: 'All ({count}/{total})',
  searchPlaceholder: 'Search by code or name…',
  emptyTitle: 'No branches for this tenant yet',
  emptyTitleTenant: 'No branches yet',
  selectTenant: 'Select a tenant…',
  selectTenantHint: 'Select a tenant to view its branches',
  tenant: 'Tenant',
  code: 'Code',
  phone: 'Phone',
  email: 'Email',
  address: 'Address',
  main: 'Main',
  newBranch: 'New branch',
  setMain: 'Set as main branch',
  form: {
    createTitle: 'New branch',
    editTitle: 'Edit branch',
    createDesc: 'Create a branch for the selected tenant.',
    editDesc: 'Update the branch details below.',
    codeRequired: 'Code is required',
    nameRequired: 'Name is required',
  },
} as const;

export default branches;
