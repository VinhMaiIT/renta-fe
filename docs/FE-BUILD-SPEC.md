# RENTA Backend — Frontend Integration Guide

> Copy file này sang project FE. Cập nhật theo backend tại thời điểm có: module URL prefixes, JWT auth cho tenant, OTP onboarding, subscription/limit gating.

## 1. Base URL & cấu trúc route

Global prefix: **`/api`**. Mọi route được gom **theo module**:

| Module       | Prefix              | Auth                                          |
| ------------ | ------------------- | --------------------------------------------- |
| `auth`       | `/api/auth/*`       | login: public; `me`/`change-password`: Bearer |
| `public`     | `/api/public/*`     | Public (không cần token) — onboarding/đăng ký |
| `saas-admin` | `/api/saas-admin/*` | (Platform operator)                           |
| `tenant`     | `/api/tenant/*`     | **Bắt buộc Bearer + là user TENANT**          |

Swagger: `/api/docs` (có dropdown chọn module).

```
VITE_API_BASE_URL=http://localhost:3001/api
```

## 2. Response envelope (luôn cố định)

**Thành công**

```json
{ "success": true, "data": <payload>, "timestamp": "2026-06-10T09:31:03.787Z" }
```

**Lỗi**

```json
{
  "success": false,
  "error": { "code": "SUBSCRIPTION_EXPIRED", "message": "..." },
  "path": "/api/tenant/units",
  "timestamp": "..."
}
```

- `error.code` là **machine code ổn định** cho lỗi nghiệp vụ (xem bảng §7) → branch logic theo code này.
- Lỗi khung (validation, token sai, not-found) **không có code riêng** → `error.code = "INTERNAL_ERROR"`, lúc đó hãy branch theo **HTTP status**.
- Lỗi validation (`400`): `error.message` là **mảng string** (vd `["property tenantId should not exist"]`).

**Phân trang** (list endpoints): `data` có shape:

```json
{ "items": [...], "total": 123, "page": 1, "pageSize": 20, "totalPages": 7 }
```

## 3. Authentication

JWT access token (mặc định sống `15m`) + refresh token (`7d`).

| Method | Path                        | Body                                        | Trả về (`data`)                                                                         |
| ------ | --------------------------- | ------------------------------------------- | --------------------------------------------------------------------------------------- |
| POST   | `/api/auth/login`           | `{ username, password }`                    | `{ accessToken, refreshToken, tokenType: "Bearer", expiresIn }`                         |
| POST   | `/api/auth/refresh`         | `{ refreshToken }`                          | `{ accessToken, refreshToken, tokenType, expiresIn }`                                   |
| GET    | `/api/auth/me`              | — (Bearer)                                  | `{ id, username, fullName, phone, status, userType, tenantId, isAdmin, permissions[] }` |
| POST   | `/api/auth/change-password` | `{ currentPassword, newPassword }` (Bearer) | `204`                                                                                   |
| POST   | `/api/auth/forgot-password` | `{ username }`                              | `{ ... }` (dev trả token để test)                                                       |
| POST   | `/api/auth/reset-password`  | `{ token, newPassword }`                    | `204`                                                                                   |

Access token (payload, để FE đọc nếu cần): `{ sub (userId), userType, username, isAdmin, tenantId }`.
Gắn vào mọi request cần auth: header `Authorization: Bearer <accessToken>`.

## 4. Quy ước cho API `tenant/*` (QUAN TRỌNG)

Sau khi siết bảo mật, FE **phải** tuân thủ:

1. **KHÔNG gửi `tenantId`** trong body hay query nữa — server lấy từ JWT. Gửi dư field → `400` (`property tenantId should not exist`).
2. **KHÔNG gửi `branchId`/`createdBy`** trong body của các create — server lấy từ context.
3. **Chi nhánh hiện hành**: gửi qua header **`X-Branch-Id: <branchId>`**. Nếu không gửi, server dùng **chi nhánh mặc định** của user.
   - Các endpoint **bắt buộc** có chi nhánh (tạo inventory-item / rental-order / return-transaction) sẽ trả `400 BRANCH_REQUIRED` nếu không có header và user cũng chưa có default branch.
   - Gửi branch mà user không thuộc → `403 BRANCH_ACCESS_DENIED`.
