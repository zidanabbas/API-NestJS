# Database

Database memakai **PostgreSQL** dengan **Prisma ORM 7** (`@prisma/adapter-pg` sebagai driver adapter). Skema sumber ada di [`prisma/schema.prisma`](../prisma/schema.prisma).

## Entity Relationship Diagram

```mermaid
erDiagram
    User {
        int id PK
        string name
        string email UK
        string password
        UserRole role
        boolean isActive
        datetime createdAt
        datetime updatedAt
    }

    Category {
        int id PK
        string name UK
        boolean isActive
        datetime createdAt
        datetime updatedAt
    }

    Product {
        int id PK
        int categoryId FK
        string name
        string description
        decimal price
        string imageUrl
        int stock
        boolean isActive
        datetime createdAt
        datetime updatedAt
    }

    Order {
        int id PK
        string orderNumber UK
        string customerName
        string customerPhone
        decimal totalAmount
        OrderStatus status
        datetime createdAt
        datetime updatedAt
    }

    OrderItem {
        int id PK
        int orderId FK
        int productId FK
        int quantity
        decimal price
        decimal subtotal
    }

    Payment {
        int id PK
        int orderId FK "unique"
        PaymentMethod method
        PaymentStatus status
        decimal amount
        string transactionId UK
        string qrString
        string qrUrl
        datetime paidAt
        datetime expiredAt
        datetime createdAt
        datetime updatedAt
    }

    Category ||--o{ Product : "memiliki"
    Product  ||--o{ OrderItem : "dipesan dalam"
    Order    ||--o{ OrderItem : "berisi"
    Order    ||--o| Payment : "dibayar via"
```

> Catatan: `User` belum punya relasi langsung ke `Order` di skema saat ini — data pemesan disimpan sebagai `customerName` / `customerPhone` bebas di tabel `Order`, bukan foreign key ke `User`.

## Model

### `User`

| Field | Tipe | Keterangan |
| ----- | ---- | ---------- |
| `id` | `Int` (PK, autoincrement) | |
| `name` | `String` | |
| `email` | `String` (unique) | Dipakai sebagai identifier login |
| `password` | `String` | Hash bcrypt (10 salt rounds), **tidak pernah** dikembalikan oleh endpoint publik |
| `role` | `UserRole` (`ADMIN` \| `CUSTOMER`) | Default `CUSTOMER`. Ikut disisipkan ke payload JWT saat login, tapi belum ada guard berbasis role (`RolesGuard`) di codebase saat ini |
| `isActive` | `Boolean` | Default `true`. Belum dipakai untuk logic apa pun (mis. blokir login user nonaktif) |
| `createdAt` / `updatedAt` | `DateTime` | Auto-managed Prisma |

Lihat [features/users.md](features/users.md) dan [features/auth.md](features/auth.md).

### `Category`

| Field | Tipe | Keterangan |
| ----- | ---- | ---------- |
| `id` | `Int` (PK, autoincrement) | |
| `name` | `String` (unique) | Divalidasi unik di level service ([categories.service.ts](../src/modules/categories/categories.service.ts)) |
| `isActive` | `Boolean` | Default `true`. Kolom tersedia di skema, tapi belum diekspos lewat DTO/endpoint |
| `products` | `Product[]` | Relasi one-to-many ke `Product` |

Lihat [features/categories.md](features/categories.md).

### `Product`

| Field | Tipe | Keterangan |
| ----- | ---- | ---------- |
| `id` | `Int` (PK, autoincrement) | |
| `categoryId` | `Int` (FK → `Category.id`) | Divalidasi harus ada sebelum create/update |
| `name` | `String` | |
| `description` | `String?` | Opsional |
| `price` | `Decimal(12,2)` | Disimpan sebagai integer/decimal (mis. `25000` = Rp25.000, tanpa desimal pecahan) |
| `imageUrl` | `String?` | Opsional, divalidasi format URL |
| `stock` | `Int` | |
| `isActive` | `Boolean` | Default `true`. Tersedia di skema, belum diekspos lewat DTO/endpoint |
| `category` | `Category` | Relasi many-to-one |
| `orderItems` | `OrderItem[]` | Relasi one-to-many |

Lihat [features/products.md](features/products.md).

### `Order`

