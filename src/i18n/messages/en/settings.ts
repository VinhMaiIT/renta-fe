const settings = {
  title: 'Settings',
  subtitle: 'Manage your workspace preferences.',
  tabs: { profile: 'Profile', appearance: 'Appearance', branch: 'Branch', security: 'Security' },
  profile: {
    title: 'Profile',
    desc: 'Your account information (read-only).',
    username: 'Username',
    role: 'Role',
    tenant: 'Tenant',
    readonly: 'Profile details are managed by your administrator.',
  },
  appearance: {
    title: 'Appearance',
    desc: 'Customize how RENTA looks for you.',
    themeLabel: 'Theme',
    light: 'Light',
    dark: 'Dark',
    system: 'System',
    languageLabel: 'Language',
  },
  branch: {
    title: 'Working branch',
    activeBranch: 'Active Branch',
    desc: 'Choose which branch you are operating in.',
    switchDesc: 'Switch the branch you are currently working in.',
    selectDesc: 'Select the branch you want to work in. Your active branch affects which data you see.',
    notFound: 'No branches found for your account.',
    main: 'Main',
    current: 'Current',
  },
  security: {
    title: 'Security',
    desc: 'Update your password to keep your account safe.',
  },
} as const;
export default settings;
