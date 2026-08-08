# MORPHO Store architecture

MORPHO is a monorepo with independently deployable frontend and backend applications.

```text
Browser -> Next.js frontend/BFF -> Express domain API -> MongoDB
```

## Ownership

The Next.js application owns presentation and browser interaction. It reads catalog data from the Express API and proxies authenticated administrator mutations. It never connects directly to MongoDB.

The JavaScript Express application owns product rules, reference data, integer minor-unit pricing, media metadata, administrator authentication and all MongoDB writes. Mongoose defines persistence models and Zod validates HTTP input.

## Domain storage

Reference collections hold garment definitions, themes and pricing rules. Products retain stable UUID `productId` and variant IDs while MongoDB `_id` values remain persistence details. Images are ordered subdocuments containing delivery metadata; binary files are stored by a replaceable storage adapter, not in MongoDB.

## Security

Administrator passwords are bcrypt hashes supplied through the environment. Successful login creates an opaque server-side session whose token is stored only as a keyed digest. The browser receives an HttpOnly, Strict SameSite cookie and a separate CSRF token for mutations. Production cookies are Secure.

## Operations

The idempotent JavaScript seed script upserts reference data and authoritative pricing without creating products. Docker Compose runs `frontend`, `backend`, and `mongodb`, with named volumes for database and development media persistence.
