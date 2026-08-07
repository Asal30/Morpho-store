import { ProductCard } from "@/features/catalog/product-card";
import type { Product } from "@/features/catalog/product.types";

export function ProductGrid({ products }: Readonly<{ products: readonly Product[] }>) {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-6 md:grid-cols-3 lg:gap-x-8 lg:gap-y-16">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
