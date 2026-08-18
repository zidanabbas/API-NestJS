# Fitur: Pembayaran (Payments)

Module: [src/modules/payments](../../src/modules/payments)

Membuat dan mengelola pembayaran atas sebuah [order](orders.md). Metode saat ini **QRIS** saja. Relasi `Payment.orderId` bersifat **unik** — satu order maksimal satu pembayaran. Cocok dengan alur *guest checkout*: pelanggan membuat pembayaran tanpa login, staff (`ADMIN`) mengonfirmasi statusnya.

## Endpoint

| Method  | Path                          |   Auth   | Deskripsi                                  |
| ------- | ----------------------------- | :------: | ------------------------------------------ |
| `POST`  | `/api/v1/payments`            |  Publik  | Buat pembayaran QRIS untuk sebuah order    |
| `GET`   | `/api/v1/payments/:id`        |  Publik  | Cek status pembayaran                      |
| `PATCH` | `/api/v1/payments/:id/status` | 🔒 ADMIN | Ubah status pembayaran (konfirmasi manual) |

> **Auth:** `POST` & `GET` publik (pelanggan membuat & memantau pembayaran tanpa akun). `PATCH /:id/status` khusus **ADMIN** — mensimulasikan callback gateway / konfirmasi kasir.

### `POST /api/v1/payments` — Buat Pembayaran

**Request body** ([CreatePaymentDto](../../src/modules/payments/dto/create-payment.dto.ts)):

```json
{ "orderId": 1 }
```

| Field | Tipe | Validasi |
| ----- | ---- | -------- |
| `orderId` | `number` | wajib, integer, minimal `1`, order harus ada |

> `method`, `amount`, `status` **tidak** dikirim client. `method` di-set `QRIS`, `amount` disnapshot dari `order.totalAmount` (bukan input client — mencegah manipulasi jumlah bayar), `status` default `PENDING`.

**Response `201 Created`**:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "orderId": 1,
    "method": "QRIS",
    "status": "PENDING",
    "amount": "60000.00",
    "transactionId": null,
    "qrString": "QRIS-ORD-1755140400000-482",
    "qrUrl": "https://example.com/qr/ORD-1755140400000-482",
    "paidAt": null,
    "expiredAt": "2026-08-18T02:15:00.000Z",
    "createdAt": "2026-08-18T02:00:00.000Z",
    "updatedAt": "2026-08-18T02:00:00.000Z"
  }
}
```

> `qrString`/`qrUrl` masih **placeholder** — belum tersambung ke gateway QRIS asli. `expiredAt` = waktu buat + 15 menit.

**Response `404 Not Found`** — `orderId` tidak ditemukan (`"Order <id> not found"`).

**Response `400 Bad Request`** — order berstatus `CANCELLED` (`"Cannot pay a cancelled order"`).

**Response `409 Conflict`** — order sudah punya pembayaran (`"Payment already exists for this order"`).

### `GET /api/v1/payments/:id` — Cek Status

**Response `200 OK`** — data pembayaran (shape sama seperti response create). **`404 Not Found`** jika tidak ada.

### `PATCH /api/v1/payments/:id/status` 🔒 ADMIN — Ubah Status

**Request body** ([UpdatePaymentStatusDto](../../src/modules/payments/dto/update-payment-status.dto.ts)):

```json
{ "status": "PAID" }
```

| Field | Tipe | Validasi |
| ----- | ---- | -------- |
| `status` | `PaymentStatus` | wajib, salah satu enum (`@IsEnum`) |

Saat status di-set `PAID`, kolom `paidAt` otomatis diisi waktu saat ini.

**Response `200 OK`** — pembayaran setelah update. **`403 Forbidden`** jika bukan ADMIN. **`404 Not Found`** jika pembayaran tidak ada.

## Enum

- **`PaymentMethod`**: `QRIS` (satu-satunya untuk saat ini).
- **`PaymentStatus`**: `PENDING`, `PAID`, `FAILED`, `EXPIRED`, `REFUNDED`.

## Business Rules

- **Satu order satu pembayaran** — `Payment.orderId` unik. `POST` kedua untuk order sama → `409 Conflict` (`PaymentsService.create` cek `findByOrderId` dulu).
- **Order batal tak bisa dibayar** — jika `order.status === CANCELLED` → `400 Bad Request`.
- **`amount` dari server** — diambil dari `order.totalAmount`, bukan dari body request.
- **`paidAt` otomatis** — diisi hanya ketika status diubah ke `PAID`.

## Implementasi Teknis

| File | Peran |
| ---- | ----- |
| [payments.controller.ts](../../src/modules/payments/payments.controller.ts) | Routing `POST` / `GET :id` / `PATCH :id/status` |
| [payments.service.ts](../../src/modules/payments/payments.service.ts) | Validasi order, cek duplikat, snapshot `amount`, set `paidAt` |
| [payments.repository.ts](../../src/modules/payments/payments.repository.ts) | Query Prisma (`create`, `findById`, `findByOrderId`, `updateStatus`) |
| [dto/create-payment.dto.ts](../../src/modules/payments/dto/create-payment.dto.ts) | Validasi request create (`orderId`) |
| [dto/update-payment-status.dto.ts](../../src/modules/payments/dto/update-payment-status.dto.ts) | Validasi `status` (`@IsEnum(PaymentStatus)`) |
| [dto/payment-response.dto.ts](../../src/modules/payments/dto/payment-response.dto.ts) | Shape response untuk dokumentasi Swagger |

`PaymentsModule` meng-import `OrdersModule` (yang meng-`exports` `OrdersRepository`) agar `PaymentsService` bisa membaca order saat membuat pembayaran ([payments.module.ts](../../src/modules/payments/payments.module.ts)).

## Catatan & Batasan Saat Ini

- **QRIS masih placeholder** — `qrString`/`qrUrl` di-generate dummy; belum ada integrasi gateway asli (Midtrans/Xendit), webhook konfirmasi, maupun pengisian `transactionId`.
- **Status pembayaran belum divalidasi transisinya** — berbeda dari [order status](orders.md#patch-apiv1ordersidstatus--admin--ubah-status-pesanan) yang memakai state machine, `PATCH /payments/:id/status` menerima perpindahan status apa pun. Kandidat penyempurnaan.
- **Pembayaran tidak mengubah status order** — men-set payment `PAID` belum otomatis memindahkan `order.status` (mis. ke `CONFIRMED`). Idealnya digabung dalam satu `$transaction`.
- **`GET /payments/:id` publik dengan id numerik** — mudah dienumerasi. Untuk produksi, pertimbangkan pelacakan lewat identifier acak (mis. `orderNumber`) alih-alih `id` berurutan.
