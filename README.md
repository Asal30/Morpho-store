# MORPHO Store

MORPHO is a premium Sri Lankan T-shirt storefront built with Next.js and a Node.js domain API.

## Architecture

- `frontend/`: Next.js 16, React 19, TypeScript, App Router and Tailwind CSS
- `backend/`: Node.js 22, JavaScript ES modules, Express, Mongoose and Zod
- Database: MongoDB 8
- Media: provider-independent metadata in MongoDB; local filesystem adapter for development

The frontend never connects to MongoDB. Express owns catalog rules, pricing, product management, media metadata and administrator sessions.

## Prerequisites

- Node.js 22+
- npm 10+
- MongoDB 8, or Docker Desktop with Compose

## Environment

Copy `.env.example` to `.env`. Generate a bcrypt administrator password hash from `backend/`:

```bash
npm install
npm run hash-password -- "your-password"
```

Set the result as `ADMIN_PASSWORD_HASH` and generate a random `SESSION_SECRET` of at least 32 characters. Secrets must not use `NEXT_PUBLIC_*` variables.

## Local startup

Start MongoDB, then run:

```bash
cd backend
npm install
npm run seed
npm run dev
```

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the storefront at http://localhost:3000, the admin login at http://localhost:3000/admin/login, and API health at http://localhost:8000/health.

The seed command is idempotent and creates only garment, theme, color, size and pricing reference data. It does not create products.

## Docker Compose

```bash
docker compose up --build
```

This starts `frontend`, `backend`, and `mongodb`. Uploaded development media and MongoDB data use named volumes.

## Quality commands

```bash
cd backend
npm run lint
npm test
npm run build

cd ../frontend
npm run lint
npm run typecheck
npm run build
```
