# RENTA FE — Internal Build Spec (for module authors)

This is the shared contract + conventions every feature module must follow. The
foundation, layout, auth, and the **master-data** modules are already built and
pass `tsc --noEmit` with zero errors. Use master-data as your reference example.

## Golden rules

1. **Strict TS, no `any`.** Use the types in `@/types`.
2. **Never call axios directly.** Use `http` from `@/lib/api/http` — it unwraps
   `response.data.data` and normalizes errors into `NormalizedApiError`.
3. **Inject context.** Get `tenantId`, `branchId`, `userId`, `username` from
   `useTenantContext()` (`@/hooks/use-tenant-context`). Pass `tenantId` to every
   list/create call; pass `branchId`/`createdBy: userId` where the DTO needs it.
4. **Feature-isolated.** Only create files under `src/features/<module>/` and
   route pages under `src/app/(app)/<route>/`. Do NOT edit shared components or
   other features. If you need a small helper, put it in your feature folder.
5. **Client components.** All pages/components that use hooks must start with
   `'use client';`. Route `page.tsx` files may be server components that export
   `metadata` and render a client feature component.
6. Mark money fields with `formatCurrency`, dates with `formatDate`/`formatDateTime`
   from `@/lib/format`.
7. Toasts: `toast.success(title, desc?)` and `toastError(error, fallback)` from
   `@/lib/toast`. Mutations already toast in master-data — follow that pattern.
8. Every list page needs: loading skeleton, empty state, error state (all handled
   by `<ListView>`), plus success toasts and confirm dialogs for destructive ops.

## Reusable building blocks (already exist)

- `usePagination()` → `@/hooks/use-pagination`. Returns `{ page, pageSize, order,
  search, filters, setPage, setPageSize, setSearch, setFilter, setFilters, reset,
  queryParams }`. Spread `queryParams` into list calls.
- `<ListView columns rows getRowId isLoading isError error onRetry emptyTitle
  emptyDescription emptyAction onRowClick mobileCard />` → `@/components/tables/list-view`.
  `Column<T> = { id, header, cell:(row)=>node, className?, headerClassName?,
  hideBelow?:'sm'|'md'|'lg', primary? }`. Renders a table on md+ and cards on mobile.
- `<PaginationBar page pageSize total totalPages onPageChange onPageSizeChange />`
  → `@/components/tables/pagination-bar`.
- `<ListToolbar search onSearchChange searchPlaceholder filters actions />`
  → `@/components/common/list-toolbar` (debounced search).
- `<PageHeader title description actions />` → `@/components/common/page-header`.
- `<StatusBadge meta={SOME_META[value]} />` → `@/components/common/status-badge`.
  Meta maps live in `@/constants/enum-labels`: `ACTIVE_STATUS_META`,
  `INVENTORY_STATUS_META`, `CONDITION_STATUS_META`, `RENTAL_ORDER_STATUS_META`,
  `RENTAL_ORDER_ITEM_STATUS_META`. `toOptions(meta)` builds `{value,label}[]`.
- `<ConfirmDialog open onOpenChange title description destructive confirmText
  loading onConfirm />` → `@/components/common/confirm-dialog`.
- `<SelectField label required error options placeholder {...register('x')} />`
  → `@/components/forms/select-field` (`options: {value,label}[]`).
- `<EmptyState/>`, `<ErrorState/>` → `@/components/common/states`.

## Design-system components (`@/components/ui/*`, relative imports inside)

`Button` (variants: default/outline/secondary/ghost/destructive/link; sizes incl.
`icon`,`icon-sm`; props `loading`), `Input` (built-in `label`,`required`,`error`,
`type`), `Textarea` (same label/error props), `NativeSelect`+`NativeSelectOption`,
`Checkbox`, `Switch`, `Card`+`CardHeader`/`CardTitle`/`CardDescription`/`CardContent`/
`CardFooter`, `Badge`, `Skeleton`, `Separator`, `Tabs`, `Avatar`,
`Dialog`+`DialogContent`/`DialogHeader`/`DialogTitle`/`DialogDescription`/`DialogFooter`,
`AlertDialog…`, `DropdownMenu…`, `Tooltip…`, `Spinner`.

Notes:
- Base UI trigger components take a `render={<Button .../>}` prop (NOT `asChild`).
  Example: `<DropdownMenuTrigger render={<Button variant="ghost">…</Button>} />`.
- For RHF use `react-hook-form` + `@hookform/resolvers/zod` + `zod`. `Input`/
  `Textarea`/`SelectField`/`NativeSelect` forward refs, so `{...register('name')}`
  works. Numbers: `register('price', { valueAsNumber: true })` OR `z.coerce.number()`.
- A controlled Dialog form pattern is shown in
  `src/features/master-data/master-data-form.tsx` — copy it.

## API contract (base `/api`, all ids are strings, every response enveloped)

Pagination query params: `page`,`pageSize`,`order`(ASC|DESC),`search`,`tenantId`.
List response inside `data`: `{ items, total, page, pageSize, totalPages }`
(type `PaginatedResponse<T>`).

### Customers — `/customers`
- GET list filters: `tenantId`, `branchId`, `search` (name or phone).
- POST body: `{ tenantId, branchId?, name, phone, address?, note? }`.
- GET `/customers/:id`; PUT `/customers/:id` `{ name?, phone?, address?, note?, branchId? }`;
  DELETE `/customers/:id`.
- Model `Customer`: `{ id, tenantId, branchId|null, name, phone, address|null, note|null, createdAt, updatedAt }`.

