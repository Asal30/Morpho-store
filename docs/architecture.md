# MORPHO Store architecture

## System boundary

MORPHO Store is a monorepo with independently deployable web and API applications. The Next.js application owns presentation, browser interaction, and future server-side/BFF concerns. FastAPI is the primary business/domain API and is the **only application that owns and directly manipulates the relational business database schema**. Alembic is the sole migration mechanism.

```text
Browser -> Next.js web/BFF -> FastAPI domain API -> MariaDB
```

This boundary prevents competing data-access rules and makes domain behavior testable in one place. Next.js must call FastAPI for business data rather than connecting to MariaDB.

## Application organization

The frontend uses the Next.js App Router. Cross-feature primitives live under `components`, domain-facing UI and behavior under `features`, external communication under `services`, and browser-only shared state under `stores`. React local/server state remains the default; Zustand is available for genuinely shared client state. React Hook Form and Zod provide form state and validation, and Ky is the small HTTP client boundary.

The API separates HTTP routes (`api`), settings and cross-cutting policy (`core`), persistence (`db` and `models`), validated contracts (`schemas`), and use cases (`services`). Future domains—auth, users, catalog, products/variants, wishlist, cart, customization, orders, payments, shipping, reviews, and support—should be introduced as cohesive modules only when implemented.

## Data and migrations

SQLAlchemy 2 is the persistence layer and MariaDB/MySQL is the relational store. Models are imported through `app.models` so Alembic can discover metadata. Schema changes are generated, reviewed, and applied from `backend`; application startup never creates tables implicitly.

## Configuration and security

Runtime settings come from environment variables. `.env.example` contains development-safe examples only; `.env` is ignored. Public browser variables are limited to the `NEXT_PUBLIC_` namespace. Payment, storage, and email integrations will add provider-specific variables without changing the configuration boundary.

## Motion and customization readiness

Motion, GSAP, Three.js, React Three Fiber, and Drei are installed but intentionally unused until their product features exist. Heavy 3D/customization code should be dynamically loaded client-side to protect the core storefront bundle.

## Deployment direction

Docker Compose provides local web, API, and database services with health-based dependency ordering. Images preserve independent application boundaries. Kubernetes is a future production concern and is intentionally absent.
