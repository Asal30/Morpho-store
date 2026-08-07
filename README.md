# MORPHO Store

MORPHO is a premium Sri Lankan T-shirt brand built around the idea **“Wear Your Memories.”** This repository contains the production-oriented foundation for its storefront and domain API; product and commerce features are intentionally deferred.

## Architecture

The repository contains a Next.js frontend and a FastAPI backend. FastAPI owns all business/domain data and the MariaDB schema; Alembic owns migrations. Next.js may evolve BFF/server-side behavior, but it does not access the relational database directly. See [docs/architecture.md](docs/architecture.md).

## Technology stack

- Web: Next.js 16, React 19, TypeScript, App Router, Tailwind CSS 4
- Interaction readiness: Motion, GSAP, Three.js, React Three Fiber, Drei
- Web foundations: React Hook Form, Zod, Zustand, Ky
- API: FastAPI, Pydantic Settings, SQLAlchemy 2, Alembic, PyMySQL
- Data: MariaDB 11 (MySQL-compatible)
- Local orchestration: Docker Compose

## Folder structure

```text
frontend/             Next.js customer-facing application
  src/app/            routes and global styles
  src/components/     reusable UI/layout/shared components
  src/features/       feature-oriented frontend modules
  src/services/       external API clients
backend/              FastAPI domain application
  app/api/            HTTP routes
  app/core/           configuration and cross-cutting concerns
  app/db/             SQLAlchemy infrastructure
  app/models/         domain persistence models
  app/schemas/        API contracts
  app/services/       use cases/domain services
  migrations/         Alembic migration environment
  tests/              API tests
infrastructure/       future infrastructure documentation/assets
docs/                 architecture documentation
```

## Prerequisites

- Node.js 22+ and npm 10+
- Python 3.12+ (3.13 recommended)
- MariaDB/MySQL for non-container local development
- Docker Desktop with Compose for the full local stack

## Environment setup

Copy `.env.example` to `.env` and replace the development passwords. Compose reads the root file. For a host-run API, set `DB_HOST=localhost`. Public frontend configuration must use the `NEXT_PUBLIC_` prefix.

## Frontend startup

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000.

## Backend startup

From `backend`:

```bash
uv sync --extra dev
uv run uvicorn app.main:app --reload
```

Open http://localhost:8000/health or http://localhost:8000/docs.

## Docker Compose startup

```bash
docker compose up --build
```

This starts web (`:3000`), API (`:8000`), and MariaDB (`:3306`). Stop it with `docker compose down`; add `--volumes` only when you intentionally want to erase local database data.

## Database and migration workflow

FastAPI/SQLAlchemy owns models and Alembic owns schema history. From `backend`, with database environment variables set:

```bash
uv run alembic revision --autogenerate -m "describe change"
uv run alembic upgrade head
uv run alembic downgrade -1
```

Review generated migrations before applying them. Do not add database access to the Next.js application.

## Quality commands

```bash
cd frontend
npm run lint
npm run typecheck
npm run build
cd ../backend
uv run ruff check .
uv run pytest
uv run python -c "from app.main import app; print(app.title)"
```
