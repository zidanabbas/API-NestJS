# Fitur: Kategori Menu (Categories)

Module: [src/modules/categories](../../src/modules/categories)

CRUD penuh untuk kategori menu (mis. "Makanan", "Minuman"). Satu kategori bisa memiliki banyak item menu.

## Endpoint

| Method | Path | Auth | Deskripsi |
| ------ | ---- | :--: | --------- |
| `POST`   | `/api/v1/categories` | 🔒 ADMIN | Buat kategori baru |
| `GET`    | `/api/v1/categories` | Publik | Daftar semua kategori |
| `GET`    | `/api/v1/categories/:id` | Publik | Detail satu kategori |
| `PATCH`  | `/api/v1/categories/:id` | 🔒 ADMIN | Update kategori |
| `DELETE` | `/api/v1/categories/:id` | 🔒 ADMIN | Hapus kategori |

> 🔒 ADMIN = butuh login **dan** role `ADMIN` (`JwtAuthGuard` + `RolesGuard` + `@Roles(UserRole.ADMIN)`). Tanpa login → `401`, login non-ADMIN → `403 Forbidden`. Endpoint `GET` tetap publik.

### `POST /api/v1/categories` — Buat Kategori

**Request body** ([CreateCategoryDto](../../src/modules/categories/dto/create-category.dto.ts)):

```json
{
  "name": "Makanan"
}
```

| Field | Tipe | Validasi |
| ----- | ---- | -------- |
| `name` | `string` | wajib, tidak boleh kosong, maksimal 100 karakter, harus unik |

**Response `201 Created`**:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Makanan",
    "isActive": true,
    "createdAt": "2026-08-13T02:00:00.000Z",
    "updatedAt": "2026-08-13T02:00:00.000Z"
  }
}
```

**Response `409 Conflict`** — nama kategori sudah dipakai:

```json
{
  "success": false,
  "statusCode": 409,
  "error": "Conflict",
  "message": "Category already exists",
  "path": "/api/v1/categories",
  "timestamp": "2026-08-14T02:00:00.000Z"
}
```

### `GET /api/v1/categories` — Daftar Kategori

Response `200 OK`, diurutkan dari yang terbaru (`createdAt` descending):

```json
{
  "success": true,
  "data": [
    { "id": 2, "name": "Minuman", "isActive": true, "createdAt": "...", "updatedAt": "..." },
    { "id": 1, "name": "Makanan", "isActive": true, "createdAt": "...", "updatedAt": "..." }
  ]
}
```

### `GET /api/v1/categories/:id` — Detail Kategori

**Response `200 OK`**:

```json
{
  "success": true,
  "data": { "id": 1, "name": "Makanan", "isActive": true, "createdAt": "...", "updatedAt": "..." }
}
```

**Response `404 Not Found`**:

```json
{
  "success": false,
  "statusCode": 404,
  "error": "Not Found",
  "message": "Category not found",
  "path": "/api/v1/categories/99",
  "timestamp": "2026-08-14T02:00:00.000Z"
}
```

### `PATCH /api/v1/categories/:id` — Update Kategori

**Request body** ([UpdateCategoryDto](../../src/modules/categories/dto/update-category.dto.ts) — semua field `CreateCategoryDto` menjadi opsional):

```json
{
  "name": "Makanan Berat"
}
```

**Response `200 OK`** — mengembalikan kategori setelah diupdate (shape sama seperti detail kategori).

**Error**: `404 Not Found` jika `id` tidak ada, `409 Conflict` jika `name` baru sudah dipakai kategori **lain**.

### `DELETE /api/v1/categories/:id` — Hapus Kategori

**Response `200 OK`** — mengembalikan data kategori yang baru saja dihapus.

**Response `404 Not Found`** — `id` tidak ada.

**Response `409 Conflict`** — kategori masih memiliki menu:

```json
{
  "success": false,
  "statusCode": 409,
  "error": "Conflict",
  "message": "Category still has menu items and cannot be deleted",
  "path": "/api/v1/categories/1",
  "timestamp": "2026-08-14T02:00:00.000Z"
}
```

## Business Rules

- **Nama unik**: dicek eksplisit sebelum create, dan sebelum update jika `name` diubah (existing dengan `id` berbeda dianggap konflik) — [categories.service.ts](../../src/modules/categories/categories.service.ts).
- **Proteksi hapus**: kategori tidak bisa dihapus jika masih punya menu (`CategoriesRepository.countMenus`), agar tidak menyisakan menu yatim/orphan atau mengandalkan error foreign key mentah dari database.
- `findOne` (dipakai internal oleh `update`/`remove`) melempar `404 Not Found` jika kategori tidak ditemukan, sehingga update/delete pada ID yang tidak ada selalu konsisten mengembalikan 404.

## Implementasi Teknis

| File | Peran |
| ---- | ----- |
| [categories.controller.ts](../../src/modules/categories/categories.controller.ts) | Routing CRUD |
| [categories.service.ts](../../src/modules/categories/categories.service.ts) | Validasi nama unik & proteksi hapus |
| [categories.repository.ts](../../src/modules/categories/categories.repository.ts) | Query Prisma (`create`, `findMany`, `findUnique`, `update`, `delete`, `count`) |
| [dto/create-category.dto.ts](../../src/modules/categories/dto/create-category.dto.ts) | Validasi request create |
| [dto/update-category.dto.ts](../../src/modules/categories/dto/update-category.dto.ts) | `PartialType(CreateCategoryDto)` |
| [dto/category-response.dto.ts](../../src/modules/categories/dto/category-response.dto.ts) | Shape response untuk dokumentasi Swagger (`@ApiOkData`/`@ApiCreatedData`) |

## Catatan & Batasan Saat Ini

- Controller ini sudah memiliki `@ApiTags('Categories')` beserta `@ApiOperation` dan anotasi response. Response sukses memakai decorator envelope `@ApiOkData(CategoryResponseDto)` / `@ApiCreatedData(CategoryResponseDto)`, sedangkan response error (`@ApiNotFoundResponse`, `@ApiConflictResponse`) memakai `type: ErrorResponseDto` — sehingga bentuk `{ success, data }` dan skema error tampil akurat di Swagger UI (`/docs`).
- **Endpoint tulis dibatasi role `ADMIN`** (`POST`, `PATCH`, `DELETE`) via `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles(UserRole.ADMIN)`, terdokumentasi di Swagger dengan `@ApiCookieAuth()` + `@ApiForbiddenResponse()`. Endpoint `GET` tetap publik.
- Kolom `isActive` di model `Category` sudah ada di database namun belum bisa di-set/diubah lewat DTO manapun — kategori baru selalu `isActive: true`.
