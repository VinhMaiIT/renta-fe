# FE Screen Pattern — Reference: "Quản lý Tenant"

> Màn hình **Tenant Management** (`/tenants`) là **mẫu chuẩn (reference implementation)** cho các màn hình list + detail còn lại. Tài liệu này mô tả cấu trúc file, quy ước, và các thành phần dùng lại — copy theo đây khi build module mới.
>
> Contract API xem `FE-BUILD-SPEC.md`. Tài liệu này nói về **cách dựng màn hình FE**, không lặp lại contract.

---

## 1. Cấu trúc một feature

Mỗi module = 1 thư mục `src/features/<name>/` + route trong `src/app/(app)/<name>/` + i18n namespace. Với `tenants`:

```
src/features/tenants/
├── api.ts              # REST client thuần (http wrapper) — không state
├── use-tenants.ts      # React Query hooks (queries + mutations)
├── tenants-page.tsx    # Màn hình list  (ListPageHeader + DataTableView)
└── tenant-detail.tsx   # Màn hình detail (PageHeader + Card)

src/app/(app)/tenants/
├── page.tsx            # Route list      → render <TenantsPage />
└── [id]/page.tsx       # Route detail     → await params; render <TenantDetail id={id} />

src/types/models.ts                 # interface Tenant (+ field denormalized)
src/i18n/messages/{en,vi}/tenants.ts # namespace, đăng ký trong messages/index.ts
src/constants/navigation.ts          # NAV item + role gating
```

**Nguyên tắc tách lớp:** `api.ts` (gọi mạng) → `use-*.ts` (cache/invalidate/toast) → `*-page.tsx` / `*-detail.tsx` (UI). Component **không** gọi `http` trực tiếp.

---

## 2. Layer API (`api.ts`)

- Dùng `http` từ `@/lib/api/http` (đã tự `unwrap(response.data.data)` + normalize lỗi). **Không** gọi `axios` trực tiếp.
- List trả `PaginatedResponse<T>`. Truyền nguyên `params` (page/pageSize/order/search/filters).
- Object thuần, mỗi method 1 endpoint. Không giữ state.

```ts
// src/features/tenants/api.ts
export interface TenantListParams {
  search?: string; status?: string;
  page?: number; pageSize?: number; order?: SortOrder;
}

export const tenantsApi = {
  list: (params: TenantListParams) => http.get<PaginatedResponse<Tenant>>('/tenants', { params }),
  get: (id: Id) => http.get<Tenant>(`/tenants/${id}`),
  setStatus: (id: Id, status: ActiveStatus) =>
    http.patch<Tenant>(`/admin/tenants/${id}/status`, { status }),
  listBranches: (tenantId: Id) =>
    http.get<PaginatedResponse<Branch>>('/branches', { params: { tenantId, pageSize: 100 } }),
};
```

> ⚠️ Không còn mock backend. Mọi call đi thẳng `NEXT_PUBLIC_API_BASE_URL`. Endpoint phải tồn tại trên BE.

---

## 3. Layer hooks (`use-*.ts`)

- `'use client'`. Dùng `@tanstack/react-query`.
- 1 `QUERY_KEY` gốc; list key kèm `params` để cache theo filter/trang.
- Mutation → toast (`@/lib/toast`) + `invalidateQueries` theo key gốc.
- Query detail/phụ thuộc id → `enabled: Boolean(id)`.

```ts
const QUERY_KEY = 'tenants';

export function useTenants(params: UseTenantsParams) {
  return useQuery({ queryKey: [QUERY_KEY, params], queryFn: () => tenantsApi.list(params) });
}
export function useTenantBranches(tenantId: Id) {
  return useQuery({
    queryKey: [QUERY_KEY, tenantId, 'branches'],
    enabled: Boolean(tenantId),
    queryFn: () => tenantsApi.listBranches(tenantId),
  });
}
export function useSetTenantStatus() {
  const qc = useQueryClient(); const { t } = useT();
  return useMutation({
    mutationFn: ({ id, status }: { id: Id; status: ActiveStatus }) => tenantsApi.setStatus(id, status),
    onSuccess: () => { toast.success(t('common.toast.updated')); qc.invalidateQueries({ queryKey: [QUERY_KEY] }); },
    onError: (e) => toastError(e, t('common.toast.saveFailed')),
  });
}
```

> Module thuộc **tenant portal** thì list hook lấy `tenantId/branchId` từ `useTenantContext()` và `enabled: Boolean(tenantId)` (xem `features/customers/use-customers.ts`). Module **SaaS admin** (như tenants) **không** scope theo tenant.

