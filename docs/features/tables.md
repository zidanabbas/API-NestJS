# Fitur: Meja (Tables)

Module: [src/modules/tables](../../src/modules/tables)

CRUD meja fisik untuk pesanan dine-in. Setiap meja punya `code` unik (dirancang untuk di-encode sebagai QR code yang ditempel di meja) dan `number` unik (nomor urut internal untuk staff). Order yang dibuat lewat scan QR meja akan otomatis terhubung ke meja tersebut lewat field `tableCode` — lihat [features/orders.md](orders.md#pengaitan-meja-tablecode).

## Endpoint

| Method   | Path                      |   Auth    | Deskripsi                        |
| -------- | ------------------------- | :-------: | --------------------------------- |
| `POST`   | `/api/v1/tables`          | Publik ⚠️ | Buat meja baru                    |
| `GET`    | `/api/v1/tables`          |  Publik   | Daftar semua meja                 |
| `GET`    | `/api/v1/tables/code/:code` | Publik  | Detail meja berdasarkan kode QR   |
| `GET`    | `/api/v1/tables/:id`      |  Publik   | Detail satu meja (by ID)          |
| `PATCH`  | `/api/v1/tables/:id`      | Publik ⚠️ | Update meja                       |
| `DELETE` | `/api/v1/tables/:id`      | Publik ⚠️ | Hapus meja                        |

> ⚠️ Sama seperti `categories`/`products`, endpoint tulis (create/update/delete) **tidak** dilindungi login/role apa pun.

> Route `GET /tables/code/:code` sengaja didaftarkan **sebelum** `GET /tables/:id` di controller — urutan ini penting di NestJS agar `/tables/code/a8f3x9` tidak tertangkap oleh route `:id` (yang lagipula akan gagal karena `ParseIntPipe` menolak nilai non-angka).

### `POST /api/v1/tables` — Buat Meja

**Request body** ([CreateTableDto](../../src/modules/tables/dto/create-table.dto.ts)):

```json
{
  "name": "Meja 01",
  "number": 1
}
```

| Field    | Tipe     | Validasi                                                              |
| -------- | -------- | ----------------------------------------------------------------------- |
| `name`   | `string` | wajib, tidak boleh kosong                                              |
| `number` | `number` | **opsional**, integer, minimal `1`. Jika tidak dikirim, di-auto-increment oleh server (lihat [Business Rules](#business-rules)) |

> `code` **tidak** ada di request body — selalu di-generate otomatis oleh server, tidak pernah diinput manual (lihat [Business Rules](#business-rules)).

**Response `201 Created`** ([TableResponseDto](../../src/modules/tables/dto/table-response.dto.ts)):

```json
{
  "success": true,
  "data": {
    "id": 1,
    "code": "A8F3X9",
    "number": 1,
    "name": "Meja 01",
    "isActive": true,
    "createdAt": "2026-08-14T09:22:13.000Z",
    "updatedAt": "2026-08-14T09:22:13.000Z"
  }
}
```

**Response `409 Conflict`** — `number` yang dikirim sudah dipakai meja lain:

```json
{
  "success": false,
  "statusCode": 409,
  "error": "Conflict",
  "message": "Table number already in use",
  "path": "/api/v1/tables",
  "timestamp": "2026-08-14T02:00:00.000Z"
}
```

### `GET /api/v1/tables` — Daftar Meja

**Response `200 OK`** — array meja (shape sama seperti response create), diurutkan dari yang terbaru (`createdAt` descending).

### `GET /api/v1/tables/code/:code` — Detail Meja by Kode QR

Dipakai frontend saat customer scan QR yang ditempel di meja, untuk resolve `code` dari parameter URL menjadi detail meja (mis. tampilkan nama meja sebelum checkout).

**Response `200 OK`** — shape sama seperti response create.

**Response `404 Not Found`** — kode tidak ditemukan:

```json
{
  "success": false,
  "statusCode": 404,
  "error": "Not Found",
  "message": "Table not found",
  "path": "/api/v1/tables/code/xxxxxx",
  "timestamp": "2026-08-14T02:00:00.000Z"
}
```

### `GET /api/v1/tables/:id` — Detail Meja by ID

**Response `200 OK`** — shape sama seperti response create.

**Response `404 Not Found`** — `id` tidak ada (pesan sama seperti di atas: `"Table not found"`).

### `PATCH /api/v1/tables/:id` — Update Meja

**Request body** ([UpdateTableDto](../../src/modules/tables/dto/update-table.dto.ts) — `PartialType(CreateTableDto)`, kirim hanya field yang ingin diubah):

```json
{
  "name": "Meja VIP 1"
}
```

**Response `200 OK`** — meja setelah diupdate.

**Error**: `404 Not Found` jika `id` tidak ada, `409 Conflict` jika `number` baru sudah dipakai meja **lain**.

### `DELETE /api/v1/tables/:id` — Hapus Meja

**Response `200 OK`** — mengembalikan data meja yang baru saja dihapus.

**Response `404 Not Found`** — `id` tidak ada.

**Response `409 Conflict`** — meja masih memiliki order:

```json
{
  "success": false,
  "statusCode": 409,
  "error": "Conflict",
  "message": "Table still has orders and cannot be deleted",
  "path": "/api/v1/tables/1",
  "timestamp": "2026-08-14T02:00:00.000Z"
}
```

## Business Rules

- **`code` selalu digenerate otomatis** ([tables.service.ts](../../src/modules/tables/tables.service.ts), `generateUniqueCode()`) — string random 6 karakter (`Math.random().toString(36)`, uppercase), di-retry sampai tidak collision dengan kode yang sudah ada (`findByCode`). Tidak pernah diinput manual lewat DTO. String inilah yang dimaksudkan untuk di-embed ke URL QR code yang dicetak/ditempel di meja fisik.
- **`number` auto-increment jika tidak dikirim** (`resolveNumber()`) — ambil `number` tertinggi yang ada (`findLastByNumber`), lalu `+1`. Jika `number` dikirim eksplisit, dicek dulu keunikannya (`findByNumber`) — konflik → `409 Conflict`.
- **Proteksi hapus**: meja tidak bisa dihapus jika masih punya order (`TablesRepository.countOrders`), sama seperti proteksi hapus di [categories](categories.md#business-rules) terhadap produk.
- `findOne`/`findByCode` (dipakai internal oleh `update`/`remove`, dan juga diekspos sebagai endpoint) melempar `404 Not Found` jika meja tidak ditemukan.

## Implementasi Teknis

| File                                                                          | Peran                                                                                   |
| ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| [tables.controller.ts](../../src/modules/tables/tables.controller.ts)         | Routing CRUD + `GET /code/:code`                                                        |
| [tables.service.ts](../../src/modules/tables/tables.service.ts)               | Generate `code` unik, auto-increment `number`, validasi konflik, proteksi hapus         |
| [tables.repository.ts](../../src/modules/tables/tables.repository.ts)         | Query Prisma (`create`, `findAll`, `findById`, `findByCode`, `findByNumber`, `findLastByNumber`, `update`, `delete`, `countOrders`) |
| [dto/create-table.dto.ts](../../src/modules/tables/dto/create-table.dto.ts)   | Validasi request create (`name` wajib, `number` opsional; `code` tidak ada di DTO)      |
| [dto/update-table.dto.ts](../../src/modules/tables/dto/update-table.dto.ts)   | `PartialType(CreateTableDto)`                                                           |
| [dto/table-response.dto.ts](../../src/modules/tables/dto/table-response.dto.ts) | Shape response untuk dokumentasi Swagger (`@ApiOkData`/`@ApiCreatedData`)              |

`TablesModule` meng-`exports` `TablesService` dan `TablesRepository` ([tables.module.ts](../../src/modules/tables/tables.module.ts)) karena `OrdersModule` meng-import-nya untuk resolve `tableCode` → `tableId` saat membuat order — lihat [features/orders.md](orders.md#pengaitan-meja-tablecode).

## Catatan & Batasan Saat Ini

- **Tidak ada guard autentikasi** pada endpoint tulis — siapa pun bisa membuat/mengubah/menghapus meja tanpa login, sama seperti `categories` dan `products`.
- **Belum ada endpoint generate/unduh gambar QR** — module ini hanya menyediakan `code` sebagai string; encoding jadi gambar QR (dan embed `code` ke URL frontend) jadi tanggung jawab sisi frontend/aplikasi lain, bukan bagian dari API ini.
- **`code` di-generate dengan `Math.random()`** (bukan CSPRNG) — cukup untuk kebutuhan saat ini (identifier meja, bukan token keamanan kritis), tapi bukan pilihan kriptografis yang kuat bila suatu saat dipakai untuk hal yang lebih sensitif.
