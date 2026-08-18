# Fitur: Menu (Menus)

Module: [src/modules/menus](../../src/modules/menus)

CRUD penuh untuk item menu. Setiap item menu wajib terhubung ke satu `Category` yang sudah ada.

## Endpoint

| Method | Path | Auth | Deskripsi |
| ------ | ---- | :--: | --------- |
| `POST`   | `/api/v1/menus` | 🔒 ADMIN | Buat menu baru |
| `GET`    | `/api/v1/menus` | Publik | Daftar semua menu (opsional `?search=`) |
| `GET`    | `/api/v1/menus/:id` | Publik | Detail satu menu |
| `PATCH`  | `/api/v1/menus/:id` | 🔒 ADMIN | Update menu |
| `DELETE` | `/api/v1/menus/:id` | 🔒 ADMIN | Hapus menu |

> 🔒 ADMIN = butuh login **dan** role `ADMIN` (`JwtAuthGuard` + `RolesGuard` + `@Roles(UserRole.ADMIN)`). Tanpa login → `401`, login non-ADMIN → `403 Forbidden`. Endpoint `GET` tetap publik.

Setiap response menu (single maupun list) menyertakan relasi `category` secara penuh (`include: { category: true }`).

### `POST /api/v1/menus` — Buat Menu

**Request body** ([CreateMenuDto](../../src/modules/menus/dto/create-menu.dto.ts)):

```json
{
  "categoryId": 1,
  "name": "Nasi Goreng Spesial",
  "description": "Nasi Goreng dengan telur dan ayam spesial",
  "price": 25000,
  "imageUrl": "https://example.com/nasi-goreng.jpg",
  "stock": 10
}
```

| Field | Tipe | Validasi |
| ----- | ---- | -------- |
| `categoryId` | `number` | wajib, integer, minimal `1`, kategori harus sudah ada |
| `name` | `string` | wajib, tidak boleh kosong, maksimal 255 karakter |
| `description` | `string` | opsional |
| `price` | `number` | wajib, integer, minimal `0` |
| `imageUrl` | `string` | opsional, harus URL valid |
| `stock` | `number` | wajib, integer, minimal `0` |

