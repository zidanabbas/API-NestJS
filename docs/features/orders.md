# Fitur: Pesanan (Orders)

Module: [src/modules/orders](../../src/modules/orders)

Membuat dan membaca pesanan. Membuat order adalah operasi **multi-langkah** yang dijalankan dalam satu **transaksi database** (`prisma.$transaction`): validasi tiap menu, hitung total, buat `Order` + `OrderItem`, lalu kurangi `stock` menu. Jika salah satu langkah gagal, **seluruh** perubahan dibatalkan (all-or-nothing).

## Endpoint

| Method  | Path                        |   Auth   | Deskripsi                                         |
| ------- | --------------------------- | :------: | ------------------------------------------------- |
| `POST`  | `/api/v1/orders`            |  Publik  | Buat pesanan baru dengan itemnya (guest checkout) |
| `GET`   | `/api/v1/orders`            |   🔒     | Daftar semua pesanan                              |
| `GET`   | `/api/v1/orders/:id`        |  Publik  | Detail satu pesanan                               |
| `PATCH` | `/api/v1/orders/:id/status` | 🔒 ADMIN | Ubah status pesanan (state machine)               |

> **Auth:** `POST` sengaja **publik** — pelanggan memesan tanpa akun (model *guest checkout*). `GET /orders` (daftar semua) butuh **login** (`JwtAuthGuard`). `PATCH /:id/status` khusus **ADMIN**. `GET /orders/:id` saat ini belum diberi guard — lihat [Catatan & Batasan](#catatan--batasan-saat-ini).

Setiap response order menyertakan relasi `items` (masing-masing dengan `menu` lengkap) dan `table` (`null` bila order tanpa meja). Endpoint detail (`GET /:id`) juga menyertakan relasi `payment`.

### `POST /api/v1/orders` — Buat Pesanan

**Request body** ([CreateOrderDto](../../src/modules/orders/dto/create-order.dto.ts)):

```json
{
  "customerName": "Zidane Abbas",
  "customerPhone": "08123456789",
  "tableCode": "A8F3X9",
  "items": [
    { "menuId": 1, "quantity": 2 },
    { "menuId": 2, "quantity": 1 }
  ]
}
```

| Field              | Tipe     | Validasi                                                                                                             |
| ------------------ | -------- | -------------------------------------------------------------------------------------------------------------------- |
| `customerName`     | `string` | wajib, tidak boleh kosong                                                                                            |
| `customerPhone`    | `string` | wajib, tidak boleh kosong                                                                                            |
| `tableCode`        | `string` | **opsional**, tidak boleh string kosong bila dikirim. Lihat [Pengaitan Meja](#pengaitan-meja-tablecode)              |
| `items`            | `array`  | wajib, minimal 1 item, tiap elemen divalidasi ([CreateOrderItemDto](../../src/modules/orders/dto/order-item.dto.ts)) |
| `items[].menuId`   | `number` | wajib, integer, minimal `1`                                                                                          |
| `items[].quantity` | `number` | wajib, integer, minimal `1`                                                                                          |

**Response `201 Created`** — order yang baru dibuat beserta item-nya:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "orderNumber": "ORD-1755140400000-482",
    "customerName": "Zidane Abbas",
    "customerPhone": "08123456789",
    "totalAmount": "60000",
    "status": "PENDING",
    "table": {
      "id": 1,
      "code": "A8F3X9",
      "number": 1,
      "name": "Meja 01",
      "isActive": true,
      "createdAt": "...",
      "updatedAt": "..."
    },
    "createdAt": "2026-08-14T02:00:00.000Z",
    "updatedAt": "2026-08-14T02:00:00.000Z",
    "items": [
      {
        "id": 1,
        "orderId": 1,
        "menuId": 1,
        "quantity": 2,
        "price": "25000.00",
        "subtotal": "50000",
        "menu": {
          "id": 1,
          "categoryId": 1,
          "name": "Nasi Goreng Spesial",
          "description": "Nasi Goreng dengan telur dan ayam spesial",
          "price": "25000.00",
          "imageUrl": "https://example.com/nasi-goreng.jpg",
          "stock": 8,
          "isActive": true,
          "createdAt": "...",
          "updatedAt": "..."
        }
      }
    ]
  }
}
```

Beberapa hal penting pada response ini:

- **`orderNumber`** di-generate otomatis oleh server dengan format `ORD-<timestamp>-<random 0–999>` (`OrdersService.generateOrderNumber`). Tidak dikirim oleh client.
- **`status`** tidak dikirim client dan tidak di-set eksplisit — otomatis memakai default skema, yaitu `PENDING`.
- **`price`** pada tiap item adalah **snapshot** harga menu saat order dibuat (diambil dari `menu.price`), agar total tidak berubah jika harga menu diubah di kemudian hari.
- **`subtotal`** = `price × quantity`; **`totalAmount`** = jumlah seluruh `subtotal`.
- Nilai `Decimal` (mis. `price`, `subtotal`, `totalAmount`) diserialisasi JSON sebagai **string**.
- **`stock`** menu pada response sudah berkurang sesuai `quantity` yang dipesan.
- **`table`** berisi detail meja jika `tableCode` dikirim & valid, atau `null` jika `tableCode` tidak dikirim (order tanpa meja). Lihat [Pengaitan Meja](#pengaitan-meja-tablecode).

**Response `404 Not Found`** — `tableCode` dikirim tapi tidak ditemukan:

```json
{
  "success": false,
  "statusCode": 404,
  "error": "Not Found",
  "message": "Table with code xxxxxx not found",
  "path": "/api/v1/orders",
  "timestamp": "2026-08-14T02:00:00.000Z"
}
```

**Response `404 Not Found`** — salah satu `menuId` tidak ada:

```json
{
  "success": false,
  "statusCode": 404,
  "error": "Not Found",
  "message": "Menu 99 not found",
  "path": "/api/v1/orders",
  "timestamp": "2026-08-14T02:00:00.000Z"
}
```

**Response `400 Bad Request`** — menu nonaktif atau stok kurang:

```json
{
  "success": false,
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Insufficient stock for Nasi Goreng Spesial",
  "path": "/api/v1/orders",
  "timestamp": "2026-08-14T02:00:00.000Z"
}
```

> Pesan lain yang mungkin muncul: `"<nama menu> is not available"` (menu `isActive: false`). Karena semua langkah berada dalam satu transaksi, kegagalan validasi item ke-2 **tidak** akan menyisakan order setengah jadi atau stok yang terlanjur berkurang.

### `GET /api/v1/orders` — Daftar Pesanan

**Response `200 OK`** — array order (shape sama seperti response create, lengkap dengan `items` & `menu`). **Belum ada urutan eksplisit, filter, atau pagination** — selalu mengembalikan seluruh order.

### `GET /api/v1/orders/:id` — Detail Pesanan

**Response `200 OK`** — satu order lengkap dengan `items` (beserta `menu`) **dan** relasi `payment` (bernilai `null` bila belum ada pembayaran).

**Response `404 Not Found`**:

```json
{
  "success": false,
  "statusCode": 404,
  "error": "Not Found",
  "message": "Order not found",
  "path": "/api/v1/orders/99",
  "timestamp": "2026-08-14T02:00:00.000Z"
}
```

### `PATCH /api/v1/orders/:id/status` 🔒 ADMIN — Ubah Status Pesanan

Mengubah status pesanan mengikuti **state machine** yang ketat — admin tidak bisa melompati atau memundurkan status sembarangan.

**Alur transisi yang diizinkan** ([order-status.constant.ts](../../src/modules/orders/constants/order-status.constant.ts)):

```
PENDING → CONFIRMED → PREPARING → READY → COMPLETED
   ↓          ↓