### Products — `/products`
- GET list filters: `tenantId`, `status`(ACTIVE|INACTIVE), `productTypeId`,
  `productGroupId`, `search` (name or code).
- POST body: `{ tenantId, productTypeId, productGroupId, unitId, code, name,
  description?, rentalPrice(number), depositPrice(number), sizeIds?: string[],
  images?: { url, sortOrder?, isPrimary? }[] }`.
- GET/PUT/DELETE `/products/:id`; PATCH `/products/:id/status` `{ status }`.
  PUT body: same optional fields; `sizeIds`/`images` REPLACE when provided.
- Model `Product`: adds `status`, `sizeIds: string[]`,
  `images: { id, url, sortOrder, isPrimary }[]`.
- For type/group/unit/size dropdowns, fetch master-data lists
  (`/product-types`,`/product-groups`,`/units`,`/sizes`) with `status=ACTIVE`,
  `pageSize=100`, `tenantId`. Use `makeMasterApi` from
  `@/features/master-data/api` or plain `http.get`.

### Inventory items — `/inventory-items`
- GET list filters: `tenantId`, `branchId`, `productId`, `sizeId`, `status`,
  `conditionStatus`, `search` (serial or barcode).
- POST body: `{ tenantId, branchId, productId, sizeId, serialCode, barcode?,
  status?, conditionStatus?, note? }`.
- GET/PUT/DELETE `/inventory-items/:id`; PUT `{ branchId?, barcode?, note? }`.
- PATCH `/inventory-items/:id/status` `{ status }`;
  PATCH `/inventory-items/:id/condition` `{ conditionStatus }`.
- `InventoryItemStatus`: AVAILABLE|RENTED|MAINTENANCE|LOST|DISABLED.
- `InventoryItemConditionStatus`: NEW|GOOD|FAIR|NEEDS_CLEANING|NEEDS_REPAIR|DAMAGED.
- Model `InventoryItem`: `{ id, tenantId, branchId, productId, sizeId, serialCode,
  barcode|null, status, conditionStatus, note|null, createdAt, updatedAt }`.

### Rental orders — `/rental-orders`
- GET list filters: `tenantId`, `branchId`, `customerId`, `status`, `search`(orderCode).
- POST body: `{ tenantId, branchId, orderCode, createdBy, customerId? OR
  customer:{name,phone,address?,note?} (XOR — never both), rentDate(ISO),
  expectedReturnDate(ISO), depositAmount?, discountAmount?, note?,
  status?: 'DRAFT'|'RENTING' (default RENTING), items: { inventoryItemId, price }[] }`.
- GET `/rental-orders/:id` (detail + items). PUT `/rental-orders/:id` (DRAFT only):
  `{ note?, depositAmount?, discountAmount?, expectedReturnDate? }`.
- PATCH `/rental-orders/:id/confirm` (DRAFT→RENTING).
- PATCH `/rental-orders/:id/cancel`. DELETE `/rental-orders/:id` (DRAFT|CANCELLED only).
- `RentalOrderStatus`: DRAFT|RENTING|PARTIALLY_RETURNED|RETURNED|OVERDUE|CANCELLED.
- Model `RentalOrder`: `{ id, tenantId, branchId, orderCode, customerId, createdBy,
  rentDate, expectedReturnDate, actualReturnDate|null, depositAmount, discountAmount,
  totalAmount, lateFee, damageFee, status, note|null, items: RentalOrderItem[],
  createdAt, updatedAt }`.
- `RentalOrderItem`: `{ id, tenantId, rentalOrderId, inventoryItemId, productId,
  price, status, createdAt, updatedAt }` (`RentalOrderItemStatus`:
  RENTED|RETURNED|LOST|DAMAGED|CANCELLED).
- Create wizard: step 1 customer (existing via `customerId` OR new inline
  `customer` — enforce XOR), step 2 select inventory where `status=AVAILABLE` and
  `branchId=<active>`, step 3 dates/deposit/discount/note, step 4 review, step 5
  submit (DRAFT or RENTING). Generate a default `orderCode` like
  `RO-<yyyymmdd>-<rand>` (use a stable rand based on time, not crypto).

### Return transactions — `/return-transactions`
- GET list filters: `tenantId`, `branchId`, `rentalOrderId`.
- POST body: `{ tenantId, branchId, rentalOrderId, createdBy, returnDate(ISO),
  lateFee?, note?, items: { rentalOrderItemId, inventoryItemId, conditionStatus,
  damageFee?, note? }[] }`. Supports partial returns (subset of items).
- GET `/return-transactions/:id`; DELETE `/return-transactions/:id`.
- Model `ReturnTransaction`: `{ id, tenantId, branchId, rentalOrderId, createdBy,
  returnDate, lateFee, damageFee, totalAmount, note|null, items:
  ReturnTransactionItem[], createdAt, updatedAt }`.
- `ReturnTransactionItem`: `{ id, tenantId, returnTransactionId, rentalOrderItemId,
  inventoryItemId, conditionStatus, damageFee, note|null, createdAt, updatedAt }`.
- Create flow: pick a rental order (status RENTING/PARTIALLY_RETURNED/OVERDUE),
  show its unreturned items (rentalOrderItem.status !== 'RETURNED' && !== 'CANCELLED'),
  let user select which to return + set conditionStatus + damageFee + lateFee, submit.

## Verification

After writing your files, run from the repo root:
`npx tsc --noEmit 2>&1 | grep 'error TS'` and fix every error in YOUR files.
Do not introduce errors in shared files.
