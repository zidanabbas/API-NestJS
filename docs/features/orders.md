# Fitur: Pesanan (Orders)

Module: [src/modules/orders](../../src/modules/orders)

Membuat dan membaca pesanan. Membuat order adalah operasi **multi-langkah** yang dijalankan dalam satu **transaksi database** (`prisma.$transaction`): validasi tiap produk, hitung total, buat `Order` + `OrderItem`, lalu kurangi `stock` produk. Jika salah satu langkah gagal, **seluruh** perubahan dibatalkan (all-or-nothing).

## Endpoint

| Method | Path                 |   Auth    | Deskripsi                        |
| ------ | -------------------- | :-------: | -------------------------------- |
| `POST` | `/api/v1/orders`     | Publik ⚠️ | Buat pesanan baru dengan itemnya |
| `GET`  | `/api/v1/orders`     |  Publik   | Daftar semua pesanan             |
| `GET`  | `/api/v1/orders/:id` |  Publik   | Detail satu pesanan              |

> ⚠️ Lihat [Catatan & Batasan](#catatan--batasan-saat-ini) — semua endpoint saat ini **tidak** dilindungi login/role apa pun.

Setiap response order menyertakan relasi `items` (masing-masing dengan `product` lengkap). Endpoint detail (`GET /:id`) juga menyertakan relasi `payment`.

### `POST /api/v1/orders` — Buat Pesanan

**Request body** ([CreateOrderDto](../../src/modules/orders/dto/create-order.dto.ts)):

```json
{
  "customerName": "Zidane Abbas",
  "customerPhone": "08123456789",
  "items": [
    { "productId": 1, "quantity": 2 },
    { "productId": 2, "quantity": 1 }
  ]
}
```

| Field               | Tipe     | Validasi                                                                                                             |
| ------------------- | -------- | -------------------------------------------------------------------------------------------------------------------- |
| `customerName`      | `string` | wajib, tidak boleh kosong                                                                                            |
| `customerPhone`     | `string` | wajib, tidak boleh kosong                                                                                            |
| `items`             | `array`  | wajib, minimal 1 item, tiap elemen divalidasi ([CreateOrderItemDto](../../src/modules/orders/dto/order-item.dto.ts)) |
| `items[].productId` | `number` | wajib, integer, minimal `1`                                                                                          |
| `items[].quantity`  | `number` | wajib, integer, minimal `1`                                                                                          |

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
    "createdAt": "2026-08-14T02:00:00.000Z",
    "updatedAt": "2026-08-14T02:00:00.000Z",
    "items": [
      {
        "id": 1,
        "orderId": 1,
        "productId": 1,
        "quantity": 2,
        "price": "25000.00",
        "subtotal": "50000",
        "product": {
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
- **`price`** pada tiap item adalah **snapshot** harga produk saat order dibuat (diambil dari `product.price`), agar total tidak berubah jika harga produk diubah di kemudian hari.
- **`subtotal`** = `price × quantity`; **`totalAmount`** = jumlah seluruh `subtotal`.
- Nilai `Decimal` (mis. `price`, `subtotal`, `totalAmount`) diserialisasi JSON sebagai **string**.
- **`stock`** produk pada response sudah berkurang sesuai `quantity` yang dipesan.

**Response `404 Not Found`** — salah satu `productId` tidak ada:

```json
{
  "success": false,
  "statusCode": 404,
  "timestamp": "2026-08-14T02:00:00.000Z",
  "message": "Product 99 not found"
}
```

**Response `400 Bad Request`** — produk nonaktif atau stok kurang:

```json
{
  "success": false,
  "statusCode": 400,
  "timestamp": "2026-08-14T02:00:00.000Z",
  "message": "Insufficient stock for Nasi Goreng Spesial"
}
```

> Pesan lain yang mungkin muncul: `"<nama produk> is not available"` (produk `isActive: false`). Karena semua langkah berada dalam satu transaksi, kegagalan validasi item ke-2 **tidak** akan menyisakan order setengah jadi atau stok yang terlanjur berkurang.

### `GET /api/v1/orders` — Daftar Pesanan

**Response `200 OK`** — array order (shape sama seperti response create, lengkap dengan `items` & `product`). **Belum ada urutan eksplisit, filter, atau pagination** — selalu mengembalikan seluruh order.

### `GET /api/v1/orders/:id` — Detail Pesanan

**Response `200 OK`** — satu order lengkap dengan `items` (beserta `product`) **dan** relasi `payment` (bernilai `null` bila belum ada pembayaran).

**Response `404 Not Found`**:

```json
{
  "success": false,
  "statusCode": 404,
  "timestamp": "2026-08-14T02:00:00.000Z",
  "message": "Order not found"
}
```

## Business Rules

Seluruh aturan berikut dijalankan **di dalam satu transaksi** ([orders.service.ts](../../src/modules/orders/orders.service.ts)) saat `POST /orders`:

1. **Produk harus ada** — tiap `productId` dicari via `tx.product.findUnique`; jika tidak ada → `404 Not Found` (`"Product <id> not found"`).
2. **Produk harus aktif** — jika `product.isActive === false` → `400 Bad Request` (`"<nama> is not available"`).
3. **Stok harus cukup** — jika `product.stock < quantity` → `400 Bad Request` (`"Insufficient stock for <nama>"`).
4. **Hitung harga** — `price` disnapshot dari produk, `subtotal = price × quantity`, `totalAmount` diakumulasi dari seluruh item.
5. **Buat order + item** — `Order` dibuat beserta `OrderItem` (nested `create`) dalam satu operasi.
6. **Kurangi stok** — untuk tiap item, `product.stock` di-`decrement` sebanyak `quantity`.

Jika langkah mana pun melempar error, transaksi otomatis **rollback** — tidak ada order, item, maupun perubahan stok yang tersimpan.

## Implementasi Teknis

| File                                                                        | Peran                                                                        |
| --------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| [orders.controller.ts](../../src/modules/orders/orders.controller.ts)       | Routing `POST` / `GET` / `GET :id`                                           |
| [orders.service.ts](../../src/modules/orders/orders.service.ts)             | Orkestrasi transaksi, validasi item, hitung total, generate `orderNumber`    |
| [orders.repository.ts](../../src/modules/orders/orders.repository.ts)       | Query Prisma (`create` menerima `tx`, `findAll`, `findById`, `updateStatus`) |
| [dto/create-order.dto.ts](../../src/modules/orders/dto/create-order.dto.ts) | Validasi request create (termasuk nested `items`)                            |
| [dto/order-item.dto.ts](../../src/modules/orders/dto/order-item.dto.ts)     | Validasi tiap elemen `items` (`productId`, `quantity`)                       |

Catatan implementasi:

- **`OrdersService` meng-inject `PrismaService` langsung** (selain `OrdersRepository`) karena transaksi membaca/menulis beberapa tabel (`product`, `order`) sekaligus. Ini pengecualian sadar terhadap aturan "hanya repository yang menyentuh database" demi menjaga semua operasi dalam satu `$transaction`.
- **`OrdersRepository.create` menerima `tx: Prisma.TransactionClient`** sebagai argumen pertama, sehingga penulisan order ikut dalam transaksi yang sama dengan pengurangan stok.
- **Validasi nested array** memakai `@ValidateNested({ each: true })` + `@Type(() => CreateOrderItemDto)`. Tipe array juga dinyatakan eksplisit di `@ApiProperty({ type: () => [CreateOrderItemDto] })` agar Swagger membaca skema item dengan benar (lihat [Catatan](#catatan--batasan-saat-ini)).
- **`OrdersModule` meng-import `PrismaModule`** ([order.module.ts](../../src/modules/orders/order.module.ts)).

## Catatan & Batasan Saat Ini

- **Tidak ada guard autentikasi** — sama seperti [products](products.md) & [categories](categories.md), siapa pun bisa membuat/melihat order tanpa login.
- **`updateStatus` belum terekspos** — `OrdersRepository.updateStatus` sudah ada, tetapi belum ada service/controller yang memakainya. Jadi belum ada endpoint untuk mengubah status order (mis. `PENDING → CONFIRMED`). Kandidat kuat untuk `PATCH /api/v1/orders/:id/status`.
- **`GET /orders` tanpa urutan/pagination** — berbeda dengan `products` yang memakai `orderBy: { createdAt: 'desc' }`, `findAll` order belum menetapkan urutan dan selalu mengembalikan seluruh baris.
- **Potensi race condition stok** — pola "baca stok → cek → kurangi" bisa oversell bila dua order untuk produk sama masuk (nyaris) bersamaan. Untuk beban produksi tinggi perlu penguncian baris atau update bersyarat.
- **Perhitungan uang memakai `number` JavaScript** — `subtotal` & `totalAmount` dihitung sebagai `number` lalu disimpan ke kolom `Decimal`. Untuk nilai besar/pecahan idealnya perhitungan dilakukan dengan tipe `Decimal` agar bebas galat floating point.
- **Belum ada integrasi pembayaran** — model `Payment` sudah ada di skema tetapi belum ada module/endpoint-nya (lihat [Roadmap Order & Payment](../database.md#roadmap-order--payment)).
