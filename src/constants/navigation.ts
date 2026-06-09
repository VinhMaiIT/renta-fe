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
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    label: 'Overview',
    items: [{ label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard }],
  },
  {
    label: 'Operations',
    items: [
      { label: 'Rental Orders', href: '/rental-orders', icon: Receipt },
      { label: 'Return Transactions', href: '/return-transactions', icon: RotateCcw },
      { label: 'Customers', href: '/customers', icon: Users },
    ],
  },
  {
    label: 'Catalog',
    items: [
      { label: 'Products', href: '/products', icon: Package },
      { label: 'Inventory Items', href: '/inventory-items', icon: PackageOpen },
    ],
  },
  {
    label: 'Master Data',
    items: [
      { label: 'Sizes', href: '/sizes', icon: Ruler },
      { label: 'Units', href: '/units', icon: Boxes },
      { label: 'Product Types', href: '/product-types', icon: Shapes },
      { label: 'Product Groups', href: '/product-groups', icon: Tags },
    ],
  },
  {
    label: 'System',
    items: [{ label: 'Settings', href: '/settings', icon: Settings }],
  },
];

/** Flat lookup used by breadcrumbs / page titles. */
export const NAV_LOOKUP: Record<string, string> = Object.fromEntries(
  NAV_SECTIONS.flatMap((s) => s.items).map((i) => [i.href, i.label]),
);
