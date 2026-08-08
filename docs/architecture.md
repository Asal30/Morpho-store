# MORPHO Store architecture status

The repository currently contains only the existing Next.js frontend.

The former API and database implementation have been removed. Frontend catalog and administration modules still define the integration boundary expected by the UI, but there is intentionally no server implementation in this cleanup phase.

The next backend phase must establish the API contract and infrastructure separately. Until then, data-dependent storefront and administration routes require an external compatible API to operate.
