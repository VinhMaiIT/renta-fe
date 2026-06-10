const enums = {
  activeStatus: { ACTIVE: 'Hoạt động', INACTIVE: 'Ngừng' },
  inventoryStatus: {
    AVAILABLE: 'Sẵn sàng',
    RENTED: 'Đang thuê',
    MAINTENANCE: 'Bảo trì',
    LOST: 'Thất lạc',
    DISABLED: 'Vô hiệu',
  },
  condition: {
    NEW: 'Mới',
    GOOD: 'Tốt',
    FAIR: 'Khá',
    NEEDS_CLEANING: 'Cần vệ sinh',
    NEEDS_REPAIR: 'Cần sửa',
    DAMAGED: 'Hư hỏng',
  },
  orderStatus: {
    DRAFT: 'Nháp',
    RENTING: 'Đang thuê',
    PARTIALLY_RETURNED: 'Trả một phần',
    RETURNED: 'Đã trả',
    OVERDUE: 'Quá hạn',
    CANCELLED: 'Đã hủy',
  },
  orderItemStatus: {
    RENTED: 'Đang thuê',
    RETURNED: 'Đã trả',
    LOST: 'Thất lạc',
    DAMAGED: 'Hư hỏng',
    CANCELLED: 'Đã hủy',
  },
} as const;
export default enums;