4. **Subscription**: tenant hết hạn/không active → mọi endpoint tenant trả `403 SUBSCRIPTION_EXPIRED` → FE điều hướng tới trang gia hạn.
5. **Giới hạn gói**: tạo vượt quota (sản phẩm/tồn kho/chi nhánh/user) → `403 LIMIT_EXCEEDED` → gợi ý nâng cấp gói.
6. **Cross-tenant**: gọi `:id` không thuộc tenant của mình → `404` (ẩn sự tồn tại).
7. User `SAAS_ADMIN` gọi API tenant → `403 FORBIDDEN_NON_TENANT`.

### Danh sách route tenant

`/api/tenant/` + : `sizes`, `units`, `product-types`, `product-groups`, `products`, `inventory-items`, `customers`, `rental-orders`, `return-transactions`, `tenant-users/:userId/branches`.

Mỗi catalog resource (size/unit/product-type/product-group/product) có: `POST /`, `GET /` (phân trang: `?page&pageSize&order=ASC|DESC&status&search`), `GET /:id`, `PUT /:id`, `DELETE /:id`, `PATCH /:id/status` (`{ status: "ACTIVE"|"INACTIVE" }`).

Ví dụ tạo unit (đúng):

```http
POST /api/tenant/units
Authorization: Bearer <token>
Content-Type: application/json

{ "name": "Cái", "order": 0 }
```

`tenant-users/:userId/branches` chỉ dành cho tenant **admin** (`isAdmin=true`), nếu không → `403 TENANT_ADMIN_REQUIRED`.

## 5. Onboarding (đăng ký shop mới) — `public/*`, không cần token

Luồng: chọn gói → nhập email → OTP → nhập thông tin shop → đăng ký → (nếu trả phí) đính kèm chứng từ.

| B   | Method | Path                                   | Body                                                 | `data`                                                                           |
| --- | ------ | -------------------------------------- | ---------------------------------------------------- | -------------------------------------------------------------------------------- |
| 1   | GET    | `/api/public/packages`                 | —                                                    | `PackageSummary[]` (id, code, name, priceMonthly, priceYearly, limits, features) |
| 2   | POST   | `/api/public/onboarding/request-otp`   | `{ email }`                                          | `{ resendInSeconds, debugOtp }` (`debugOtp` chỉ có ở non-production)             |
| 3   | POST   | `/api/public/onboarding/verify-otp`    | `{ email, otp }`                                     | `{ verificationToken }`                                                          |
| 4   | POST   | `/api/public/onboarding/register`      | xem dưới                                             | `{ tenant, owner, mainBranch, subscription, invoice, payment }`                  |
| 5   | POST   | `/api/public/onboarding/payment-proof` | `{ proofToken, paymentProofUrl, paymentReference? }` | `{ invoiceId, invoiceCode, status, paymentProofUrl }`                            |

**Register body:**

```jsonc
{
  "verificationToken": "<từ bước 3>",
  "mode": "TRIAL", // hoặc "PAID"
  "packageId": "1",
  "paymentCycle": "MONTHLY", // bắt buộc khi mode=PAID (MONTHLY|YEARLY)
  "shop": { "name": "Shop ABC", "phone": "0900...", "address": "..." },
  "owner": { "fullName": "Nguyễn Văn A", "password": "ít nhất 8 ký tự" },
}
```

- Username đăng nhập của owner = **email đã verify**.
- `mode=TRIAL` → tenant ACTIVE ngay; `invoice`/`payment` = `null`. Owner login được luôn.
- `mode=PAID` → tenant INACTIVE; `data.payment` = `{ proofToken, bank:{ name, accountNumber, accountHolder, qrTemplate }, amount, transferMemo }`. FE hiển thị thông tin chuyển khoản (nội dung CK = `transferMemo` = mã invoice), rồi gọi bước 5 với `proofToken`. Admin xác nhận → tenant được kích hoạt.

## 6. Axios client mẫu (copy)

