const customers = {
  title: 'Customers',
  subtitle: 'Manage your customer records.',
  newCustomer: 'New customer',
  searchPlaceholder: 'Search by name or phone…',
  emptyTitle: 'No customers yet',
  emptyDesc: 'Create your first customer to get started.',
  deleteDesc: '{name} will be permanently removed. This cannot be undone.',
  phone: 'Phone',
  address: 'Address',
  note: 'Note',
  form: {
    createTitle: 'New customer',
    editTitle: 'Edit customer',
    createDesc: 'Create a new customer.',
    editDesc: 'Update the customer details below.',
    nameRequired: 'Name is required',
    phoneRequired: 'Phone is required',
  },
} as const;

export default customers;
