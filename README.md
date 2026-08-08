# MORPHO Store

MORPHO is a premium Sri Lankan T-shirt storefront with a Next.js frontend and an Express/Mongoose backend.

## Current status

The storefront currently includes a placeholder catalog plus an end-to-end T-shirt customization flow. Customer artwork is uploaded through the authenticated backend to Cloudinary, while garment mockups remain replaceable frontend project assets.

## Technology

- Next.js 16
- React 19
- TypeScript
- App Router
- Tailwind CSS 4
- Node.js / Express
- MongoDB / Mongoose
- Cloudinary

## Repository structure

```text
frontend/        Existing storefront application
backend/         Express API, Mongoose models, and customization upload pipeline
docs/            Current architecture/status documentation
infrastructure/  Infrastructure placeholders
```

## Frontend setup

Requirements:

- Node.js 22+
- npm 10+

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000.

Copy `frontend/.env.example` to `frontend/.env.local` and set the API URL.

## Backend setup

```bash
cd backend
npm install
```

Copy `backend/.env.example` to `backend/.env` and configure MongoDB, JWT, and Cloudinary credentials. Then run `npm start`. The API defaults to http://localhost:4200.

## Customizer mockups

Replace mockups using the same filenames under:

- `frontend/public/images/customizer/mockups/oversize/`
- `frontend/public/images/customizer/mockups/raglan/`

No database or code change is required when image geometry stays the same. If geometry changes, adjust only the normalized print areas in `frontend/src/features/customizer/customization-config.ts`.

## Frontend verification

```bash
cd frontend
npm run lint
npm run typecheck
npm run build
```

## Docker

The Compose file currently starts only the frontend development service:

```bash
docker compose up --build
```

The current Compose file remains frontend-only; run the backend separately until its deployment configuration is added.