---

## 4. Màn hình LIST (`*-page.tsx`)

Khung chuẩn: `ListPageHeader` (title + search + filters) → `DataTableView` (table + server pagination).

```tsx
const pagination = usePagination({ initialPageSize: 10 }); // pager hiện khi total > 10
const list = useTenants(pagination.queryParams);
const data = list.data;
```

### 4.1 Columns

Dùng `Column<T>[]` của `DataTableView`. Quy ước:

- `className` đặt **độ rộng cột** (`w-28`, `min-w-[18rem]`) — cột tên dùng `min-w` để hiện đủ.
- `hideBelow: 'sm' | 'md' | 'lg'` để ẩn cột ở màn nhỏ (responsive).
- Trạng thái → `<StatusBadge meta={ACTIVE_STATUS_META[r.status]} />`.
- Field denormalized có thể thiếu → render `?? '—'`.
- Cột `actions` (id phải là `'actions'` để được pin phải): **bọc `<div onClick={(e) => e.stopPropagation()}>`** để click menu không kích hoạt `onRowClick`.

```tsx
const columns: Column<Tenant>[] = [
  { id: 'code', header: t('tenants.code'), className: 'w-28',
    cell: (r) => <span className="font-mono text-xs">{r.code}</span> },
  { id: 'name', header: t('common.table.name'), className: 'min-w-[18rem] whitespace-normal',
    cell: (r) => <span className="font-medium">{r.name}</span> },
  { id: 'status', header: t('common.table.status'), className: 'w-28',
    cell: (r) => <StatusBadge meta={ACTIVE_STATUS_META[r.status]} /> },
  { id: 'actions', header: '', headerClassName: 'w-10 text-right', className: 'text-right',
    cell: (r) => (
      <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
        <DropdownMenu>…</DropdownMenu>
      </div>
    ) },
];
```

### 4.2 Header + bảng

```tsx
<ListPageHeader
  title={t('tenants.countSummary', { count: data?.items.length ?? 0, total: data?.total ?? 0 })}
  titleClassName="text-base font-semibold sm:text-base"   // tuỳ chọn: thu nhỏ tiêu đề
  search={pagination.search}
  onSearchChange={pagination.setSearch}                    // debounce 350ms sẵn trong component
  searchPlaceholder={t('tenants.searchPlaceholder')}
  filters={
    <NativeSelect value={pagination.filters.status ?? ''}
      onChange={(e) => pagination.setFilter('status', e.target.value || undefined)}
      aria-label={t('common.table.status')} className="bg-card">
      <NativeSelectOption value="">{t('common.table.allStatuses')}</NativeSelectOption>
      <NativeSelectOption value="ACTIVE">{t('enums.activeStatus.ACTIVE')}</NativeSelectOption>
      <NativeSelectOption value="INACTIVE">{t('enums.activeStatus.INACTIVE')}</NativeSelectOption>
    </NativeSelect>
  }
  actions={/* <Button> "New …" nếu có create */}
/>

<DataTableView
  columns={columns}
  rows={data?.items ?? []}
  isLoading={list.isLoading}
  isError={list.isError}
  error={list.error}
  onRetry={() => list.refetch()}
  onRowClick={(r) => router.push(`/tenants/${r.id}`)}     // mở detail
  emptyTitle={t('tenants.emptyTitle')}
  page={data?.page ?? pagination.page}
  pageSize={data?.pageSize ?? pagination.pageSize}
  total={data?.total ?? 0}
  onPageChange={pagination.setPage}
  onPageSizeChange={pagination.setPageSize}
/>
```

**Pagination:** `usePagination` quản page/pageSize/order/search/filters và xuất `queryParams` để spread vào API. `setSearch`/`setFilter`/`setPageSize` tự reset về trang 1. Pager + dropdown page-size chỉ hiện khi `total > 10`.

---

## 5. Màn hình DETAIL (`*-detail.tsx`)

- Nhận `id` từ route (route component `await params`).
- 3 trạng thái: `isLoading` → `<Skeleton>`; `isError`/no-data → nút Back + `<ErrorState>`; có data → nội dung.
- Bố cục: nút Back → `PageHeader` (title + status badge) → lưới `Card` (mỗi nhóm thông tin 1 card) → list con (vd chi nhánh) fetch riêng bằng hook phụ.
- Helper `Field({label,value})` cho cặp label/value; fallback `'—'`.