```ts
import axios, { AxiosError } from 'axios';

export const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL });

// --- token store (đổi sang store thật của bạn) ---
const store = {
  get access() {
    return localStorage.getItem('accessToken');
  },
  get refresh() {
    return localStorage.getItem('refreshToken');
  },
  get branchId() {
    return localStorage.getItem('branchId');
  }, // chi nhánh đang chọn
  set({ accessToken, refreshToken }: { accessToken: string; refreshToken: string }) {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  },
  clear() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },
};

// --- request: gắn Bearer + X-Branch-Id ---
api.interceptors.request.use((config) => {
  if (store.access) config.headers.Authorization = `Bearer ${store.access}`;
  if (store.branchId) config.headers['X-Branch-Id'] = store.branchId;
  return config;
});

// --- unwrap envelope + auto-refresh khi 401 ---
let refreshing: Promise<void> | null = null;

api.interceptors.response.use(
  (res) => (res.data?.success ? res.data.data : res.data), // trả thẳng `data`
  async (error: AxiosError<any>) => {
    const res = error.response;
    const original: any = error.config;

    // 401 → thử refresh 1 lần
    if (res?.status === 401 && store.refresh && !original.__retried) {
      original.__retried = true;
      try {
        refreshing ??= axios
          .post(`${api.defaults.baseURL}/auth/refresh`, { refreshToken: store.refresh })
          .then((r) => {
            store.set(r.data.data);
          })
          .finally(() => {
            refreshing = null;
          });
        await refreshing;
        return api(original);
      } catch {
        store.clear();
        // điều hướng tới /login
      }
    }

    // chuẩn hoá lỗi nghiệp vụ cho UI
    const body = res?.data;
    return Promise.reject({
      status: res?.status,
      code: body?.error?.code ?? 'UNKNOWN', // machine code (xem §7)
      message: Array.isArray(body?.error?.message)
        ? body.error.message.join(', ')
        : (body?.error?.message ?? error.message),
    });
  },
);
```

Ví dụ dùng:

```ts
await api.post('/auth/login', { username, password }); // -> { accessToken, refreshToken, ... }
const sizes = await api.get('/tenant/units', { params: { page: 1, pageSize: 20 } }); // -> { items, total, ... }
await api.post('/tenant/units', { name: 'Cái', order: 0 }); // KHÔNG kèm tenantId
```

## 7. Bảng error code (branch logic)

| HTTP | `error.code`                                                        | Ý nghĩa / xử lý FE                                 |
| ---- | ------------------------------------------------------------------- | -------------------------------------------------- |
| 401  | `INTERNAL_ERROR` (msg "Invalid or expired token") / `AUTH_REQUIRED` | Token thiếu/sai/hết hạn → refresh hoặc về login    |
| 401  | `USER_INVALID` / `TOKEN_NOT_TENANT_SCOPED`                          | Token không còn hợp lệ → logout                    |
| 403  | `FORBIDDEN_NON_TENANT`                                              | SAAS_ADMIN gọi API tenant                          |
| 403  | `TENANT_INACTIVE`                                                   | Tenant bị khoá                                     |
| 403  | `SUBSCRIPTION_EXPIRED`                                              | Hết hạn gói → trang gia hạn/thanh toán             |
| 403  | `BRANCH_ACCESS_DENIED`                                              | User không thuộc chi nhánh đã chọn                 |
| 400  | `BRANCH_REQUIRED`                                                   | Cần header `X-Branch-Id` (hoặc set default branch) |
| 403  | `TENANT_ADMIN_REQUIRED`                                             | Thao tác chỉ dành cho tenant admin                 |
| 403  | `LIMIT_EXCEEDED`                                                    | Vượt quota gói → gợi ý nâng cấp                    |
| 404  | `INTERNAL_ERROR`                                                    | Không tìm thấy / không thuộc tenant của bạn        |
| 400  | `INTERNAL_ERROR` (msg là mảng)                                      | Lỗi validate dữ liệu gửi lên                       |
| 409  | `*_ALREADY_EXISTS` …                                                | Trùng dữ liệu (code tuỳ resource)                  |
| 429  | `OTP_THROTTLED` / `OTP_TOO_MANY_ATTEMPTS`                           | Gửi/nhập OTP quá nhanh/nhiều                       |
| 422  | `OTP_INVALID` / `OTP_EXPIRED`                                       | OTP sai/hết hạn                                    |
| 401  | `ONBOARDING_TOKEN_INVALID`                                          | verification/proof token sai/hết hạn               |

## 8. Checklist di trú cho FE (so với bản cũ)

- [ ] Đổi mọi URL sang có prefix module: `…/units` → `…/tenant/units`, `…/login` → `…/auth/login`, …
- [ ] Bỏ `tenantId` khỏi mọi body & query.
- [ ] Bỏ `branchId`, `createdBy` khỏi body create; chuyển branch sang header `X-Branch-Id`.
- [ ] Thêm interceptor gắn `Authorization` + `X-Branch-Id`, unwrap `data`, auto-refresh 401.
- [ ] Xử lý `SUBSCRIPTION_EXPIRED`, `LIMIT_EXCEEDED`, `BRANCH_*` theo §7.
- [ ] Cập nhật luồng đăng ký dùng `public/onboarding/*`.
