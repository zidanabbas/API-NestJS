# Fitur: Users

Module: [src/modules/users](../../src/modules/users)

Mengelola registrasi user dan daftar user terdaftar. Password di-hash dengan `bcrypt` (10 salt rounds) dan **tidak pernah** dikembalikan di response manapun.

## Endpoint

| Method | Path | Auth | Deskripsi |
| ------ | ---- | :--: | --------- |
| `POST` | `/api/v1/users` | Publik | Registrasi user baru |
| `GET`  | `/api/v1/users` | 🔒 | Daftar semua user terdaftar |
| `GET`  | `/api/v1/users/:id` | 🔒 | Detail satu user berdasarkan ID |

> 🔒 = butuh login valid (cookie `access_token`), belum dibatasi role tertentu.

### `POST /api/v1/users` — Registrasi User

**Request body** ([CreateUserDto](../../src/modules/users/dto/create-user.dto.ts)):

```json
{
  "name": "Budi Santoso",
  "email": "budi@example.com",
  "password": "secret123"
}
```

| Field | Tipe | Validasi |
| ----- | ---- | -------- |
| `name` | `string` | wajib, tidak boleh kosong |
| `email` | `string` | wajib, format email valid, harus unik |
| `password` | `string` | wajib, minimal 6 karakter |

**Response `201 Created`** ([UserResponseDto](../../src/modules/users/dto/user-response.dto.ts) — field `password` tidak disertakan):

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Budi Santoso",
    "email": "budi@example.com",
    "createdAt": "2026-08-13T02:00:00.000Z",
    "updatedAt": "2026-08-13T02:00:00.000Z"
  }
}
```

**Response `409 Conflict`** — email sudah terdaftar:

```json
{
  "success": false,
  "statusCode": 409,
  "error": "Conflict",
  "message": "Email already registered",
  "path": "/api/v1/users",
  "timestamp": "2026-08-14T02:00:00.000Z"
}
```

### `GET /api/v1/users` 🔒 — Daftar User

Membutuhkan login — cookie `access_token` (httpOnly) dikirim otomatis oleh browser setelah login (lihat [features/auth.md](auth.md)).

**Response `200 OK`**:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Budi Santoso",
      "email": "budi@example.com",
      "createdAt": "2026-08-13T02:00:00.000Z",
      "updatedAt": "2026-08-13T02:00:00.000Z"
    }
  ]
}
```

**Response `401 Unauthorized`** — token tidak ada/invalid/expired:

```json
{
  "success": false,
  "statusCode": 401,
  "error": "Unauthorized",
  "message": "Unauthorized",
  "path": "/api/v1/users",
  "timestamp": "2026-08-14T02:00:00.000Z"
}
```

### `GET /api/v1/users/:id` 🔒 — Detail User

Membutuhkan login (cookie `access_token`). `id` divalidasi sebagai integer via `ParseIntPipe`.

**Response `200 OK`** ([UserResponseDto](../../src/modules/users/dto/user-response.dto.ts) — tanpa `password`):

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Budi Santoso",
    "email": "budi@example.com",
    "createdAt": "2026-08-13T02:00:00.000Z",
    "updatedAt": "2026-08-13T02:00:00.000Z"
  }
}
```

**Response `404 Not Found`** — user dengan `id` tersebut tidak ada:

```json
{
  "success": false,
  "statusCode": 404,
  "error": "Not Found",
  "message": "User Not Found",
  "path": "/api/v1/users/99",
  "timestamp": "2026-08-14T02:00:00.000Z"
}
```

**Response `401 Unauthorized`** — token tidak ada/invalid/expired (shape sama seperti `GET /users`).

## Business Rules

- Email harus unik — dicek eksplisit di `UsersService.create` sebelum insert (bukan hanya mengandalkan unique constraint database), agar bisa melempar `409 Conflict` dengan pesan yang jelas alih-alih error database mentah.
- Password di-hash dengan `bcrypt` sebelum disimpan ([users.repository.ts](../../src/modules/users/users.repository.ts), `SALT_ROUNDS = 10`).
- Query yang mengembalikan user ke luar (`findAll`, `findById`, hasil `create`) selalu memakai `select` eksplisit (`publicUserSelect`: `id, name, email, createdAt, updatedAt`) sehingga kolom `password` dan `role` tidak pernah ikut ter-serialize ke response. Query `findByEmail` (dipakai internal oleh `AuthService`) sengaja mengembalikan full record termasuk `password` karena dipakai untuk `bcrypt.compare`.
- `UsersService.findOne(id)` melempar `404 Not Found` (`"User Not Found"`) jika user tidak ditemukan, konsisten dengan pola `findOne` di module lain.

## Implementasi Teknis

| File | Peran |
| ---- | ----- |
| [users.controller.ts](../../src/modules/users/users.controller.ts) | Endpoint `GET /users`, `GET /users/:id`, `POST /users` |
| [users.service.ts](../../src/modules/users/users.service.ts) | Cek email duplikat sebelum create; `findOne` (404 jika tidak ada) |
| [users.repository.ts](../../src/modules/users/users.repository.ts) | Query Prisma (`findAll`, `findById`, `findByEmail`, `create`) + hashing password |
| [dto/create-user.dto.ts](../../src/modules/users/dto/create-user.dto.ts) | Validasi registrasi |
| [dto/update-user.dto.ts](../../src/modules/users/dto/update-user.dto.ts) | `PartialType(CreateUserDto)` — **didefinisikan tapi belum dipakai**, tidak ada endpoint update user |
| [dto/user-response.dto.ts](../../src/modules/users/dto/user-response.dto.ts) | Shape response untuk dokumentasi Swagger |

## Catatan & Batasan Saat Ini

- `GET /users/:id` sudah ada, tetapi endpoint tulis **`PATCH /users/:id`** dan **`DELETE /users/:id`** belum — `UpdateUserDto` sudah dibuat namun belum dipakai controller manapun.
- `GET /api/v1/users` dan `GET /api/v1/users/:id` hanya butuh **login valid** (guard `JwtAuthGuard`), belum ada pembatasan berdasarkan `role` (mis. hanya `ADMIN`) meskipun kolom `role` sudah ada di model `User` dan payload JWT.
- Kolom `isActive` di model `User` belum dipakai untuk logic apa pun (mis. menolak login user nonaktif).
