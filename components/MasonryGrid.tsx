import type { Product } from "@/types/database";
import ProductCard from "@/components/ProductCard";

export default function MasonryGrid({
  products,
  isAdmin = false,
}: {
  products: Product[];
  isAdmin?: boolean;
}) {
  if (products.length === 0) {
    return (
      <div className="rounded-card border border-dashed border-mist py-16 text-center">
        <p className="font-display text-lg font-bold text-ink">Nothing on the board yet</p>
        <p className="mt-1 text-sm text-ink/60">
          Once an admin adds a product, it shows up here.
        </p>
      </div>
    );
  }

  return (
    <div className="masonry columns-1 sm:columns-2 lg:columns-3 xl:columns-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} isAdmin={isAdmin} />
      ))}
    </div>
  );
}
