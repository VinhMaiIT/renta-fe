const branches = {
  title: 'Chi nhánh',
  countSummary: 'Tất cả ({count}/{total})',
  searchPlaceholder: 'Tìm theo mã hoặc tên…',
  emptyTitle: 'Tenant này chưa có chi nhánh nào',
  emptyTitleTenant: 'Chưa có chi nhánh nào',
  selectTenant: 'Chọn tenant…',
  selectTenantHint: 'Chọn một tenant để xem chi nhánh',
  tenant: 'Tenant',
  code: 'Mã',
  phone: 'Điện thoại',
  email: 'Email',
  address: 'Địa chỉ',
  main: 'Chính',
  newBranch: 'Thêm chi nhánh',
  setMain: 'Đặt làm chi nhánh chính',
  form: {
    createTitle: 'Thêm chi nhánh',
    editTitle: 'Sửa chi nhánh',
    createDesc: 'Tạo chi nhánh cho tenant đã chọn.',
    editDesc: 'Cập nhật thông tin chi nhánh.',
    codeRequired: 'Vui lòng nhập mã',
    nameRequired: 'Vui lòng nhập tên',
  },
} as const;

export default branches;
