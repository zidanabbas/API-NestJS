# Dokumentasi — Food Ordering API

Selamat datang di dokumentasi teknis Food Ordering API. Gunakan daftar di bawah untuk berpindah ke topik yang relevan.

## Daftar Isi

### Mulai di sini

| Dokumen | Isi |
| ------- | --- |
| [getting-started.md](getting-started.md) | Prasyarat, instalasi, konfigurasi environment, menjalankan aplikasi & test |
| [architecture.md](architecture.md) | Pola arsitektur (Controller → Service → Repository), alur request, global pipe/filter/interceptor |
| [database.md](database.md) | Skema Prisma, ERD, penjelasan tiap model & enum, roadmap Order/Payment |

### Fitur (per module)

| Dokumen | Endpoint yang dibahas |
| ------- | ---------------------- |
| [features/auth.md](features/auth.md) | `POST /api/v1/auth/login` |
| [features/users.md](features/users.md) | `GET /api/v1/users`, `POST /api/v1/users` |
| [features/categories.md](features/categories.md) | `POST /api/v1/categories`, `GET /api/v1/categories`, `GET /api/v1/categories/:id`, `PATCH /api/v1/categories/:id`, `DELETE /api/v1/categories/:id` |
| [features/products.md](features/products.md) | `POST /api/v1/products`, `GET /api/v1/products`, `GET /api/v1/products/:id`, `PATCH /api/v1/products/:id`, `DELETE /api/v1/products/:id` |

## Konvensi Dokumen

- Semua contoh request/response memakai base path `http://localhost:3000` sesuai default `PORT`.
- Body request & response ditulis sebagai JSON mentah (payload asli). Perlu diingat bahwa aplikasi membungkus **setiap** response sukses dengan `{ success: true, data: ... }` melalui `ResponseInterceptor` — lihat [architecture.md](architecture.md#response-envelope).
- Endpoint yang butuh login ditandai badge 🔒 dan memerlukan header `Authorization: Bearer <accessToken>`.
- Kode status & pesan error mengikuti format `HttpExceptionFilter` — lihat [architecture.md](architecture.md#format-error).

## Referensi Cepat

- Root README (ringkasan proyek): [../README.md](../README.md)
- Swagger UI (saat aplikasi berjalan): `http://localhost:3000/docs`
- Skema database: [`prisma/schema.prisma`](../prisma/schema.prisma)
