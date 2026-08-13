<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

<h1 align="center">Food Ordering API</h1>

<p align="center">
  REST API untuk sistem pemesanan makanan (food ordering), dibangun dengan <a href="https://nestjs.com">NestJS</a>, <a href="https://www.prisma.io">Prisma ORM</a>, dan PostgreSQL.
</p>

---

## Daftar Isi

- [Tentang Proyek](#tentang-proyek)
- [Tech Stack](#tech-stack)
- [Fitur](#fitur)
- [Struktur Proyek](#struktur-proyek)
- [Instalasi Cepat](#instalasi-cepat)
- [Environment Variables](#environment-variables)
- [Menjalankan Aplikasi](#menjalankan-aplikasi)
- [Testing](#testing)
- [API Documentation (Swagger)](#api-documentation-swagger)
- [Dokumentasi Lengkap](#dokumentasi-lengkap)
- [Lisensi](#lisensi)

## Tentang Proyek

Food Ordering API adalah backend service untuk aplikasi pemesanan makanan. Saat ini API menyediakan pengelolaan **user**, **autentikasi (JWT)**, **kategori produk**, dan **produk**. Skema database juga sudah menyiapkan entitas **Order**, **OrderItem**, dan **Payment** (QRIS) untuk pengembangan fitur pemesanan & pembayaran selanjutnya.

## Tech Stack

| Layer            | Teknologi |
| ----------------- | --------- |
| Framework          | [NestJS 11](https://nestjs.com) (Express platform) |
| Bahasa             | TypeScript 5 (ESM / `nodenext`) |
| ORM                | [Prisma ORM 7](https://www.prisma.io) + `@prisma/adapter-pg` |
| Database           | PostgreSQL |
| Auth               | Passport + `@nestjs/jwt` (JWT Bearer) |
| Validasi           | `class-validator` + `class-transformer` |
| API Docs           | `@nestjs/swagger` (OpenAPI, tersedia di `/docs`) |
| Password Hashing   | `bcrypt` |
| Keamanan HTTP      | `helmet`, CORS |
| Testing            | Jest + Supertest |

## Fitur

| Fitur | Status | Dokumentasi |
| ----- | ------ | ----------- |
| Health check | ✅ | — |
| Autentikasi (login JWT) | ✅ | [docs/features/auth.md](docs/features/auth.md) |
| Manajemen User (registrasi & list) | ✅ | [docs/features/users.md](docs/features/users.md) |
| Kategori Produk (CRUD) | ✅ | [docs/features/categories.md](docs/features/categories.md) |
| Produk (CRUD) | ✅ | [docs/features/products.md](docs/features/products.md) |
| Order & Payment (QRIS) | 🚧 skema database siap, service/endpoint belum dibuat | [docs/database.md](docs/database.md#roadmap-order--payment) |

Lihat detail lengkap tiap fitur (endpoint, request/response, business rules) di folder [`docs/`](docs/README.md).

## Struktur Proyek

```
latihan-nest/
├── docs/                        # Dokumentasi lengkap (arsitektur, database, per-fitur)
├── prisma/
│   └── schema.prisma            # Skema database (User, Product, Category, Order, OrderItem, Payment)
├── src/
│   ├── common/
│   │   ├── filter/               # Global exception filter (response error konsisten)
│   │   ├── interceptors/         # Global response interceptor (wrap { success, data })
│   │   └── middleware/           # Logger middleware (mencatat method, url, status, durasi)
│   ├── config/                   # app/database/jwt config + setup Swagger
│   ├── database/                 # PrismaService & PrismaModule (global)
│   ├── generated/prisma/         # Output Prisma Client (auto-generated, jangan diedit manual)
│   ├── modules/
│   │   ├── auth/                 # Login, JWT strategy & guard
│   │   ├── users/                # Registrasi & daftar user
│   │   ├── categories/           # CRUD kategori produk
│   │   └── products/             # CRUD produk
│   ├── app.module.ts
│   ├── app.controller.ts         # Health check endpoint
│   └── main.ts                   # Bootstrap: prefix /api, versioning, pipes, filters, Swagger
└── test/                         # e2e tests
```

Setiap module mengikuti pola **Controller → Service → Repository**:

- **Controller** — menangani HTTP request/response & dokumentasi Swagger.
- **Service** — business logic & validasi aturan bisnis (mis. cek duplikat, cek relasi).
- **Repository** — satu-satunya lapisan yang berbicara langsung ke Prisma/database.

Detail lebih dalam ada di [docs/architecture.md](docs/architecture.md).

## Instalasi Cepat

Prasyarat: Node.js ≥ 18, PostgreSQL, npm.

```bash
# 1. Install dependencies
npm install

# 2. Salin file environment lalu sesuaikan nilainya
cp .env.example .env

# 3. Jalankan migrasi database
npx prisma migrate dev

# 4. Jalankan aplikasi (watch mode)
npm run start:dev
```

Panduan instalasi lengkap (termasuk troubleshooting) ada di [docs/getting-started.md](docs/getting-started.md).

## Environment Variables

| Variable          | Wajib | Default       | Keterangan |
| ------------------ | ----- | ------------- | ---------- |
| `NODE_ENV`          | ❌    | `development` | Environment aplikasi |
| `PORT`              | ❌    | `3000`        | Port HTTP server |
| `DATABASE_URL`      | ✅    | —             | Connection string PostgreSQL, dipakai Prisma |
| `DIRECT_URL`        | ❌    | —             | Connection string langsung (opsional, untuk migrasi di balik connection pooler) |
| `JWT_SECRET`        | ✅    | —             | Secret untuk sign/verify JWT — **wajib diganti di production** |
| `JWT_EXPIRES_IN`    | ❌    | `1d`          | Masa berlaku access token |

Lihat contoh lengkap di [`.env.example`](.env.example).

## Menjalankan Aplikasi

```bash
# development (single run)
npm run start

# watch mode (rebuild otomatis saat ada perubahan)
npm run start:dev

# debug mode (attach ke Node inspector)
npm run start:debug

# production (menjalankan hasil build di dist/)
npm run build
npm run start:prod
```

Setelah berjalan, base URL API ada di `http://localhost:3000/api/v1` (health check di `http://localhost:3000/api`, tanpa versi).

## Testing

```bash
npm run test        # unit test
npm run test:watch  # unit test, watch mode
npm run test:cov    # unit test + coverage report
npm run test:e2e    # end-to-end test
```

## API Documentation (Swagger)

Dokumentasi interaktif (OpenAPI) tersedia otomatis saat aplikasi berjalan:

```
http://localhost:3000/docs
```

Endpoint yang butuh login (mis. `GET /api/v1/users`) bisa dicoba langsung dari Swagger UI dengan klik **Authorize** lalu masukkan `Bearer <accessToken>` hasil login.

## Dokumentasi Lengkap

Semua dokumentasi detail (arsitektur, skema database, dan spesifikasi tiap fitur/endpoint) ada di folder [`docs/`](docs/README.md):

- [docs/README.md](docs/README.md) — daftar isi dokumentasi
- [docs/getting-started.md](docs/getting-started.md) — instalasi & setup detail
- [docs/architecture.md](docs/architecture.md) — arsitektur aplikasi, alur request, global providers
- [docs/database.md](docs/database.md) — skema Prisma, ERD, relasi antar tabel
- [docs/features/auth.md](docs/features/auth.md) — autentikasi & JWT
- [docs/features/users.md](docs/features/users.md) — manajemen user
- [docs/features/categories.md](docs/features/categories.md) — kategori produk
- [docs/features/products.md](docs/features/products.md) — produk

## Lisensi

`UNLICENSED` — proyek privat, hak cipta oleh pemilik repository.
