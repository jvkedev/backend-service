# Backend Service

TypeScript + Express backend with MongoDB, structured error handling, JWT authentication, and request-aware logging.

## Stack

- Node.js 18+
- TypeScript
- Express 5
- MongoDB (Mongoose)
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
      controller/
        auth.controller.ts
      middleware/
        auth.ts
        errorHandler.ts
      models/
        user.ts
      routes/
        authRoutes.ts
      types/
        express.d.ts
      utils/
        asyncHandler.ts
        generateToken.ts
        httpError.ts
        logger.ts
      validators/
        authValidators.ts
    package.json
    tsconfig.json
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

3. Create `backend/.env` with:

```env
PORT=4000
MONGODB_URI=mongodb://127.0.0.1:27017/midnightcode
NODE_ENV=development
JWT_SECRET=replace_with_a_strong_secret
JWT_EXPIRES_IN=1d
CACHE_TTL_SECONDS=300
REDIS_URL=
OPENAI_API_KEY=
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

- `POST /register`
  - Validates payload with Zod
  - Prevents duplicate users by email
  - Hashes password before save (Mongoose pre-save hook)
  - Returns user info plus JWT token

Example payload:

```json
{
  "fullName": "Jane Doe",
  "email": "jane@example.com",
  "password": "strongpassword123"
}
```

## Runtime Flow

1. `src/server.ts` initializes startup.
2. `src/config/database.ts` connects MongoDB.
3. `src/app.ts` registers JSON parser, routes, and global error middleware.
4. Auth logic is handled in controller + middleware layers.

## Notes

- Project is configured as ESM (`"type": "module"`) with Node16 module resolution.
- Global error responses are normalized by `errorHandler`.
- Logger output includes request metadata (method/path/IP), with extra metadata in non-production mode.
- Never commit real credentials in `.env`.
