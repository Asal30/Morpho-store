# MORPHO Store

MORPHO is a premium Sri Lankan T-shirt storefront. This repository currently contains the existing Next.js frontend only.

## Current status

The previous backend implementation and its database infrastructure have been removed. A replacement backend will be designed and built in the next project phase.

The storefront UI remains intact and currently uses an isolated placeholder catalog while the future API is absent. The former administration UI and its frontend proxy have been removed.

## Technology

- Next.js 16
- React 19
- TypeScript
- App Router
- Tailwind CSS 4

## Repository structure

```text
frontend/        Existing storefront application
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

No API or database service is included in this cleanup phase.