```tsx
const query = useTenant(id);
const branchesQuery = useTenantBranches(id);   // list con
if (query.isLoading) return <DetailSkeleton />;
if (query.isError || !query.data) return /* Back + ErrorState */;
const tenant = query.data;
```

Route detail:

```tsx
// src/app/(app)/tenants/[id]/page.tsx
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TenantDetail id={id} />;
}
```

---

## 6. Types & field denormalized

- Interface domain ở `src/types/models.ts` (mirror BE). Field **denormalized cho grid/detail** đánh dấu **optional** tới khi BE bổ sung:

```ts
export interface Tenant extends Timestamped {
  id: Id; code: string; name: string; phone: string | null;
  email: string | null; address: string | null; status: TenantStatus;
  branchCount?: number;                          // BE cần bổ sung
  subscription?: TenantPackageSummary | null;    // BE cần bổ sung
}
```

- Khi cần field mới từ BE → khai báo optional ở FE, render `'—'` khi thiếu, và **ghi vào mục "API gaps" của `FE-BUILD-SPEC.md`** để BE bổ sung.

---

## 7. i18n

- Mỗi feature 1 namespace: `src/i18n/messages/en/<ns>.ts` + `vi/<ns>.ts`, **đăng ký trong `messages/index.ts`** (import + thêm vào cả `en` và `vi`).
- Gọi qua `const { t } = useT()`; key dạng `'<ns>.key'`, interpolation `t('tenants.countSummary', { count, total })`.
- Nhãn cột/trạng thái dùng key chung `common.table.*`, `enums.*` khi có.
- Lỗi → map `error.code` → key (không hardcode message BE).

---

## 8. Navigation & phân quyền theo userType

`src/constants/navigation.ts`: `NAV_SECTIONS` có thể gắn `userTypes?: PrincipalType[]`. Section không khai báo → mọi user thấy. `getNavSections(userType)` lọc theo `session.userType`.

```ts
{ labelKey: 'nav.section.tenants', userTypes: ['SAAS_ADMIN'],
  items: [{ labelKey: 'nav.item.tenants', href: '/tenants', icon: Building2 }] }
```

- Item mới phải thêm vào `NAV_SECTIONS` (tự vào `NAV_LOOKUP` → breadcrumb).
- Breadcrumb (`components/layout/breadcrumbs.tsx`) lấy nhãn trang hiện tại từ `NAV_LOOKUP[href]`; crumb cuối là tiêu đề lớn trên app header.

---

## 9. UI dùng lại (đừng tự dựng)

| Thành phần | Import | Dùng cho |
| --- | --- | --- |
| `ListPageHeader` | `@/components/common/list-page-header` | Header list: title/search/filters/actions (có `titleClassName`) |
| `DataTableView` | `@/components/tables/data-table-view` | Bảng + server pagination + empty/error |
| `PageHeader` | `@/components/common/page-header` | Header detail |
| `StatusBadge` + `*_STATUS_META` | `@/components/common/status-badge`, `@/constants/enum-labels` | Pill trạng thái có màu + i18n |
| `NativeSelect` | `@/components/ui/native-select` | Filter select (truyền `className="bg-card"`) |
| `ConfirmDialog` | `@/components/common/confirm-dialog` | Xác nhận xoá/đổi trạng thái |
| `Card`, `Skeleton`, `Button`, `DropdownMenu` | `@/components/ui/*` | Khối detail, loading, actions |
| `usePagination` | `@/hooks/use-pagination` | State phân trang/filter |
| `formatDate`, `formatCurrency` | `@/lib/format` | Hiển thị ngày/tiền |

---

## 10. Checklist khi build màn hình mới

1. `src/features/<name>/api.ts` — methods `http.*` theo endpoint (xem `FE-BUILD-SPEC.md §5`).
2. `use-<name>.ts` — `useList(params)`, `useOne(id)`, mutations (toast + invalidate).
3. `<name>-page.tsx` — `usePagination` → `ListPageHeader` + `DataTableView` (columns + `onRowClick`).
4. `<name>-detail.tsx` (nếu có) — loading/error/data; `PageHeader` + `Card`.
5. `src/app/(app)/<name>/page.tsx` (+ `[id]/page.tsx`).
6. i18n `en/<name>.ts` + `vi/<name>.ts` → đăng ký `messages/index.ts`.
7. `navigation.ts` — thêm nav item (+ `userTypes` nếu phân quyền).
8. Types ở `models.ts`; field thiếu → optional + ghi "API gaps".
9. `npx tsc --noEmit` + `npx eslint src/...` sạch lỗi.