| Field | Tipe | Keterangan |
| ----- | ---- | ---------- |
| `id` | `Int` (PK) | |
| `orderNumber` | `String` (unique) | Nomor pesanan yang ditampilkan ke user |
| `customerName` / `customerPhone` | `String` | Data pemesan (belum terhubung ke `User`) |
| `totalAmount` | `Decimal(12,2)` | |
| `status` | `OrderStatus` | `PENDING` (default) → `CONFIRMED` → `PREPARING` → `READY` → `COMPLETED`, atau `CANCELLED` |
| `items` | `OrderItem[]` | |
| `payment` | `Payment?` | Relasi one-to-one opsional |

Lihat [features/orders.md](features/orders.md).

> Catatan: `status` di-set otomatis ke `PENDING` saat order dibuat. Transisi status berikutnya (`CONFIRMED`, dst.) sudah didukung di repository (`updateStatus`) tetapi belum diekspos lewat endpoint.

### `OrderItem`

| Field | Tipe | Keterangan |
| ----- | ---- | ---------- |
| `id` | `Int` (PK) | |
| `orderId` | `Int` (FK → `Order.id`) | |
| `productId` | `Int` (FK → `Product.id`) | |
| `quantity` | `Int` | |
| `price` | `Decimal(12,2)` | Harga produk saat pesanan dibuat (snapshot, agar tidak berubah jika harga produk berubah kemudian) |
| `subtotal` | `Decimal(12,2)` | `price * quantity` |

### `Payment` *(skema siap, endpoint belum dibuat)*

| Field | Tipe | Keterangan |
| ----- | ---- | ---------- |
| `id` | `Int` (PK) | |
| `orderId` | `Int` (FK → `Order.id`, unique) | Satu order maksimal satu payment |
| `method` | `PaymentMethod` | Saat ini hanya `QRIS` |
| `status` | `PaymentStatus` | `PENDING` (default) → `PAID` \| `FAILED` \| `EXPIRED` \| `REFUNDED` |
| `amount` | `Decimal(12,2)` | |
| `transactionId` | `String?` (unique) | ID transaksi dari payment gateway |
| `qrString` / `qrUrl` | `String?` | Data QR code untuk pembayaran QRIS |
| `paidAt` / `expiredAt` | `DateTime?` | |

## Enum

| Enum | Nilai |
| ---- | ----- |
| `UserRole` | `ADMIN`, `CUSTOMER` |
| `OrderStatus` | `PENDING`, `CONFIRMED`, `PREPARING`, `READY`, `COMPLETED`, `CANCELLED` |
| `PaymentStatus` | `PENDING`, `PAID`, `FAILED`, `EXPIRED`, `REFUNDED` |
| `PaymentMethod` | `QRIS` |

## Roadmap Order & Payment

Module **`orders` sudah diimplementasikan** (`Controller → Service → Repository`, terdaftar di [app.module.ts](../src/app.module.ts)) — mencakup pembuatan order + order items dalam satu transaksi, perhitungan `totalAmount`, dan pengurangan `stock`. Lihat [features/orders.md](features/orders.md).

Yang **masih menjadi pengembangan berikutnya**:

- `PATCH /api/v1/orders/:id/status` — mengubah status order (`updateStatus` sudah ada di repository tetapi belum terekspos).
- Filter/pagination untuk `GET /api/v1/orders`.
- **Module `payments`** — model `Payment` **sudah ada di skema** tetapi **belum memiliki module NestJS** (tidak ada folder `src/modules/payments`). Rencana endpoint:
  - `POST /api/v1/orders/:id/payment` — generate QRIS payment.
  - Webhook/endpoint untuk update `PaymentStatus` dari payment gateway.

## Prisma Client

- `PrismaService` ([prisma.service.ts](../src/database/prisma.service.ts)) meng-extend `PrismaClient` bawaan generated output, menggunakan `PrismaPg` adapter dengan `connectionString: process.env.DATABASE_URL`.
- Terhubung otomatis saat module init (`onModuleInit` → `$connect()`) dan disconnect saat aplikasi shutdown (`onModuleDestroy` → `$disconnect()`).
- Output generator diarahkan ke `src/generated/prisma` (bukan default `node_modules/.prisma`) — lihat konfigurasi `generator client` di `schema.prisma`. **Jangan** mengedit file di folder ini secara manual; jalankan `npx prisma generate` setelah mengubah schema.

## Perintah Migrasi

```bash
npx prisma migrate dev      # buat & apply migrasi baru (development)
npx prisma migrate deploy   # apply migrasi tanpa prompt (production/CI)
npx prisma studio           # GUI untuk browse/edit data
npx prisma generate         # generate ulang Prisma Client
```
