import {
  AlertTriangle,
  Banknote,
  BarChart3,
  Boxes,
  Building2,
  CreditCard,
  FileText,
  LayoutDashboard,
  Layers,
  LogIn,
  Mail,
  Package,
  PackageOpen,
  Palette,
  Percent,
  Receipt,
  RotateCcw,
  Ruler,
  ScrollText,
  Settings,
  Shapes,
  ShieldCheck,
  Store,
  Tags,
  TrendingUp,
  UserCog,
  Users,
  Warehouse,
  type LucideIcon,
} from 'lucide-react';
import type { PrincipalType } from '@/types/enums';

export interface NavItem {
  /** i18n key under `nav.item.*`. */
  labelKey: string;
  href: string;
  icon: LucideIcon;
}

export interface NavSection {
  /** i18n key under `nav.section.*`. */
  labelKey: string;
  items: NavItem[];
  /**
   * Which principal types may see this section. When omitted, the section is
   * visible to every authenticated user (e.g. shared modules like System).
   */
  userTypes?: PrincipalType[];
}

export const NAV_SECTIONS: NavSection[] = [
  // --- Tenant portal -------------------------------------------------------
  {
    labelKey: 'nav.section.overview',
    userTypes: ['TENANT'],
    items: [{ labelKey: 'nav.item.dashboard', href: '/dashboard', icon: LayoutDashboard }],
  },
  {
    labelKey: 'nav.section.operations',
    userTypes: ['TENANT'],
    items: [
      { labelKey: 'nav.item.rentalOrders', href: '/rental-orders', icon: Receipt },
      { labelKey: 'nav.item.returnTransactions', href: '/return-transactions', icon: RotateCcw },
      { labelKey: 'nav.item.overdueOrders', href: '/rental-orders/overdue', icon: AlertTriangle },
    ],
  },
  {
    labelKey: 'nav.section.catalog',
    userTypes: ['TENANT'],
    items: [
      { labelKey: 'nav.item.products', href: '/products', icon: Package },
      { labelKey: 'nav.item.inventoryItems', href: '/inventory-items', icon: PackageOpen },
      { labelKey: 'nav.item.productTypes', href: '/product-types', icon: Shapes },
      { labelKey: 'nav.item.productGroups', href: '/product-groups', icon: Tags },
      { labelKey: 'nav.item.sizes', href: '/sizes', icon: Ruler },
      { labelKey: 'nav.item.units', href: '/units', icon: Boxes },
      { labelKey: 'nav.item.colors', href: '/colors', icon: Palette },
    ],
  },
  {
    labelKey: 'nav.section.customers',
    userTypes: ['TENANT'],
    items: [{ labelKey: 'nav.item.customers', href: '/customers', icon: Users }],
  },
  {
    labelKey: 'nav.section.reports',
    userTypes: ['TENANT'],
    items: [
      { labelKey: 'nav.item.reportRevenue', href: '/reports/revenue', icon: TrendingUp },
      { labelKey: 'nav.item.reportRental', href: '/reports/rental-performance', icon: BarChart3 },
      { labelKey: 'nav.item.reportInventory', href: '/reports/inventory', icon: Warehouse },
    ],
  },
  {
    labelKey: 'nav.section.config',
    userTypes: ['TENANT'],
    items: [
      { labelKey: 'nav.item.branches', href: '/branches', icon: Store },
      { labelKey: 'nav.item.staff', href: '/staff', icon: UserCog },
      { labelKey: 'nav.item.roles', href: '/roles', icon: ShieldCheck },
      { labelKey: 'nav.item.account', href: '/account', icon: CreditCard },
      { labelKey: 'nav.item.settings', href: '/settings', icon: Settings },
    ],
  },

  // --- SaaS admin portal ---------------------------------------------------
  {
    labelKey: 'nav.section.dashboard',
    userTypes: ['SAAS_ADMIN'],
    items: [{ labelKey: 'nav.item.overview', href: '/dashboard', icon: LayoutDashboard }],
  },
  {
    labelKey: 'nav.section.customers',
    userTypes: ['SAAS_ADMIN'],
    items: [
      { labelKey: 'nav.item.tenants', href: '/tenants', icon: Building2 },
      { labelKey: 'nav.item.branches', href: '/branches', icon: Store },
      { labelKey: 'nav.item.users', href: '/users', icon: Users },
    ],
  },
  {
    labelKey: 'nav.section.revenue',
    userTypes: ['SAAS_ADMIN'],
    items: [
      { labelKey: 'nav.item.packages', href: '/billing/packages', icon: Layers },
      { labelKey: 'nav.item.subscriptions', href: '/billing/subscriptions', icon: CreditCard },
      { labelKey: 'nav.item.invoices', href: '/billing/invoices', icon: FileText },
      { labelKey: 'nav.item.payments', href: '/billing/payments', icon: Banknote },
    ],
  },
  {
    labelKey: 'nav.section.reports',
    userTypes: ['SAAS_ADMIN'],
    items: [
      { labelKey: 'nav.item.reportSaasRevenue', href: '/reports/saas-revenue', icon: TrendingUp },
      { labelKey: 'nav.item.reportTenantGrowth', href: '/reports/tenant-growth', icon: BarChart3 },
      {
        labelKey: 'nav.item.reportTrialConversion',
        href: '/reports/trial-conversion',
        icon: Percent,
      },
      {
        labelKey: 'nav.item.reportExpiringTenants',
        href: '/reports/expiring-tenants',
        icon: AlertTriangle,
      },
    ],
  },
  {
    labelKey: 'nav.section.system',
    userTypes: ['SAAS_ADMIN'],
    items: [
      { labelKey: 'nav.item.adminUsers', href: '/system/admin-users', icon: UserCog },
      { labelKey: 'nav.item.roles', href: '/system/roles', icon: ShieldCheck },
      { labelKey: 'nav.item.systemConfig', href: '/system/config', icon: Settings },
      { labelKey: 'nav.item.emailTemplates', href: '/system/email-templates', icon: Mail },
    ],
  },
  {
    labelKey: 'nav.section.support',
    userTypes: ['SAAS_ADMIN'],
    items: [
      { labelKey: 'nav.item.auditLogs', href: '/support/audit-logs', icon: ScrollText },
      { labelKey: 'nav.item.tenantSupportLogin', href: '/support/tenant-login', icon: LogIn },
    ],
  },
];

/**
 * Sections visible to the given principal type. Sections without an explicit
 * `userTypes` list are shared and shown to everyone.
 */
export function getNavSections(userType?: string | null): NavSection[] {
  return NAV_SECTIONS.filter(
    (section) => !section.userTypes || section.userTypes.includes(userType as PrincipalType),
  );
}

/** Map a route href to its i18n label key (for breadcrumbs/titles). */
export const NAV_LOOKUP: Record<string, string> = Object.fromEntries(
  NAV_SECTIONS.flatMap((s) => s.items).map((i) => [i.href, i.labelKey]),
);
