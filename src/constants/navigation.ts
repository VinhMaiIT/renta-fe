import {
  Boxes,
  Building2,
  CreditCard,
  FileText,
  LayoutDashboard,
  Layers,
  Package,
  PackageOpen,
  Receipt,
  RotateCcw,
  Ruler,
  Settings,
  Shapes,
  Tags,
  Users,
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
      { labelKey: 'nav.item.customers', href: '/customers', icon: Users },
    ],
  },
  {
    labelKey: 'nav.section.catalog',
    userTypes: ['TENANT'],
    items: [
      { labelKey: 'nav.item.products', href: '/products', icon: Package },
      { labelKey: 'nav.item.inventoryItems', href: '/inventory-items', icon: PackageOpen },
    ],
  },
  {
    labelKey: 'nav.section.masterData',
    userTypes: ['TENANT'],
    items: [
      { labelKey: 'nav.item.sizes', href: '/sizes', icon: Ruler },
      { labelKey: 'nav.item.units', href: '/units', icon: Boxes },
      { labelKey: 'nav.item.productTypes', href: '/product-types', icon: Shapes },
      { labelKey: 'nav.item.productGroups', href: '/product-groups', icon: Tags },
    ],
  },
  {
    labelKey: 'nav.section.billing',
    items: [
      { labelKey: 'nav.item.packages', href: '/billing/packages', icon: Layers },
      { labelKey: 'nav.item.subscriptions', href: '/billing/subscriptions', icon: CreditCard },
      { labelKey: 'nav.item.invoices', href: '/billing/invoices', icon: FileText },
    ],
  },
  {
    labelKey: 'nav.section.tenants',
    userTypes: ['SAAS_ADMIN'],
    items: [{ labelKey: 'nav.item.tenants', href: '/tenants', icon: Building2 }],
  },
  {
    labelKey: 'nav.section.system',
    items: [{ labelKey: 'nav.item.settings', href: '/settings', icon: Settings }],
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
