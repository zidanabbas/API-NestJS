# Getting Started

Panduan instalasi dan menjalankan Food Ordering API di lingkungan lokal.

## Prasyarat

- **Node.js** ≥ 18 (proyek memakai ESM murni / `"type": "module"`)
- **npm**
- **PostgreSQL** (lokal atau remote — bisa juga pakai [Prisma Postgres](https://www.prisma.io/postgres) via `npx create-db`)
- **Git**

## 1. Clone & Install

```bash
git clone <repo-url>
cd latihan-nest
npm install
```

## 2. Konfigurasi Environment

Salin `.env.example` menjadi `.env`:

```bash
cp .env.example .env
```

Isi variabel berikut sesuai environment kamu:

```bash
NODE_ENV=development
PORT=3000

DATABASE_URL="postgresql://postgres:password@localhost:5432/food_ordering?schema=public"

JWT_SECRET=changeme
JWT_EXPIRES_IN=1d
```

| Variable | Wajib | Keterangan |
| -------- | ----- | ---------- |
| `NODE_ENV` | ❌ | `development` \| `production` \| dst. Dibaca oleh [src/config/app.config.ts](../src/config/app.config.ts) |
| `PORT` | ❌ | Port HTTP server, default `3000` |
| `DATABASE_URL` | ✅ | Connection string PostgreSQL. Dipakai oleh Prisma Client (`@prisma/adapter-pg`) di [src/database/prisma.service.ts](../src/database/prisma.service.ts) dan oleh `prisma.config.ts` untuk migrasi |
| `DIRECT_URL` | ❌ | Connection string langsung ke database, dipakai bila `DATABASE_URL` melalui connection pooler (mis. PgBouncer) |
| `JWT_SECRET` | ✅ | Secret HMAC untuk sign & verify token JWT. Aplikasi akan **gagal start** jika kosong (lihat [JwtStrategy](../src/modules/auth/strategies/jwt.strategy.ts)) |
| `JWT_EXPIRES_IN` | ❌ | Masa berlaku access token, format [`ms`](https://github.com/vercel/ms) (mis. `1d`, `12h`, `3600`) |

> ⚠️ Jangan commit file `.env` — sudah termasuk dalam `.gitignore`. Untuk production, ganti `JWT_SECRET` dengan random string yang kuat.

## 3. Setup Database

Pastikan PostgreSQL sudah aktif dan `DATABASE_URL` sudah mengarah ke database yang benar, lalu jalankan migrasi Prisma:

```bash
npx prisma migrate dev
```

Perintah ini akan:
1. Membuat/menyamakan skema tabel di database sesuai [`prisma/schema.prisma`](../prisma/schema.prisma).
2. Meng-generate ulang Prisma Client ke [`src/generated/prisma`](../src/generated/prisma).

Perintah Prisma lain yang berguna:

```bash
npx prisma generate      # generate ulang Prisma Client tanpa migrasi
npx prisma studio        # buka GUI untuk melihat/edit data
npx prisma migrate deploy  # apply migrasi di production (tanpa prompt)
```

> 📖 Referensi lengkap Prisma CLI ada di skill `prisma-cli`, dan Prisma Client API di skill `prisma-client-api`.

## 4. Jalankan Aplikasi

```bash
# development, watch mode (rebuild otomatis)
npm run start:dev

# development, single run
npm run start

# debug mode (Node inspector di port 9229)
npm run start:debug
```

Setelah aktif:

- Health check: `GET http://localhost:3000/api`
- Swagger UI: `http://localhost:3000/docs`
- Base URL API (versioned): `http://localhost:3000/api/v1`

## 5. Build untuk Production

```bash
npm run build      # rimraf dist && nest build && tsc-alias
npm run start:prod # node dist/main
```

## 6. Testing

```bash
npm run test        # unit test (Jest)
npm run test:watch  # unit test, watch mode
npm run test:cov    # unit test + coverage report (output ke /coverage)
npm run test:e2e    # end-to-end test (Supertest, config di test/jest-e2e.json)
```

## 7. Lint & Format

```bash
npm run lint    # eslint --fix
npm run format  # prettier --write
```

## Troubleshooting

| Gejala | Kemungkinan Penyebab | Solusi |
| ------ | --------------------- | ------ |
| App gagal start dengan error `JWT_SECRET is not configured` | `.env` belum dibuat atau `JWT_SECRET` kosong | Isi `JWT_SECRET` di `.env` |
| Error koneksi database saat start / migrate | `DATABASE_URL` salah atau PostgreSQL belum jalan | Cek kredensial & pastikan service PostgreSQL aktif |
| Tipe Prisma (`@/generated/prisma/...`) tidak ditemukan setelah ubah schema | Prisma Client belum di-generate ulang | Jalankan `npx prisma generate` |
| Route mengembalikan 401 padahal sudah login | Header `Authorization` tidak berformat `Bearer <token>`, atau token sudah expired | Login ulang, cek format header |

Lanjut ke [architecture.md](architecture.md) untuk memahami struktur aplikasi secara menyeluruh.
