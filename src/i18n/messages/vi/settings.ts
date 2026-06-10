const settings = {
  title: 'Cài đặt',
  subtitle: 'Quản lý tùy chọn không gian làm việc.',
  tabs: { profile: 'Hồ sơ', appearance: 'Giao diện', branch: 'Chi nhánh', security: 'Bảo mật' },
  profile: {
    title: 'Hồ sơ',
    desc: 'Thông tin tài khoản của bạn (chỉ đọc).',
    username: 'Tên đăng nhập',
    role: 'Vai trò',
    tenant: 'Đơn vị',
    readonly: 'Thông tin hồ sơ do quản trị viên quản lý.',
  },
  appearance: {
    title: 'Giao diện',
    desc: 'Tùy chỉnh giao diện RENTA theo ý bạn.',
    themeLabel: 'Chủ đề',
    light: 'Sáng',
    dark: 'Tối',
    system: 'Hệ thống',
    languageLabel: 'Ngôn ngữ',
  },
  branch: {
    title: 'Chi nhánh làm việc',
    activeBranch: 'Chi nhánh đang hoạt động',
    desc: 'Chọn chi nhánh bạn đang vận hành.',
    switchDesc: 'Chuyển chi nhánh bạn đang làm việc.',
    selectDesc: 'Chọn chi nhánh bạn muốn làm việc. Chi nhánh đang hoạt động ảnh hưởng đến dữ liệu bạn thấy.',
    notFound: 'Không tìm thấy chi nhánh nào cho tài khoản của bạn.',
    main: 'Chính',
    current: 'Hiện tại',
  },
  security: {
    title: 'Bảo mật',
    desc: 'Cập nhật mật khẩu để bảo vệ tài khoản của bạn.',
  },
} as const;
export default settings;
