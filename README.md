# MERN Backend Starter

A TypeScript + Express backend service with MongoDB connection and Winston logging.

## Tech Stack

- Node.js
- TypeScript
- Express
- Mongoose
- Winston
- dotenv

## Project Structure

```text
MERN/
  backend/
    src/
      app.ts
      server.ts
      config/
        database.ts
        env.ts
      middleware/
      utils/
        logger.ts
        asyncHandler.ts
        httpError.ts
    package.json
    tsconfig.json
    .env
```

## Prerequisites

- Node.js 18+
- npm 9+
- A MongoDB database (local MongoDB or MongoDB Atlas)

## Setup

1. Go to the backend folder.

```bash
cd backend
```

2. Install dependencies.

```bash
npm install
```

3. Create or update your environment variables in `backend/.env`.

Use this template:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>/<database>
JWT_SECRET=replace_with_a_strong_secret
JWT_EXPIRES_IN=1d
CACHE_TTL_SECONDS=300
REDIS_URL=redis://<host>:<port>
OPENAI_API_KEY=your_openai_api_key
```

## Available Scripts

Run these commands from `backend`:

- Development (hot reload):

```bash
npm run dev
```

- Build TypeScript:

```bash
npm run build
```

- Run compiled build:

```bash
npm start
```

## Current Runtime Flow

1. `src/server.ts` starts the application.
2. `src/config/database.ts` connects to MongoDB.
3. `src/app.ts` creates the Express app.
4. Server listens on the configured port.

## Notes

- This project uses CommonJS package type with TypeScript Node16 module settings.
- Logging is handled through Winston in `src/utils/logger.ts`.
- Keep secrets only in `.env`; never commit real credentials to source control.

## Troubleshooting

### MongoDB connection refused

If you see a connection error like `ECONNREFUSED 127.0.0.1:27017`, either:

- Start your local MongoDB service, or
- Set a valid `MONGODB_URI` for MongoDB Atlas in `.env`

### PowerShell directory command issue

If `cd /d` fails in PowerShell, use:

```powershell
Set-Location 'c:\Users\ASUS\OneDrive\Desktop\MERN\backend'
```
