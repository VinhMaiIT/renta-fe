import type { Locale } from '../config';

import enCommon from './en/common';
import enNav from './en/nav';
import enAuth from './en/auth';
import enEnums from './en/enums';
import enMasterData from './en/masterData';
import enDashboard from './en/dashboard';
import enSettings from './en/settings';
import enCustomers from './en/customers';
import enProducts from './en/products';
import enInventory from './en/inventory';
import enRentalOrders from './en/rentalOrders';
import enReturns from './en/returns';
import enBilling from './en/billing';
import enTenants from './en/tenants';
import enBranches from './en/branches';

import viCommon from './vi/common';
import viNav from './vi/nav';
import viAuth from './vi/auth';
import viEnums from './vi/enums';
import viMasterData from './vi/masterData';
import viDashboard from './vi/dashboard';
import viSettings from './vi/settings';
import viCustomers from './vi/customers';
import viProducts from './vi/products';
import viInventory from './vi/inventory';
import viRentalOrders from './vi/rentalOrders';
import viReturns from './vi/returns';
import viBilling from './vi/billing';
import viTenants from './vi/tenants';
import viBranches from './vi/branches';

export type MessageTree = { [key: string]: string | MessageTree };

const en = {
  common: enCommon,
  nav: enNav,
  auth: enAuth,
  enums: enEnums,
  masterData: enMasterData,
  dashboard: enDashboard,
  settings: enSettings,
  customers: enCustomers,
  products: enProducts,
  inventory: enInventory,
  rentalOrders: enRentalOrders,
  returns: enReturns,
  billing: enBilling,
  tenants: enTenants,
  branches: enBranches,
};

const vi = {
  common: viCommon,
  nav: viNav,
  auth: viAuth,
  enums: viEnums,
  masterData: viMasterData,
  dashboard: viDashboard,
  settings: viSettings,
  customers: viCustomers,
  products: viProducts,
  inventory: viInventory,
  rentalOrders: viRentalOrders,
  returns: viReturns,
  billing: viBilling,
  tenants: viTenants,
  branches: viBranches,
};

export const MESSAGES: Record<Locale, MessageTree> = {
  en: en as MessageTree,
  vi: vi as MessageTree,
};