CANCELLED  CANCELLED
```

| Dari status | Boleh pindah ke |
| ----------- | --------------- |
| `PENDING` | `CONFIRMED`, `CANCELLED` |
| `CONFIRMED` | `PREPARING`, `CANCELLED` |
| `PREPARING` | `READY` |
| `READY` | `COMPLETED` |
| `COMPLETED` | — (final) |
| `CANCELLED` | — (final) |

**Request body** ([UpdateOrderStatusDto](../../src/modules/orders/dto/update-order.dto.ts)):

```json
{ "status": "CONFIRMED" }
```

| Field | Tipe | Validasi |
| ----- | ---- | -------- |
| `status` | `OrderStatus` | wajib, salah satu nilai enum (`@IsEnum`) |

**Response `200 OK`** — order setelah update, lengkap dengan `items` (beserta `menu`) dan `table`.

**Response `400 Bad Request`** — transisi tidak diizinkan atau status sudah sama:

```json
{
  "success": false,
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Cannot change status from PENDING to COMPLETED",
  "path": "/api/v1/orders/1/status",
  "timestamp": "2026-08-18T02:00:00.000Z"
}
```

**Response `403 Forbidden`** — pelaku bukan `ADMIN`. **Response `404 Not Found`** — order tidak ada.

> Validasi transisi ada di `OrdersService.updateStatus` lewat helper `canTransition(from, to)` — aturan state machine (data) dipisah dari logika orkestrasi (service), lihat [Implementasi Teknis](#implementasi-teknis).

## Pengaitan Meja (`tableCode`)

Order bisa opsional dikaitkan ke meja fisik (dine-in) lewat field `tableCode` di request body:

- **QR ditempel di meja** — QR tersebut meng-encode `Table.code` ke dalam URL (mis. `https://order.app/menu?table=A8F3X9`). Frontend membaca parameter `table` dari URL saat halaman dibuka, lalu mengirimkannya sebagai `tableCode` di body `POST /orders`.
- **QR menu umum** (tidak spesifik ke satu meja, mis. ditempel di dinding/kasir) — URL-nya tidak punya parameter kode meja, sehingga frontend mengirim `tableCode` kosong/tidak dikirim sama sekali. Order tetap berhasil dibuat, hanya saja `table` pada response bernilai `null`.

