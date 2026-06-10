const tenants = {
  title: 'Quản lý Tenant',
  subtitle: 'Quản lý các tenant trên toàn hệ thống.',
  countSummary: 'Tất cả ({count}/{total})',
  searchPlaceholder: 'Tìm theo mã hoặc tên…',
  emptyTitle: 'Chưa có tenant nào',
  back: 'Quay lại danh sách',
  code: 'Mã',
  phone: 'Điện thoại',
  email: 'Email',
  address: 'Địa chỉ',
  branchCount: 'Chi nhánh',
  package: 'Tên gói',
  startDate: 'Ngày bắt đầu',
  endDate: 'Ngày kết thúc',
  detail: {
    tenantInfo: 'Thông tin tenant',
    packageInfo: 'Gói đang dùng',
    summary: 'Tổng quan',
    branches: 'Chi nhánh & địa chỉ',
    cycle: 'Chu kỳ thanh toán',
    nextBilling: 'Kỳ thanh toán tiếp theo',
    noPackage: 'Chưa có gói đang hoạt động.',
    noBranches: 'Tenant này chưa có chi nhánh nào.',
    mainBranch: 'Chính',
  },
} as const;

export default tenants;
