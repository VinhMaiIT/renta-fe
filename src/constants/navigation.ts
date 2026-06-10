import {
  Boxes,
  LayoutDashboard,
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
}

export const NAV_SECTIONS: NavSection[] = [
  {
    labelKey: 'nav.section.overview',
    items: [{ labelKey: 'nav.item.dashboard', href: '/dashboard', icon: LayoutDashboard }],
  },
  {
    labelKey: 'nav.section.operations',
    items: [
      { labelKey: 'nav.item.rentalOrders', href: '/rental-orders', icon: Receipt },
      { labelKey: 'nav.item.returnTransactions', href: '/return-transactions', icon: RotateCcw },
      { labelKey: 'nav.item.customers', href: '/customers', icon: Users },
    ],
  },
  {
    labelKey: 'nav.section.catalog',
    items: [
      { labelKey: 'nav.item.products', href: '/products', icon: Package },
      { labelKey: 'nav.item.inventoryItems', href: '/inventory-items', icon: PackageOpen },
    ],
  },
  {
    labelKey: 'nav.section.masterData',
    items: [
      { labelKey: 'nav.item.sizes', href: '/sizes', icon: Ruler },
      { labelKey: 'nav.item.units', href: '/units', icon: Boxes },
      { labelKey: 'nav.item.productTypes', href: '/product-types', icon: Shapes },
      { labelKey: 'nav.item.productGroups', href: '/product-groups', icon: Tags },
    ],
  },
  {
    labelKey: 'nav.section.system',
    items: [{ labelKey: 'nav.item.settings', href: '/settings', icon: Settings }],
  },
];

/** Map a route href to its i18n label key (for breadcrumbs/titles). */
export const NAV_LOOKUP: Record<string, string> = Object.fromEntries(
  NAV_SECTIONS.flatMap((s) => s.items).map((i) => [i.href, i.labelKey]),
);
