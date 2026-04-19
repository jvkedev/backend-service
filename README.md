# Backend Service

TypeScript + Express backend with MongoDB, structured error handling, JWT authentication, OTP email verification via BullMQ/Redis, and request-aware logging.

## Stack

- Node.js 18+
- TypeScript
- Express 5
- MongoDB (Mongoose)
- Redis + BullMQ (job queue for OTP emails)
- JWT (`jsonwebtoken`)
- Password hashing (`bcryptjs`)
- Request validation (`zod`)
- Logging (`winston`)

## Project Layout

```text
backend-service/
  backend/
    src/
      app.ts
      server.ts
      config/
        database.ts
        env.ts
        redis.ts
      controller/
        auth.controller.ts
      middleware/
        auth.ts
        errorHandler.ts
        requestId.ts
        requestLogger.ts
      models/
        otp.ts
        user.ts
      queues/
        email.queue.ts
      routes/
        authRoutes.ts
      services/
        auth.service.ts
        email.service.ts
        otp.service.ts
      types/
        express.d.ts
      utils/
        asyncHandler.ts
        generateToken.ts
        httpError.ts
        ip.util.ts
        logger.ts
        validates.utils.ts
      validators/
        authValidators.ts
      workers/
        email.worker.ts
    package.json
    tsconfig.json
  docker-compose.yml
```

## Setup

1. Open the backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Start Redis (required for the email queue):

```bash
docker compose up -d
```

4. Create `backend/.env` with:

```env
PORT=4000
MONGODB_URI=mongodb://127.0.0.1:27017/midnightcode
NODE_ENV=development
JWT_SECRET=replace_with_a_strong_secret
JWT_EXPIRES_IN=1d
CACHE_TTL_SECONDS=300
REDIS_URL=redis://127.0.0.1:6379
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
```

## Scripts

Run from `backend`:

```bash
npm run dev
```

Starts the API in watch mode via `tsx`.

```bash
npm run build
```

Compiles TypeScript to `dist`.

```bash
npm start
```

Runs the compiled app from `dist/server.js`.

## API

Base path: `/api/auth`

### `POST /register`

Initiates OTP-based registration. Validates the payload, stores pending user data in an OTP record, and enqueues an email job via BullMQ.

Request:
```json
{
  "fullName": "Jane Doe",
  "email": "jane@example.com",
  "password": "strongpassword123"
}
```

Response `202`:
```json
{
  "message": "OTP sent to your email. Please verify your account",
  "email": "jane@example.com"
}
```

---

### `POST /verify-otp`

Verifies the OTP sent to the user's email. On success, creates the user account and returns a JWT token.

- OTP expires after **10 minutes**
- Maximum **5 attempts** before the OTP is invalidated

Request:
```json
{
  "email": "jane@example.com",
  "otp": "123456"
}
```

Response `200`:
```json
{
  "message": "Account verified successfully",
  "user": {
    "userId": "...",
    "email": "jane@example.com"
  },
  "token": "<jwt>"
}
```

## Registration Flow

1. Client sends `POST /register` with user details.
2. `auth.service.ts` clears any existing pending OTPs for that email, generates a new hashed OTP, saves an `Otp` document, and enqueues a `send-otp` job.
3. BullMQ's `emailWorker` picks up the job and sends the OTP email via `email.service.ts`.
4. Client submits the OTP to `POST /verify-otp`.
5. `auth.service.ts` validates the OTP (expiry + attempt limit + hash), creates the `User` document with `isVerified: true`, cleans up the OTP record, and returns a JWT.

## Runtime Flow

1. `src/server.ts` initializes startup.
2. `src/config/database.ts` connects MongoDB.
3. `src/config/redis.ts` initializes the Redis connection for BullMQ.
4. `src/app.ts` registers middleware (requestId, requestLogger, JSON parser, routes, global error handler).
5. `src/workers/email.worker.ts` starts the BullMQ worker (concurrency: 8).

## Middleware

| Middleware | Purpose |
|---|---|
| `requestId` | Attaches a unique `X-Request-Id` header and `req.requestId` to every request |
| `requestLogger` | Logs method, path, status, duration, IP, and sanitized body on response finish |
| `errorHandler` | Normalizes all errors into a consistent JSON error response |

## Notes

- Project is configured as ESM (`"type": "module"`) with Node16 module resolution.
- Passwords and OTP fields are redacted in request logs.
- IP addresses are normalized (IPv4-mapped IPv6 `::ffff:` prefix is stripped).
- Zod validation errors are formatted as `{ field, message }` objects via `validates.utils.ts`.
- The `Otp` collection uses a MongoDB TTL index on `expiresAt` for automatic cleanup.
- Never commit real credentials in `.env`.
