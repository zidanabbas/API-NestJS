# Fitur: Autentikasi (Auth)

Module: [src/modules/auth](../../src/modules/auth)

Autentikasi memakai strategi **JWT Bearer token** dengan Passport (`passport-jwt`). Tidak ada refresh token — hanya satu access token dengan masa berlaku sesuai `JWT_EXPIRES_IN`.

## Alur Login

```mermaid
sequenceDiagram
    participant C as Client
    participant AC as AuthController
    participant AS as AuthService
    participant UR as UsersRepository
    participant DB as PostgreSQL

    C->>AC: POST /api/v1/auth/login { email, password }
    AC->>AS: login(dto)
    AS->>UR: findByEmail(email)
    UR->>DB: SELECT * FROM "User" WHERE email = ...
    DB-->>UR: user (termasuk hash password)
    UR-->>AS: user | null
    alt user tidak ditemukan
        AS-->>C: 401 Unauthorized
    end
    AS->>AS: bcrypt.compare(password, user.password)
    alt password salah
        AS-->>C: 401 Unauthorized
    end
    AS->>AS: sign JWT { sub, email, role }
    AS-->>C: 200 { accessToken, user }
```

## Endpoint

### `POST /api/v1/auth/login`

Login menggunakan email & password, mengembalikan JWT access token.

**Request body** ([LoginDto](../../src/modules/auth/dto/login-dto.ts)):

```json
{
  "email": "budi@example.com",
  "password": "secret123"
}
```

| Field | Tipe | Validasi |
| ----- | ---- | -------- |
| `email` | `string` | wajib, format email valid |
| `password` | `string` | wajib, tidak boleh kosong |

**Response `200 OK`** (payload di dalam `data`, lihat [response envelope](../architecture.md#response-envelope)):

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "name": "Budi Santoso",
      "email": "budi@example.com",
      "role": "CUSTOMER"
    }
  }
}
```

**Response `401 Unauthorized`** — email tidak terdaftar **atau** password salah (pesan sengaja disamakan agar tidak bocorkan email mana yang terdaftar):

```json
{
  "success": false,
  "statusCode": 401,
  "timestamp": "2026-08-13T02:00:00.000Z",
  "message": "Invalid email or password"
}
```

## JWT Payload

Token berisi payload berikut (lihat `AuthService.login` di [auth-service.ts](../../src/modules/auth/auth-service.ts)):

```json
{
  "sub": 1,
  "email": "budi@example.com",
  "role": "CUSTOMER",
  "iat": 1755050400,
  "exp": 1755136800
}
```

- `sub` — user ID
- `role` — disisipkan untuk kebutuhan otorisasi berbasis role di masa depan (saat ini **belum ada** `RolesGuard`/decorator role di codebase)

## Mengakses Endpoint yang Diproteksi

Sertakan token pada header `Authorization`:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Contoh dengan `curl`:

```bash
curl http://localhost:3000/api/v1/users \
  -H "Authorization: Bearer <accessToken>"
```

Di Swagger UI (`/docs`), klik tombol **Authorize** dan masukkan `<accessToken>` (tanpa perlu menulis `Bearer`, Swagger menambahkannya otomatis untuk skema `bearerAuth`).

## Implementasi Teknis

| File | Peran |
| ---- | ----- |
| [auth-controller.ts](../../src/modules/auth/auth-controller.ts) | Endpoint `POST /auth/login` |
| [auth-service.ts](../../src/modules/auth/auth-service.ts) | Verifikasi kredensial (`bcrypt.compare`) & sign JWT |
| [strategies/jwt.strategy.ts](../../src/modules/auth/strategies/jwt.strategy.ts) | Memvalidasi token dari header `Authorization: Bearer`, meng-extract payload menjadi `request.user = { userId, email, role }` |
| [guards/jwt-auth.guard.ts](../../src/modules/auth/guards/jwt-auth.guard.ts) | Guard (`AuthGuard('jwt')`) yang dipasang manual per-route via `@UseGuards(JwtAuthGuard)` |
| [dto/login-dto.ts](../../src/modules/auth/dto/login-dto.ts) | Validasi request body |

## Catatan & Batasan Saat Ini

- **Guard bersifat opt-in per route**, bukan global — route yang tidak eksplisit memasang `@UseGuards(JwtAuthGuard)` bersifat publik. Saat ini hanya `GET /api/v1/users` yang diproteksi (lihat [features/users.md](users.md)). Endpoint `categories` dan `products` (termasuk create/update/delete) **belum** diproteksi sama sekali.
- Tidak ada endpoint `logout` — karena JWT stateless, "logout" cukup dilakukan client dengan membuang token tersimpan.
- Tidak ada refresh token; saat token expired, user harus login ulang.
- `JwtStrategy` akan melempar error saat aplikasi start jika `JWT_SECRET` tidak diset (fail-fast), lihat [getting-started.md](../getting-started.md#troubleshooting).
