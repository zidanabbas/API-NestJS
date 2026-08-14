# Fitur: Produk (Products)

Module: [src/modules/products](../../src/modules/products)

CRUD penuh untuk produk. Setiap produk wajib terhubung ke satu `Category` yang sudah ada.

## Endpoint

| Method | Path | Auth | Deskripsi |
| ------ | ---- | :--: | --------- |
| `POST`   | `/api/v1/products` | Publik ⚠️ | Buat produk baru |
| `GET`    | `/api/v1/products` | Publik | Daftar semua produk |
| `GET`    | `/api/v1/products/:id` | Publik | Detail satu produk |
| `PATCH`  | `/api/v1/products/:id` | Publik ⚠️ | Update produk |
| `DELETE` | `/api/v1/products/:id` | Publik ⚠️ | Hapus produk |

> ⚠️ Lihat [Catatan & Batasan](#catatan--batasan-saat-ini) — endpoint tulis (create/update/delete) saat ini **tidak** dilindungi login/role apa pun.

Setiap response produk (single maupun list) menyertakan relasi `category` secara penuh (`include: { category: true }`).

### `POST /api/v1/products` — Buat Produk

**Request body** ([CreateProductDto](../../src/modules/products/dto/create-product.dto.ts)):

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
  "path": "/api/v1/products",
  "timestamp": "2026-08-14T02:00:00.000Z"
}
```

### `GET /api/v1/products` — Daftar Produk

**Response `200 OK`** — array produk (shape sama seperti response create), diurutkan dari yang terbaru (`createdAt` descending). **Belum ada filter, pencarian, atau pagination** — selalu mengembalikan seluruh produk.

### `GET /api/v1/products/:id` — Detail Produk

**Response `200 OK`** — shape sama seperti response create.

**Response `404 Not Found`**:

```json
{
  "success": false,
  "statusCode": 404,
  "error": "Not Found",
  "message": "Product not found",
  "path": "/api/v1/products/99",
  "timestamp": "2026-08-14T02:00:00.000Z"
}
```

### `PATCH /api/v1/products/:id` — Update Produk

**Request body** ([UpdateProductDto](../../src/modules/products/dto/update-product.dto.ts) — semua field `CreateProductDto` menjadi opsional, kirim hanya field yang ingin diubah):

```json
{
  "price": 27000,
  "stock": 5
}
```

**Response `200 OK`** — produk setelah diupdate (termasuk `category` ter-refresh jika `categoryId` diubah).

**Error**: `404 Not Found` jika produk tidak ada **atau** jika `categoryId` baru tidak ditemukan.

### `DELETE /api/v1/products/:id` — Hapus Produk

**Response `200 OK`** — mengembalikan data produk yang baru saja dihapus.

**Response `404 Not Found`** — produk tidak ada.

## Business Rules

- **Kategori wajib valid**: saat create maupun update (jika `categoryId` dikirim), `ProductsService` mengecek `CategoriesRepository.findById` terlebih dulu — jika tidak ada, melempar `404 Not Found` ("Category not found") **sebelum** menyentuh tabel produk.
- **Update bersifat partial**: `ProductsService.update` hanya menyertakan field yang benar-benar dikirim (`!== undefined`) ke Prisma, sehingga field yang tidak dikirim di body tidak ikut ter-overwrite dengan `undefined`.
- `findOne` (dipakai internal oleh `update`/`remove`) melempar `404 Not Found` jika produk tidak ditemukan.

## Implementasi Teknis

| File | Peran |
| ---- | ----- |
| [products.controller.ts](../../src/modules/products/products.controller.ts) | Routing CRUD |
| [products.service.ts](../../src/modules/products/products.service.ts) | Validasi `categoryId`, business logic |
| [products.repository.ts](../../src/modules/products/products.repository.ts) | Query Prisma (selalu `include: { category: true }`) |
| [dto/create-product.dto.ts](../../src/modules/products/dto/create-product.dto.ts) | Validasi request create |
| [dto/update-product.dto.ts](../../src/modules/products/dto/update-product.dto.ts) | `PartialType(CreateProductDto)` |
| [dto/query-product.dto.ts](../../src/modules/products/dto/query-product.dto.ts) | **Kosong** — placeholder untuk query filter/pagination di masa depan, belum diimplementasikan/dipakai |
| [dto/product-response.dto.ts](../../src/modules/products/dto/product-response.dto.ts) | Shape response (termasuk relasi `category`) untuk dokumentasi Swagger via `@ApiOkData`/`@ApiCreatedData` |

`ProductsModule` meng-import `CategoriesModule` agar `CategoriesRepository` bisa di-inject ke `ProductsService` untuk validasi relasi ([products.module.ts](../../src/modules/products/products.module.ts)).

## Catatan & Batasan Saat Ini

- Controller ini sudah memiliki `@ApiTags('Products')` beserta `@ApiOperation`. Response sukses memakai `@ApiOkData(ProductResponseDto)` / `@ApiCreatedData(ProductResponseDto)` dan response error memakai `type: ErrorResponseDto`, sehingga bentuk envelope `{ success, data }` dan skema error tampil akurat di Swagger UI (`/docs`).
- **Tidak ada guard autentikasi** pada endpoint tulis (`POST`, `PATCH`, `DELETE`) — sama seperti [categories](categories.md), siapa pun bisa mengubah data produk tanpa login.
- **Belum ada filter/pagination**: `GET /api/v1/products` selalu mengembalikan seluruh baris. File [`query-product.dto.ts`](../../src/modules/products/dto/query-product.dto.ts) sudah disiapkan namanya tapi isinya masih kosong — kandidat kuat untuk menambahkan query seperti `?categoryId=`, `?search=`, `?page=&limit=`.
- `product-response.dto.ts` kini **sudah terisi dan dipakai** untuk mendokumentasikan bentuk response di Swagger. Perlu dicatat: DTO ini hanya untuk **dokumentasi** — response runtime tetap hasil mentah Prisma (tidak ada transformasi/serialization ulang), sehingga field seperti `isActive` tetap ikut terkirim apa adanya.
- Validasi stok kini dilakukan oleh module [`orders`](orders.md) saat pesanan dibuat (`stock` produk dicek lalu di-`decrement` dalam satu transaksi), bukan oleh module `products` itu sendiri. Namun endpoint `products` di sini masih membolehkan `stock` diubah bebas via `PATCH` tanpa memperhitungkan pesanan berjalan.
