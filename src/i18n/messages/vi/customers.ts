const customers = {
  title: 'Khách hàng',
  subtitle: 'Quản lý danh sách khách hàng.',
  newCustomer: 'Thêm khách hàng',
  searchPlaceholder: 'Tìm theo tên hoặc số điện thoại…',
  emptyTitle: 'Chưa có khách hàng',
  emptyDesc: 'Tạo khách hàng đầu tiên để bắt đầu.',
  deleteDesc: '{name} sẽ bị xóa vĩnh viễn. Không thể hoàn tác.',
  phone: 'Số điện thoại',
  address: 'Địa chỉ',
  note: 'Ghi chú',
  form: {
    createTitle: 'Thêm khách hàng',
    editTitle: 'Sửa khách hàng',
    createDesc: 'Tạo mới khách hàng.',
    editDesc: 'Cập nhật thông tin khách hàng bên dưới.',
    nameRequired: 'Tên là bắt buộc',
    phoneRequired: 'Số điện thoại là bắt buộc',
  },
} as const;

export default customers;
