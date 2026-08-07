import type { Product } from "@/features/catalog/product.types";

/**
 * Authoritative storefront product records belong here until the catalog moves
 * behind the API. This is deliberately empty: the repository does not yet
 * contain verified names, prices, variants, or product-to-image mappings.
 */
export const productData = [] as const satisfies readonly Product[];