**Response `201 Created`**:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "categoryId": 1,
    "name": "Nasi Goreng Spesial",
    "description": "Nasi Goreng dengan telur dan ayam spesial",
    "price": "25000.00",
    "imageUrl": "https://example.com/nasi-goreng.jpg",
    "stock": 10,
    "isActive": true,
    "createdAt": "2026-08-13T02:00:00.000Z",
    "updatedAt": "2026-08-13T02:00:00.000Z",
    "category": {
      "id": 1,
      "name": "Makanan",
      "isActive": true,
      "createdAt": "...",
      "updatedAt": "..."
    }
  }
}
```

> `price` dikembalikan Prisma sebagai `Decimal` (`"25000.00"`, dalam bentuk string setelah serialize JSON) meskipun request mengirim `number`.

**Response `404 Not Found`** — `categoryId` tidak ditemukan:

```json
{
  "success": false,
  "statusCode": 404,
  "error": "Not Found",
  "message": "Category not found",
  "path": "/api/v1/menus",
  "timestamp": "2026-08-14T02:00:00.000Z"
}
```

### `GET /api/v1/menus` — Daftar Menu

**Query params** ([SearchMenuDto](../../src/modules/menus/dto/query-menu.dto.ts)):

| Param | Tipe | Wajib | Deskripsi |
| ----- | ---- | :---: | --------- |
| `search` | `string` | tidak | Cari menu yang `name` **atau** `description`-nya mengandung kata kunci (case-insensitive). |

Contoh: `GET /api/v1/menus?search=kopi`.

**Response `200 OK`** — array menu (shape sama seperti response create), diurutkan dari yang terbaru (`createdAt` descending). Tanpa `search`, seluruh menu dikembalikan. **Belum ada pagination** — hasil filter tidak dipotong per halaman.

### `GET /api/v1/menus/:id` — Detail Menu

**Response `200 OK`** — shape sama seperti response create.

**Response `404 Not Found`**:

```json
{
  "success": false,
  "statusCode": 404,
  "error": "Not Found",
  "message": "Menu not found",
  "path": "/api/v1/menus/99",
  "timestamp": "2026-08-14T02:00:00.000Z"
}
```

### `PATCH /api/v1/menus/:id` — Update Menu

**Request body** ([UpdateMenuDto](../../src/modules/menus/dto/update-menu.dto.ts) — semua field `CreateMenuDto` menjadi opsional, kirim hanya field yang ingin diubah):

```json
{
  "price": 27000,
  "stock": 5
}
```

**Response `200 OK`** — menu setelah diupdate (termasuk `category` ter-refresh jika `categoryId` diubah).

**Error**: `404 Not Found` jika menu tidak ada **atau** jika `categoryId` baru tidak ditemukan.

### `DELETE /api/v1/menus/:id` — Hapus Menu

**Response `200 OK`** — mengembalikan data menu yang baru saja dihapus.

**Response `404 Not Found`** — menu tidak ada.

## Business Rules

- **Kategori wajib valid**: saat create maupun update (jika `categoryId` dikirim), `MenusService` mengecek `CategoriesRepository.findById` terlebih dulu — jika tidak ada, melempar `404 Not Found` ("Category not found") **sebelum** menyentuh tabel menu.
- **Update bersifat partial**: `MenusService.update` hanya menyertakan field yang benar-benar dikirim (`!== undefined`) ke Prisma, sehingga field yang tidak dikirim di body tidak ikut ter-overwrite dengan `undefined`.
- `findOne` (dipakai internal oleh `update`/`remove`) melempar `404 Not Found` jika menu tidak ditemukan.

## Implementasi Teknis

| File | Peran |
| ---- | ----- |
| [menus.controller.ts](../../src/modules/menus/menus.controller.ts) | Routing CRUD |
| [menus.service.ts](../../src/modules/menus/menus.service.ts) | Validasi `categoryId`, business logic |
| [menus.repository.ts](../../src/modules/menus/menus.repository.ts) | Query Prisma (selalu `include: { category: true }`) |
| [dto/create-menu.dto.ts](../../src/modules/menus/dto/create-menu.dto.ts) | Validasi request create |
| [dto/update-menu.dto.ts](../../src/modules/menus/dto/update-menu.dto.ts) | `PartialType(CreateMenuDto)` |
| [dto/query-menu.dto.ts](../../src/modules/menus/dto/query-menu.dto.ts) | `SearchMenuDto` — query param `search` (opsional) untuk `GET /menus`, sekaligus mendokumentasikan param di Swagger |
| [dto/menu-response.dto.ts](../../src/modules/menus/dto/menu-response.dto.ts) | Shape response (termasuk relasi `category`) untuk dokumentasi Swagger via `@ApiOkData`/`@ApiCreatedData` |

`MenusModule` meng-import `CategoriesModule` agar `CategoriesRepository` bisa di-inject ke `MenusService` untuk validasi relasi ([menus.module.ts](../../src/modules/menus/menus.module.ts)).

## Catatan & Batasan Saat Ini

- Controller ini sudah memiliki `@ApiTags('Menus')` beserta `@ApiOperation`. Response sukses memakai `@ApiOkData(MenuResponseDto)` / `@ApiCreatedData(MenuResponseDto)` dan response error memakai `type: ErrorResponseDto`, sehingga bentuk envelope `{ success, data }` dan skema error tampil akurat di Swagger UI (`/docs`).
- **Endpoint tulis dibatasi role `ADMIN`** (`POST`, `PATCH`, `DELETE`) via `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles(UserRole.ADMIN)`, didokumentasikan di Swagger dengan `@ApiCookieAuth()` + `@ApiForbiddenResponse()`. Endpoint `GET` tetap publik.
- **Pencarian sudah ada, pagination belum**: `GET /api/v1/menus` menerima query `?search=` (lihat [SearchMenuDto](../../src/modules/menus/dto/query-menu.dto.ts)) untuk memfilter berdasarkan `name`/`description`, tetapi hasilnya belum dipotong per halaman — kandidat pengembangan berikutnya: `?categoryId=`, `?page=&limit=`.
- `menu-response.dto.ts` kini **sudah terisi dan dipakai** untuk mendokumentasikan bentuk response di Swagger. Perlu dicatat: DTO ini hanya untuk **dokumentasi** — response runtime tetap hasil mentah Prisma (tidak ada transformasi/serialization ulang), sehingga field seperti `isActive` tetap ikut terkirim apa adanya.
- Validasi stok kini dilakukan oleh module [`orders`](orders.md) saat pesanan dibuat (`stock` menu dicek lalu di-`decrement` dalam satu transaksi), bukan oleh module `menus` itu sendiri. Namun endpoint `menus` di sini masih membolehkan `stock` diubah bebas via `PATCH` tanpa memperhitungkan pesanan berjalan.

## Riwayat

Module ini sebelumnya bernama `products` (`/api/v1/products`, model Prisma `Product`, kolom `OrderItem.productId`). Di-rename menjadi `menus` pada 2026-08-18 — termasuk migration database [`20260818120000_rename_product_to_menu`](../../prisma/migrations/20260818120000_rename_product_to_menu/migration.sql) yang me-*rename* tabel/kolom tanpa kehilangan data.