Di sisi server ([orders.service.ts](../../src/modules/orders/orders.service.ts), `resolveTableId`), sebelum transaksi dimulai:

1. Jika `tableCode` tidak dikirim (`undefined`/falsy) → `tableId` diset `undefined`, order dibuat tanpa meja.
2. Jika `tableCode` dikirim → dicari lewat `TablesRepository.findByCode`. Tidak ditemukan → `404 Not Found` (`"Table with code <kode> not found"`), order **tidak jadi dibuat**.
3. Jika ditemukan → `tableId` di-`connect` ke relasi `table` saat `Order` dibuat.

Pencarian meja ini dilakukan **di luar** `prisma.$transaction` (murni operasi baca, tidak butuh dikunci bersama transaksi tulis stok/order) — lihat [Implementasi Teknis](#implementasi-teknis). Detail module meja itu sendiri ada di [features/tables.md](tables.md).

## Business Rules

Seluruh aturan berikut dijalankan **di dalam satu transaksi** ([orders.service.ts](../../src/modules/orders/orders.service.ts)) saat `POST /orders`, kecuali resolusi `tableCode` yang dijalankan sebelum transaksi (lihat [Pengaitan Meja](#pengaitan-meja-tablecode)):

1. **Meja harus valid (jika dikirim)** — `tableCode` di-resolve ke `tableId` lewat `TablesRepository.findByCode`; tidak ditemukan → `404 Not Found` (`"Table with code <kode> not found"`).
2. **Menu harus ada** — tiap `menuId` dicari via `tx.menu.findUnique`; jika tidak ada → `404 Not Found` (`"Menu <id> not found"`).
3. **Menu harus aktif** — jika `menu.isActive === false` → `400 Bad Request` (`"<nama> is not available"`).
4. **Stok harus cukup** — jika `menu.stock < quantity` → `400 Bad Request` (`"Insufficient stock for <nama>"`).
5. **Hitung harga** — `price` disnapshot dari menu, `subtotal = price × quantity`, `totalAmount` diakumulasi dari seluruh item.
6. **Buat order + item** — `Order` dibuat beserta `OrderItem` (nested `create`) dan `table` (nested `connect`, jika ada) dalam satu operasi.
7. **Kurangi stok (bersyarat/atomik)** — untuk tiap item dilakukan `menu.updateMany({ where: { id, stock: { gte: quantity } }, data: { decrement } })`. Jika `count === 0` (stok keburu habis oleh order lain), lempar `400 Bad Request` — cek-dan-kurang jadi satu operasi atomik untuk mencegah oversell saat order berbarengan.

Jika langkah mana pun melempar error, transaksi otomatis **rollback** — tidak ada order, item, maupun perubahan stok yang tersimpan.

Selain pembuatan order, `OrdersService.updateStatus` menegakkan **state machine** transisi status (lihat [PATCH /:id/status](#patch-apiv1ordersidstatus--admin--ubah-status-pesanan)) — transisi ilegal ditolak `400 Bad Request`.

## Implementasi Teknis

| File                                                                            | Peran                                                                                                                |
| ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| [orders.controller.ts](../../src/modules/orders/orders.controller.ts)           | Routing `POST` / `GET` / `GET :id` / `PATCH :id/status`                                                              |
| [orders.service.ts](../../src/modules/orders/orders.service.ts)                 | Orkestrasi transaksi, validasi item, hitung total, generate `orderNumber`, resolve `tableCode` → `tableId`, `updateStatus` (state machine) |
| [orders.repository.ts](../../src/modules/orders/orders.repository.ts)           | Query Prisma (`create` menerima `tx`, `findAll`, `findById`, `updateStatus`; `updateStatus` juga `include: { items, table }`) |
| [constants/order-status.constant.ts](../../src/modules/orders/constants/order-status.constant.ts) | Peta transisi `ORDER_STATUS_TRANSITIONS` + helper murni `canTransition(from, to)` |
| [dto/update-order.dto.ts](../../src/modules/orders/dto/update-order.dto.ts)     | `UpdateOrderStatusDto` — validasi `status` (`@IsEnum(OrderStatus)`)                                                  |
| [dto/create-order.dto.ts](../../src/modules/orders/dto/create-order.dto.ts)     | Validasi request create (termasuk nested `items`, `tableCode` opsional)                                              |
| [dto/order-item.dto.ts](../../src/modules/orders/dto/order-item.dto.ts)         | Validasi tiap elemen `items` (`menuId`, `quantity`)                                                                  |
| [dto/order-response.dto.ts](../../src/modules/orders/dto/order-response.dto.ts) | Shape response (`OrderResponseDto`, `OrderItemResponseDto`, `PaymentResponseDto`) untuk dokumentasi Swagger          |

Catatan implementasi:

- **`OrdersService` meng-inject `PrismaService` langsung** (selain `OrdersRepository`) karena transaksi membaca/menulis beberapa tabel (`menu`, `order`) sekaligus. Ini pengecualian sadar terhadap aturan "hanya repository yang menyentuh database" demi menjaga semua operasi dalam satu `$transaction`.
- **`OrdersRepository.create` menerima `tx: Prisma.TransactionClient`** sebagai argumen pertama, sehingga penulisan order ikut dalam transaksi yang sama dengan pengurangan stok.
- **`OrdersService` juga meng-inject `TablesRepository`** untuk `resolveTableId(tableCode)` — lookup `Table` by `code` dijalankan **sebelum** `$transaction` dimulai (operasi baca murni, tidak perlu ikut dikunci dalam transaksi tulis).
- **Validasi nested array** memakai `@ValidateNested({ each: true })` + `@Type(() => CreateOrderItemDto)`. Tipe array juga dinyatakan eksplisit di `@ApiProperty({ type: () => [CreateOrderItemDto] })` agar Swagger membaca skema item dengan benar (lihat [Catatan](#catatan--batasan-saat-ini)).
- **`OrdersModule` meng-import `PrismaModule` dan `TablesModule`** ([orders.module.ts](../../src/modules/orders/orders.module.ts)) — `TablesModule` di-import agar `TablesRepository` bisa di-inject ke `OrdersService`.

## Catatan & Batasan Saat Ini

- **RBAC belum seragam di sisi baca** — `POST /orders` sengaja publik (guest checkout). Namun `GET /orders/:id` **belum** diberi guard sama sekali (padahal `GET /orders` daftar sudah butuh login), dan `GET /orders` hanya butuh login — belum dibatasi `ADMIN`. Karena hanya ada role `ADMIN`/`CUSTOMER`, idealnya daftar & detail order dibatasi `ADMIN` (data operasional staff). Lihat prioritas perbaikan di sisi baca.
- **`GET /orders` tanpa urutan/pagination** — berbeda dengan `menus` yang memakai `orderBy: { createdAt: 'desc' }`, `findAll` order belum menetapkan urutan dan selalu mengembalikan seluruh baris.
- **Perhitungan uang memakai `number` JavaScript** — `subtotal` & `totalAmount` dihitung sebagai `number` lalu disimpan ke kolom `Decimal`. Untuk nilai besar/pecahan idealnya perhitungan dilakukan dengan tipe `Decimal` agar bebas galat floating point.
- **Pembayaran** — kini sudah ada module [`payments`](payments.md) (QRIS) untuk membuat & mengonfirmasi pembayaran atas sebuah order. Integrasi gateway QRIS asli (webhook, `transactionId`) masih placeholder.
- **Lookup `tableCode` tidak ikut dalam `$transaction`** — dijalankan sebagai baca terpisah sebelum transaksi. Secara teori ada celah kecil (meja dihapus tepat di antara lookup dan pembuatan order), tapi risikonya rendah karena meja dengan order aktif [tidak bisa dihapus](tables.md#business-rules).
