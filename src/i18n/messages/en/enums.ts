const enums = {
  activeStatus: { ACTIVE: 'Active', INACTIVE: 'Inactive' },
  inventoryStatus: {
    AVAILABLE: 'Available',
    RENTED: 'Rented',
    MAINTENANCE: 'Maintenance',
    LOST: 'Lost',
    DISABLED: 'Disabled',
  },
  condition: {
    NEW: 'New',
    GOOD: 'Good',
    FAIR: 'Fair',
    NEEDS_CLEANING: 'Needs Cleaning',
    NEEDS_REPAIR: 'Needs Repair',
    DAMAGED: 'Damaged',
  },
  orderStatus: {
    DRAFT: 'Draft',
    RENTING: 'Renting',
    PARTIALLY_RETURNED: 'Partially Returned',
    RETURNED: 'Returned',
    OVERDUE: 'Overdue',
    CANCELLED: 'Cancelled',
  },
  orderItemStatus: {
    RENTED: 'Rented',
    RETURNED: 'Returned',
    LOST: 'Lost',
    DAMAGED: 'Damaged',
    CANCELLED: 'Cancelled',
  },
  subscriptionStatus: {
    ACTIVE: 'Active',
    TRIAL: 'Trial',
    PENDING_PAYMENT: 'Pending Payment',
    EXPIRED: 'Expired',
    CANCELLED: 'Cancelled',
  },
  invoiceStatus: {
    PENDING: 'Pending',
    PAID: 'Paid',
    OVERDUE: 'Overdue',
    CANCELLED: 'Cancelled',
  },
  paymentCycle: {
    MONTHLY: 'Monthly',
    YEARLY: 'Yearly',
  },
} as const;
export default enums;
